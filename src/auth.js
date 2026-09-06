import { supabase } from "./supabase.js";

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Failed to get current user:", error);
    return null;
  }

  return user;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signUp(email, password, profile = {}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: profile.name || "",
        degree: profile.degree || "BE ICT",
        start_year: profile.startYear || new Date().getFullYear(),
        target_direction:
          profile.target ||
          "AI Systems / AI Engineering + Systems",
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export function watchAuth(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}