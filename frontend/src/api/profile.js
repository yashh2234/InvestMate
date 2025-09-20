import client from "./client";

export async function apiUpdateUserProfile(data) {
  const { data: updated } = await client.put("/profile", data);
  return updated; // returns updated user object
}
