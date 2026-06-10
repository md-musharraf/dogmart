import productsData from "../data/products.json";
import faqData from "../data/faq.json";
import { formatINR, stars, waOrderText, saveJSON, loadJSON, DEMO_PET_IMG } from "./utils.js";
import { addToCart, toggleWish, isWished } from "./cart.js";
import { showToast } from "./ui.js";

const RECENT_KEY = "dogmart_recent_v1";
let allProducts = productsData;
let filters = { search: "", category: "all", pet: "all", sort: "popular" };

const CATEGORY_LABELS = {
  "dog-food": "Dog Food",
  "cat-food": "Cat Food",
  supplements: "Supplements",
  grooming: "Grooming",
  toys: "Toys",
  accessories: "Accessories",
  beds: "Pet Beds",
  bowls: "Bowls",
};

export function initProducts() {
  renderProducts();
  renderFAQ();
  initFilters();
  initFeaturedSwiper();
  initCategoryFilters();
  initFooterCategoryFilters();
  const recent = loadJSON(RECENT_KEY, []);
  if (recent.length) renderRecent(recent);
}

function badgeClass(badge) {
  if (badge === "sale") return "badge-sale";
  if (badge === "new") return "badge-new";
  if (badge === "hot") return "badge-hot";
  return "";
}

function productCard(p) {
  const saveAmt = p.original - p.price;
  const savePct = p.original ? Math.round((saveAmt / p.original) * 100) : 0;
  const wished = isWished(p.name);
  const thumb = p.img.replace("w=460", "w=120");

  return `
  <div class="prod-card reveal" data-id="${p.id}" data-category="${p.category}" data-pet="${p.pet}">
    <div class="prod-img-wrap">
      <img src="${p.img}" alt="${p.name}" loading="lazy" referrerpolicy="no-referrer">
      ${p.badge ? `<span class="p-badge ${badgeClass(p.badge)}">${p.badgeText || ""}</span>` : ""}
      <button class="p-wish" data-name="${p.name}" data-wished="${wished ? "1" : "0"}" aria-label="Wishlist">${wished ? "♥" : "♡"}</button>
      <button class="p-qv" data-id="${p.id}">👁 Quick View</button>
    </div>
    <div class="prod-body">
      <div class="prod-brand">${p.brand}</div>
      <div class="prod-name">${p.name}</div>
      <div class="prod-stars"><span class="stars">${stars(p.rating)}</span><span class="rev-ct">(${p.reviews} reviews)</span></div>
      <div class="prod-price">
        <span class="p-cur">${formatINR(p.price)}</span>
        ${p.original ? `<span class="p-orig">${formatINR(p.original)}</span>` : ""}
        ${saveAmt > 0 ? `<span class="p-save">Save ${savePct}%</span>` : ""}
      </div>
      <div class="prod-actions">
        <button class="btn-cart" data-id="${p.id}">🛒 Add to Cart</button>
        <a class="btn-wabuy" href="${waOrderText(p.name, p.price)}" target="_blank" title="Buy on WhatsApp">💬</a>
      </div>
    </div>
  </div>`;
}

function getFiltered() {
  let list = [...allProducts];

  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (CATEGORY_LABELS[p.category] || "").toLowerCase().includes(q),
    );
  }
  if (filters.category !== "all") list = list.filter((p) => p.category === filters.category);
  if (filters.pet !== "all") list = list.filter((p) => p.pet === filters.pet);

  switch (filters.sort) {
    case "price-low":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-high":
      list.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
      break;
    default:
      list.sort((a, b) => b.reviews - a.reviews);
  }
  return list;
}

export function renderProducts() {
  const grid = document.getElementById("productGrid");
  const empty = document.getElementById("productEmpty");
  if (!grid) return;

  const list = getFiltered();
  grid.innerHTML = list.map(productCard).join("");
  if (empty) empty.hidden = list.length > 0;

  bindProductEvents(grid);
  document.dispatchEvent(new CustomEvent("products:rendered"));
}

