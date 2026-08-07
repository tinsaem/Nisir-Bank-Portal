// sessionStorage doesn't reliably survive a link opened in a new tab, but the
// real httpOnly session cookie does. Try the fast local cache first, and only
// fall back to asking the server (which reads the cookie) when it's empty —
// so a fresh tab on an already-logged-in browser doesn't get bounced to login.
export async function loadCurrentUser() {
  const stored = sessionStorage.getItem("currentUser");
  if (stored) return JSON.parse(stored);

  try {
    const res = await fetch("/api/me");
    const data = await res.json();
    if (data.success) {
      sessionStorage.setItem("currentUser", JSON.stringify(data.user));
      return data.user;
    }
  } catch {
    // Network error — treat as unauthenticated below.
  }

  return null;
}
