import { saveJSON, loadJSON } from "./utils.js";

const THEME_KEY = "dogmart_theme";
const PROMO_KEY = "dogmart_promo_dismissed";

export function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2800);
}

export function toggleMenu() {
  const m = document.getElementById("mobileMenu");
  m.classList.toggle("open");
  document.body.style.overflow = m.classList.contains("open") ? "hidden" : "";
}

export function openLB(src) {
  document.getElementById("lbImg").src = src;
  document.getElementById("lightbox").classList.add("open");
  document.body.style.overflow = "hidden";
}

export function closeLB() {
  document.getElementById("lightbox").classList.remove("open");
  if (!document.getElementById("cartPanel")?.classList.contains("open"))
    document.body.style.overflow = "";
}

export function setupImages() {
  const fallback =
    "https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=460&q=80&auto=format&fit=crop";
  document.querySelectorAll("img").forEach((img) => {
    if (!img.referrerPolicy) img.referrerPolicy = "no-referrer";
    img.classList.add("img-loading");
    img.addEventListener("load", () => img.classList.remove("img-loading"), { once: true });
    img.addEventListener(
      "error",
      function () {
        if (this.dataset.fallback) return;
        this.dataset.fallback = "1";
        this.classList.remove("img-loading");
        this.classList.add("img-error");
        this.src = fallback;
      },
      { once: true },
    );
  });
}

export function initTheme() {
  const saved = loadJSON(THEME_KEY, null);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = saved === "dark" || (saved === null && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
  updateThemeBtn(dark);
}

export function toggleTheme() {
  const dark = !document.documentElement.classList.contains("dark");
  document.documentElement.classList.toggle("dark", dark);
  saveJSON(THEME_KEY, dark ? "dark" : "light");
  updateThemeBtn(dark);
}

function updateThemeBtn(dark) {
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = dark ? "☀️" : "🌙";
}

export function initPromoBar() {
  if (loadJSON(PROMO_KEY, false)) {
    document.getElementById("promoBar")?.remove();
    return;
  }
  document.getElementById("promoClose")?.addEventListener("click", () => {
    saveJSON(PROMO_KEY, true);
    document.getElementById("promoBar")?.classList.add("hide");
    setTimeout(() => document.getElementById("promoBar")?.remove(), 400);
  });
}

export function hideLoader() {
  const loader = document.getElementById("pageLoader");
  if (!loader) return;
  loader.classList.add("hide");
  setTimeout(() => loader.remove(), 600);
}

export function initNavbar() {
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar?.classList.toggle("scrolled", window.scrollY > 40);
    document.getElementById("backTop")?.classList.toggle("visible", window.scrollY > 400);
  });

  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a");
  const navObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((a) => {
            a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
          });
        }
      });
    },
    { threshold: 0.35, rootMargin: "-80px 0px -55% 0px" },
  );
  sections.forEach((s) => navObs.observe(s));
}

export function initKeyboard() {
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeLB();
    document.getElementById("quickView")?.classList.remove("open");
    document.getElementById("cartPanel")?.classList.remove("open");
    document.getElementById("cartOverlay")?.classList.remove("open");
    const m = document.getElementById("mobileMenu");
    if (m?.classList.contains("open")) toggleMenu();
    document.body.style.overflow = "";
  });
}

export function initMagneticButtons() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll(".btn-primary,.btn-wa,.btn-lg").forEach((btn) => {
    btn.addEventListener("mousemove", function (e) {
      const r = this.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.14;
      const y = (e.clientY - r.top - r.height / 2) * 0.14;
      this.style.transform = `translate(${x}px,${y}px) translateY(-2px) scale(1.02)`;
    });
    btn.addEventListener("mouseleave", function () {
      this.style.transform = "";
    });
  });
}

export function initUI() {
  // Bind Theme Toggle
  document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);

  // Bind Hamburger Menu
  document.getElementById("ham")?.addEventListener("click", toggleMenu);
  document.getElementById("mobileMenuClose")?.addEventListener("click", toggleMenu);
  document.querySelectorAll("#mobileMenu > a").forEach(link => {
    link.addEventListener("click", toggleMenu);
  });

  // Bind Lightbox gallery
  document.querySelectorAll(".gal-item").forEach(item => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      if (img) openLB(img.src);
    });
  });

  // Bind Lightbox close
  document.getElementById("lightbox")?.addEventListener("click", (e) => {
    if (e.target.id === "lightbox") closeLB();
  });
  document.getElementById("lightboxClose")?.addEventListener("click", (e) => {
    e.stopPropagation();
    closeLB();
  });

  // Bind Back to Top
  document.getElementById("backTop")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Set Copyright Year
  const yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
