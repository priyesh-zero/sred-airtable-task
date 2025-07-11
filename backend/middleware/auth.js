const AirtableAuth = require("../models/AirtableAuth");
const jwt = require("jsonwebtoken");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.auth_token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const airtableAuth = await AirtableAuth.findOne({
      airtableId: decoded.airtableId,
    });

    if (!airtableAuth) {
      return res.status(400).json({
        success: false,
        message: "No connected Airtable account found",
      });
    }

    req.body.userId = airtableAuth._id;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = authMiddleware;
