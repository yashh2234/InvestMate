  // src/api/api.js
  // This re-exports all your existing API functions

  // Auth
  export { apiSignup, apiLogin, apiMe } from "./auth";

  // Products
  export { apiGetProducts, apiCreateProduct, apiUpdateProduct, apiDeleteProduct, apiGenerateProductDescription, apiGetRecommendedProducts } from "./products";

  // Investments
  export { apiGetInvestments, apiInvest, apiGetPortfolio, apiGetPortfolioInsights, apiGetPlatformStats } from "./investments";

  // Transaction Logs
  export { apiGetTransactionLogs } from "./transactionLogs";

  // User Profile
  export { apiUpdateUserProfile } from "./profile";
  
  // Password Reset
  export { apiRequestPasswordReset, apiResetPassword } from "./authReset";