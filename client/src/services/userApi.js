import { api } from "../lib/api";

export async function getMyProfile() {
  const { data } = await api.get("/api/me/profile");
  return data;
}

export async function updateMyProfile(payload) {
  const { data } = await api.patch("/api/me/profile", payload);
  return data;
}

export async function uploadAvatar(file) {
  const form = new FormData();
  form.append("dp", file);
  const { data } = await api.post("/api/me/avatar", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function getPublicUserProfile(userId) {
  const { data } = await api.get(`/api/public/profile/${userId}`);
  return data;
}
