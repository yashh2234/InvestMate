export function checkPasswordStrength(password) {
  const suggestions = [];

  if (!/[A-Z]/.test(password)) suggestions.push("Add at least one uppercase letter.");
  if (!/[a-z]/.test(password)) suggestions.push("Add at least one lowercase letter.");
  if (!/[0-9]/.test(password)) suggestions.push("Add at least one number.");
  if (!/[\W_]/.test(password)) suggestions.push("Add at least one special character.");
  if (password.length < 8) suggestions.push("Password must be at least 8 characters long.");

  return suggestions;
}
