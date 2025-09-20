import React from "react";
import zxcvbn from "zxcvbn";

export default function PasswordStrengthMeter({ password, suggestions = [] }) {
  if (!password) return null;

  // --- Base strength from zxcvbn ---
  const testResult = zxcvbn(password);
  let strength = testResult.score; // 0-4

  // --- AI penalty ---
  const penaltyKeywords = ["too short", "weak", "add", "missing"];
  const aiPenalty = suggestions.some(s =>
    penaltyKeywords.some(k => s.toLowerCase().includes(k))
  )
    ? 1
    : 0;
  const adjustedStrength = Math.max(0, strength - aiPenalty);

  const strengthPercent = ((adjustedStrength + 1) / 5) * 100;
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const label = strengthLabels[adjustedStrength];

  // --- Password rules ---
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  return (
    <div className="mt-2">
      {/* Gradient Strength Bar with tick marks */}
      <div className="relative h-2 w-full rounded bg-gray-200 overflow-hidden">
        {/* Gradient fill */}
        <div
          className="h-full rounded"
          style={{
            width: `${strengthPercent}%`,
            background: `linear-gradient(to right, #f56565, #ecc94b, #48bb78)`,
            transition: "width 0.5s ease-in-out",
          }}
        />

        {/* Tick marks */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-0 h-full w-[1px] bg-gray-400"
            style={{ left: `${(i / 4) * 100}%`, transform: "translateX(-50%)" }}
          />
        ))}
      </div>

      {/* Strength label */}
      <p className="text-sm font-medium text-gray-600 mt-1">{label}</p>

      {/* Password rules */}
      <ul className="text-sm mt-2 space-y-1">
        <li className={hasMinLength ? "text-green-600" : "text-red-600"}>
          {hasMinLength ? "✓" : "✗"} Minimum 8 characters
        </li>
        <li className={hasUpper ? "text-green-600" : "text-red-600"}>
          {hasUpper ? "✓" : "✗"} At least one uppercase letter
        </li>
        <li className={hasLower ? "text-green-600" : "text-red-600"}>
          {hasLower ? "✓" : "✗"} At least one lowercase letter
        </li>
        <li className={hasNumber ? "text-green-600" : "text-red-600"}>
          {hasNumber ? "✓" : "✗"} At least one number
        </li>
        <li className={hasSpecial ? "text-green-600" : "text-red-600"}>
          {hasSpecial ? "✓" : "✗"} At least one special character
        </li>
      </ul>

      {/* AI Suggestions */}
      {suggestions.length > 0 && (
        <div className="text-sm text-gray-700 mt-2">
          <p className="font-medium mb-1">AI Suggestions:</p>
          <ul className="list-disc list-inside space-y-1">
            {suggestions.map((s, idx) => (
              <li key={idx} className="text-red-600">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
