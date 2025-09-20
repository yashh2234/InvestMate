// src/api/auth.js
import client from "./client";

export async function apiSignup(payload) {
  // expected payload: { firstName, lastName, email, password }
  const { data } = await client.post("/auth/signup", payload);
  return data; // { token, user }
}

export async function apiLogin(payload) {
  // expected payload: { email, password }
  const { data } = await client.post("/auth/login", payload);
  localStorage.setItem("token", data.token); // store JWT
  return data; // { token, user }
}

export async function apiMe() {
  const { data } = await client.get("/auth/me");
  return data; // { user }
}
