const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const AirtableOAuth = require("../models/AirtableAuth");
const {
  generateCodeVerifier,
  generateCodeChallenge,
} = require("../helpers/pkce");

// Redirect user to Airtable's OAuth URL
exports.startAirtableOAuth = (req, res) => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString("hex");

  res.cookie("pkce_verifier", codeVerifier, {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
    maxAge: 10 * 60 * 1000, // 10 minutes
  });

  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "Lax",
    secure: false,
    maxAge: 10 * 60 * 1000,
  });

  const redirectUrl =
    `https://airtable.com/oauth2/v1/authorize` +
    `?client_id=${process.env.AIRTABLE_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(process.env.AIRTABLE_CALLBACK_URL)}` +
    `&response_type=code` +
    `&scope=data.records:read data.records:write schema.bases:read user.email:read` +
    `&state=${state}` +
    `&code_challenge=${codeChallenge}` +
    `&code_challenge_method=S256`;

  res.redirect(redirectUrl);
};

// Handle Airtable callback and exchange code for token
exports.handleAirtableOAuthCallback = async (req, res) => {
  const { code, state } = req.query;
  const codeVerifier = req.cookies.pkce_verifier;
  const savedState = req.cookies.oauth_state;

  if (!codeVerifier || !state || state !== savedState) {
    return res.status(400).json({
      success: false,
      error: "Invalid state or PKCE verifier",
    });
  }

  try {
    // Prepare token request
    const formData = new URLSearchParams();
    formData.append("grant_type", "authorization_code");
    formData.append("code", code);
    formData.append("redirect_uri", process.env.AIRTABLE_CALLBACK_URL);
    formData.append("code_verifier", codeVerifier);

    const basicAuth = Buffer.from(
      `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`,
    ).toString("base64");

    const tokenRes = await axios.post(
      "https://airtable.com/oauth2/v1/token",
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${basicAuth}`,
        },
      },
    );

    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      throw new Error("Access token not received from Airtable");
    }

    // Fetch user info
    const userRes = await axios.get("https://api.airtable.com/v0/meta/whoami", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { id: userId, email } = userRes.data || {};

    if (!userId || !email) {
      return res.status(403).json({
        success: false,
        error:
          "Airtable account is not fully active. Please visit airtable.com and complete account setup.",
      });
    }

    const connectedAt = new Date();

    await AirtableOAuth.updateOne(
      { userId },
      { userId, email, accessToken, connectedAt },
      { upsert: true },
    );

    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.clearCookie("pkce_verifier");
    res.clearCookie("oauth_state");

    res.redirect(`${process.env.CLIENT_URL}/airtable?sync=true`);
  } catch (err) {
    console.error("OAuth Error:", err.response?.data || err.message || err);
    return res.status(500).json({
      success: false,
      error: "Airtable authentication failed",
    });
  }
};

// Check connection status
exports.authStatus = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ isConnected: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const airtableAuth = await AirtableOAuth.findOne({
      userId: decoded.userId,
    });

    if (!airtableAuth) return res.status(404).json({ isConnected: false });

    res.json({
      isConnected: true,
      email: airtableAuth.email,
      connectedAt: airtableAuth.connectedAt,
    });
  } catch {
    return res.status(401).json({ isConnected: false });
  }
};

// Disconnect Airtable account
exports.logout = async (req, res) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) return res.status(401).json({ success: false });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    await AirtableOAuth.deleteOne({ userId: decoded.userId });

    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    });

    res.json({
      success: true,
      message: "Disconnected from Airtable successfully.",
    });
  } catch (err) {
    console.error("Logout Error:", err.message);
    res.status(500).json({ success: false, message: "Logout failed" });
  }
};