function bindProductEvents(grid) {
  grid.querySelectorAll(".btn-cart").forEach((btn) => {
    btn.addEventListener("click", () => {
      const p = allProducts.find((x) => x.id === btn.dataset.id);
      if (!p) return;
      addToCart({ id: p.id, name: p.name, price: p.price, img: p.img.replace("w=460", "w=120") });
      const orig = btn.innerHTML;
      btn.innerHTML = "✅ Added!";
      btn.classList.add("added");
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.classList.remove("added");
      }, 1600);
      trackRecent(p.id);
    });
  });

  grid.querySelectorAll(".p-wish").forEach((btn) => {
    if (btn.dataset.wished === "1") btn.style.color = "#EF4444";
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const on = toggleWish(btn.dataset.name);
      btn.dataset.wished = on ? "1" : "0";
      btn.textContent = on ? "♥" : "♡";
      btn.style.color = on ? "#EF4444" : "";
    });
  });

  grid.querySelectorAll(".p-qv").forEach((btn) => {
    btn.addEventListener("click", () => openQuickView(btn.dataset.id));
  });
}

function initFilters() {
  const search = document.getElementById("productSearch");
  const cat = document.getElementById("filterCategory");
  const pet = document.getElementById("filterPet");
  const sort = document.getElementById("filterSort");

  search?.addEventListener("input", (e) => {
    filters.search = e.target.value.trim();
    renderProducts();
  });
  cat?.addEventListener("change", (e) => {
    filters.category = e.target.value;
    renderProducts();
  });
  pet?.addEventListener("change", (e) => {
    filters.pet = e.target.value;
    renderProducts();
  });
  sort?.addEventListener("change", (e) => {
    filters.sort = e.target.value;
    renderProducts();
  });
}

function initCategoryFilters() {
  document.querySelectorAll(".cat-card").forEach((card) => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      const f = card.dataset.filter || "all";
      filters.category = f;
      document.querySelectorAll(".cat-card").forEach((c) => c.classList.remove("active-filter"));
      card.classList.add("active-filter");
      const sel = document.getElementById("filterCategory");
      if (sel) sel.value = f;
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
      renderProducts();
    });
  });
}

function initFooterCategoryFilters() {
  document.querySelectorAll("#footerCategories a").forEach((link) => {
    link.addEventListener("click", (e) => {
      const f = link.dataset.filter;
      if (!f) return;
      e.preventDefault();
      
      filters.category = f;
      
      const sel = document.getElementById("filterCategory");
      if (sel) sel.value = f;
      
      document.querySelectorAll(".cat-card").forEach((card) => {
        if (card.dataset.filter === f) {
          card.classList.add("active-filter");
        } else {
          card.classList.remove("active-filter");
        }
      });
      
      renderProducts();
      document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
    });
  });
}

function trackRecent(id) {
  let recent = loadJSON(RECENT_KEY, []);
  recent = [id, ...recent.filter((x) => x !== id)].slice(0, 4);
  saveJSON(RECENT_KEY, recent);
  renderRecent(recent);
}

