import {
  getCurrentUser,
  watchAuth,
  signOut,
} from "./auth.js";

export async function initializeAuth({
  onAuthenticated,
  onUnauthenticated,
}) {
  const user = await getCurrentUser();

  if (user) {
    await onAuthenticated(user);
  } else {
    onUnauthenticated();
  }

  watchAuth(async (event, session) => {
    if (session?.user) {
      await onAuthenticated(session.user);
    } else if (
      event === "SIGNED_OUT" ||
      event === "INITIAL_SESSION"
    ) {
      onUnauthenticated();
    }
  });
}

export async function logout() {
  await signOut();
}