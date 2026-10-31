// Same thresholds as UI: 0-50 green, 50-75 olive-yellow, 75-100 orange, 100+ red
export function healthLevel(percent) {
  if (percent >= 100) return "danger";
  if (percent >= 75) return "warning";
  if (percent >= 50) return "caution";
  return "safe";
}
