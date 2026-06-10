export const DEMO_PET_IMG =
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=460&q=80&auto=format&fit=crop";
export const WA_BASE = "https://wa.me/919939584755";

export function formatINR(n) {
  return "₹" + Number(n).toLocaleString("en-IN");
}

export function stars(rating) {
  const full = "★".repeat(rating);
  const empty = "☆".repeat(5 - rating);
  return full + empty;
}

export function saveJSON(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function waOrderText(name, price) {
  return (
    WA_BASE +
    "?text=" +
    encodeURIComponent(`Hello DOG MART, I want to order: ${name} ${formatINR(price)}`)
  );
}
