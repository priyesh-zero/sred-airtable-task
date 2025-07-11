const crypto = require("crypto");

function generateCodeVerifier() {
  return crypto.randomBytes(32).toString("base64url");
}

function generateCodeChallenge(verifier) {
  const hash = crypto.createHash("sha256").update(verifier).digest();
  return Buffer.from(hash).toString("base64url");
}

module.exports = {
  generateCodeVerifier,
  generateCodeChallenge,
};
