import { formatINR, loadJSON, saveJSON, WA_BASE } from "./utils.js";
import { showToast } from "./ui.js";

const CART_KEY = "dogmart_cart_v1";
const WISH_KEY = "dogmart_wishlist_v1";

let cart = loadJSON(CART_KEY, []);
let wishes = loadJSON(WISH_KEY, []);

export function getCart() {
  return cart;
}

export function updateCartUI() {
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const badge = document.getElementById("cartBadge");
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle("has-items", count > 0);
  }

  const body = document.getElementById("cartBody");
  const foot = document.getElementById("cartFoot");
  if (!body) return;

  if (!cart.length) {
    body.innerHTML =
      '<div class="cart-empty"><span>🐾</span>Your cart is empty.<br><small style="color:var(--gray);margin-top:8px;display:block">Add products from the shop!</small></div>';
    if (foot) foot.style.display = "none";
    return;
  }

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const fallback =
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=120&q=80&auto=format&fit=crop";

  body.innerHTML = cart
    .map(
      (item, idx) => `
    <div class="cart-item">
      <img src="${item.img}" alt="" referrerpolicy="no-referrer" onerror="this.src='${fallback}'">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">${formatINR(item.price)} × ${item.qty}</div>
        <button class="cart-item-rm" data-idx="${idx}">Remove</button>
      </div>
    </div>`,
    )
    .join("");

  body.querySelectorAll(".cart-item-rm").forEach((btn) => {
    btn.addEventListener("click", () => removeFromCart(+btn.dataset.idx));
  });

  const totalEl = document.getElementById("cartTotal");
  if (totalEl) totalEl.textContent = formatINR(total);

  const checkout = document.getElementById("cartCheckout");
  if (checkout) {
    const lines = cart
      .map((i) => `${i.name} x${i.qty} (${formatINR(i.price * i.qty)})`)
      .join("%0A");
    checkout.href =
      WA_BASE +
      "?text=" +
      encodeURIComponent(
        "Hello DOG MART, I want to order:\n" +
          cart.map((i) => `${i.name} x${i.qty} (${formatINR(i.price * i.qty)})`).join("\n") +
          "\nTotal: " +
          formatINR(total),
      );
  }
  if (foot) foot.style.display = "block";
}

export function addToCart(item) {
  const existing = cart.find((i) => i.id === item.id || i.name === item.name);
  if (existing) existing.qty++;
  else cart.push({ ...item, qty: 1 });
  saveJSON(CART_KEY, cart);
  updateCartUI();
  showToast("🛒 Added to cart! " + cart.reduce((s, i) => s + i.qty, 0) + " item(s)");
}

export function removeFromCart(idx) {
  cart.splice(idx, 1);
  saveJSON(CART_KEY, cart);
  updateCartUI();
  showToast("🗑️ Item removed from cart");
}

export function toggleCart(force) {
  const panel = document.getElementById("cartPanel");
  const overlay = document.getElementById("cartOverlay");
  const open = typeof force === "boolean" ? force : !panel.classList.contains("open");
  panel?.classList.toggle("open", open);
  overlay?.classList.toggle("open", open);
  document.body.style.overflow = open ? "hidden" : "";
  if (open) updateCartUI();
}

export function isWished(name) {
  return wishes.includes(name);
}

export function toggleWish(name) {
  const active = wishes.includes(name);
  if (active) wishes = wishes.filter((w) => w !== name);
  else wishes.push(name);
  saveJSON(WISH_KEY, wishes);
  showToast(active ? "💔 Removed from wishlist" : "❤️ Added to wishlist!");
  return !active;
}

export function restoreWishButtons() {
  document.querySelectorAll(".p-wish").forEach((btn) => {
    const name = btn.dataset.name;
    if (name && isWished(name)) {
      btn.dataset.wished = "1";
      btn.textContent = "♥";
      btn.style.color = "#EF4444";
    }
  });
}

export function initCart() {
  document.getElementById("cartToggleBtn")?.addEventListener("click", () => toggleCart());
  document.getElementById("cartOverlay")?.addEventListener("click", () => toggleCart(false));
  document.getElementById("cartClose")?.addEventListener("click", () => toggleCart(false));
}
