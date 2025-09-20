// backend/utils/passwordStrength.js

function checkPasswordStrength({ password = "", firstName = "", lastName = "", email = "" }) {
  const suggestions = [];
  const pwdLower = password.toLowerCase();

  const commonPasswords = ["password", "123456", "qwerty", "abc123", "letmein", "admin"];
  if (commonPasswords.some(p => pwdLower.includes(p))) {
    suggestions.push("Avoid common passwords like 'qwerty' or '123456'");
  }

  const sequentialPatterns = ["1234", "abcd", "1111", "0000"];
  if (sequentialPatterns.some(p => pwdLower.includes(p))) {
    suggestions.push("Avoid sequential numbers or letters like 1234 or abcd");
  }

  if (/([a-zA-Z0-9])\1\1/.test(password)) {
    suggestions.push("Avoid repeated characters like 'aaa' or '111'");
  }

  if (password.length < 12) {
    suggestions.push("Consider making your password longer than 12 characters");
  }

  if (firstName && pwdLower.includes(firstName.toLowerCase())) {
    suggestions.push("Avoid using your first name in the password");
  }
  if (lastName && pwdLower.includes(lastName.toLowerCase())) {
    suggestions.push("Avoid using your last name in the password");
  }

  return suggestions;
}

module.exports = { checkPasswordStrength };
