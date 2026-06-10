import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper } from "swiper";
import { Autoplay, Navigation, Pagination } from "swiper/modules";

import "../css/main.css";
import "../css/features.css";

import { initProducts, closeQuickView, initPetFinder } from "./products.js";
import { updateCartUI, toggleCart, restoreWishButtons, initCart } from "./cart.js";
import {
  setupImages,
  initTheme,
  initPromoBar,
  hideLoader,
  initNavbar,
  initKeyboard,
  initMagneticButtons,
  initUI,
} from "./ui.js";
import {
  initSmoothScroll,
  initScrollReveal,
  initHeroAnim,
  startCountUp,
  initTestimonialSlider,
  refreshScroll,
} from "./animations.js";
window.Swiper = Swiper;
Swiper.use([Autoplay, Navigation, Pagination]);

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initPromoBar();
  setupImages();
  updateCartUI();
  initProducts();
  initPetFinder();
  initNavbar();
  initKeyboard();
  initMagneticButtons();
  initTestimonialSlider();
  initSmoothScroll();
  initScrollReveal();
  initUI();
  initCart();

  document.getElementById("quickViewClose")?.addEventListener("click", closeQuickView);
  document.getElementById("quickView")?.addEventListener("click", (e) => {
    if (e.target.id === "quickView") closeQuickView();
  });

  document.getElementById("navSearch")?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    const q = e.target.value.trim();
    const shopSearch = document.getElementById("productSearch");
    if (shopSearch) shopSearch.value = q;
    document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
    shopSearch?.dispatchEvent(new Event("input", { bubbles: true }));
  });

  document.addEventListener("products:rendered", () => {
    restoreWishButtons();
    refreshScroll();
  });
});

window.addEventListener("load", () => {
  initHeroAnim();
  startCountUp();
  refreshScroll();
  setTimeout(hideLoader, 800);
});