function renderRecent(ids) {
  const section = document.getElementById("recentSection");
  const grid = document.getElementById("recentGrid");
  if (!section || !grid) return;
  const items = ids.map((id) => allProducts.find((p) => p.id === id)).filter(Boolean);
  if (!items.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;
  grid.innerHTML = items.map(productCard).join("");
  bindProductEvents(grid);
}

export function openQuickView(id) {
  const p = allProducts.find((x) => x.id === id);
  if (!p) return;
  trackRecent(p.id);

  const modal = document.getElementById("quickView");
  modal.querySelector(".qv-img").src = p.img;
  modal.querySelector(".qv-brand").textContent = p.brand;
  modal.querySelector(".qv-name").textContent = p.name;
  modal.querySelector(".qv-stars").innerHTML = `<span class="stars">${stars(p.rating)}</span> (${p.reviews} reviews)`;
  modal.querySelector(".qv-price").textContent = formatINR(p.price);
  modal.querySelector(".qv-desc").textContent = `Premium ${CATEGORY_LABELS[p.category] || "pet product"} for ${p.pet === "cat" ? "cats" : "dogs"}. Genuine ${p.brand} — available at DOG MART Dumka with fast delivery.`;

  const addBtn = modal.querySelector(".qv-add");
  addBtn.onclick = () => {
    addToCart({ id: p.id, name: p.name, price: p.price, img: p.img.replace("w=460", "w=120") });
  };
  modal.querySelector(".qv-wa").href = waOrderText(p.name, p.price);

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

export function closeQuickView() {
  document.getElementById("quickView")?.classList.remove("open");
  if (!document.getElementById("cartPanel")?.classList.contains("open"))
    document.body.style.overflow = "";
}

function renderFAQ() {
  const wrap = document.getElementById("faqList");
  if (!wrap) return;
  wrap.innerHTML = faqData
    .map(
      (item, i) => `
    <div class="faq-item reveal">
      <button class="faq-q" aria-expanded="false" data-faq="${i}">
        <span>${item.q}</span>
        <span class="faq-icon">+</span>
      </button>
      <div class="faq-a"><p>${item.a}</p></div>
    </div>`,
    )
    .join("");

  wrap.querySelectorAll(".faq-q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".faq-item");
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
      wrap.querySelectorAll(".faq-item").forEach((el) => {
        if (el !== item) {
          el.classList.remove("open");
          el.querySelector(".faq-q")?.setAttribute("aria-expanded", "false");
        }
      });
    });
  });
}

function initFeaturedSwiper() {
  const el = document.getElementById("featuredSwiper");
  if (!el || typeof window.Swiper === "undefined") return;

  const featured = allProducts.filter((p) => p.featured);
  el.innerHTML = `
    <div class="swiper-wrapper">
      ${featured
        .map(
          (p) => `
        <div class="swiper-slide">
          <div class="feat-card">
            <img src="${p.img}" alt="${p.name}" referrerpolicy="no-referrer">
            <div class="feat-info">
              <span class="feat-brand">${p.brand}</span>
              <h3>${p.name}</h3>
              <p class="feat-price">${formatINR(p.price)}</p>
              <button class="btn btn-primary btn-sm" data-feat="${p.id}">Shop Now →</button>
            </div>
          </div>
        </div>`,
        )
        .join("")}
    </div>
    <div class="swiper-pagination"></div>
    <div class="swiper-button-prev"></div>
    <div class="swiper-button-next"></div>`;

  new window.Swiper(el, {
    slidesPerView: 1,
    spaceBetween: 20,
    loop: true,
    autoplay: { delay: 4000, disableOnInteraction: false },
    pagination: { el: ".swiper-pagination", clickable: true },
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } },
  });

  el.querySelectorAll("[data-feat]").forEach((btn) => {
    btn.addEventListener("click", () => openQuickView(btn.dataset.feat));
  });
}

export function initPetFinder() {
  const form = document.getElementById("petFinderForm");
  const result = document.getElementById("petFinderResult");
  if (!form || !result) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const pet = form.petType.value;
    const age = form.petAge.value;
    const size = form.petSize?.value || "medium";

    let category = pet === "cat" ? "cat-food" : "dog-food";
    if (age === "senior") category = "supplements";

    filters.pet = pet;
    filters.category = category;
    document.getElementById("filterPet").value = pet;
    document.getElementById("filterCategory").value = category;

    const match = allProducts.find((p) => p.pet === pet && p.category === category);
    const alt = allProducts.find((p) => p.pet === pet);

    result.hidden = false;
    result.innerHTML = `
      <div class="finder-result-card reveal">
        <span class="finder-emoji">${pet === "cat" ? "🐱" : "🐕"}</span>
        <h4>We recommend for your ${size} ${pet}</h4>
        <p>${match ? match.name : alt?.name || "Royal Canin or Whiskas range"} — browse matched products below!</p>
        <button type="button" class="btn btn-primary" id="finderShopBtn">View Products →</button>
      </div>`;

    result.querySelector("#finderShopBtn").addEventListener("click", () => {
      renderProducts();
      document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
    });
  });
}
