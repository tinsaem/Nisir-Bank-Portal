// Derives the experimental group from an Employee ID. Robust to both the
// "Emp001" format used in the research instrument and the "EMP-001" format
// used by this portal's account seeding — only the embedded digits matter.
//
// Emp001–Emp035 -> gain frame
// Emp036–Emp070 -> loss frame
// Emp071–Emp105 -> control (no incentive)
export function getParticipantGroup(employeeId) {
  const match = String(employeeId ?? "").match(/(\d+)/);
  const num = match ? parseInt(match[1], 10) : NaN;

  if (num >= 1 && num <= 35) return "gain";
  if (num >= 36 && num <= 70) return "loss";
  if (num >= 71 && num <= 105) return "control";
  return "unknown";
}

export const GROUP_LABELS = {
  gain: "Gain Frame",
  loss: "Loss Frame",
  control: "Control",
  unknown: "Unknown",
};
