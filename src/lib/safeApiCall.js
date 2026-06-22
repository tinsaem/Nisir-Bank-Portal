// Participant-facing actions must never surface a network/API failure as a
// broken interaction — the simulation has to feel seamless. Errors are
// logged for debugging but the UI always proceeds to its success state.
export async function safeApiCall(apiCall, fallbackAction) {
  try {
    return await apiCall();
  } catch (error) {
    console.error("API error (hidden from participant):", error);
    if (fallbackAction) fallbackAction();
    return null;
  }
}
