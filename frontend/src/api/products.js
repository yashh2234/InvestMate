// frontend/src/api/products.js
import client from "./client";

export async function apiGetProducts() {
  const { data } = await client.get("/products");
  return data;
}

export async function apiCreateProduct(payload) {
  // payload: { name, investment_type, tenure_months, annual_yield, risk_level, min_investment, max_investment, description }
  const { data } = await client.post("/products", payload);
  return data;
}

// Update a product (admin only)
export async function apiUpdateProduct(id, payload) {
  const { data } = await client.put(`/products/${id}`, payload);
  return data;
}

// Delete a product (admin only)
export async function apiDeleteProduct(id) {
  const { data } = await client.delete(`/products/${id}`);
  return data;
}

// Generate product description using backend
export async function apiGenerateProductDescription(payload) {
  const { data } = await client.post("/products/generate-description", payload);
  return data.description;
}

// Fetch recommended products for a user
export async function apiGetRecommendedProducts() {
  const { data } = await client.get("/products/recommended");
  return data; // array of products
}
