import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

let lenis;

export function initSmoothScroll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on("scroll", () => {
    try {
      ScrollTrigger.update();
    } catch {}
  });
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
}

export function revealAll() {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("revealed"));
}

export function initScrollReveal() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    revealAll();
    return;
  }

  try {
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray(".reveal").forEach((el, i) => {
      gsap.fromTo(
        el,
        { y: 34, opacity: 0 },
        {
          scrollTrigger: { trigger: el, start: "top 90%", toggleActions: "play none none none" },
          duration: 0.72,
          y: 0,
          opacity: 1,
          ease: "power3.out",
          delay: (i % 5) * 0.065,
          onComplete: () => el.classList.add("revealed"),
        },
      );
    });
  } catch {
    fallbackReveal();
  }
}

function fallbackReveal() {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  setTimeout(revealAll, 2500);
}

export function initHeroAnim() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    revealAll();
    return;
  }

  try {
    gsap.from("#heroLeft > *", {
      duration: 0.85,
      y: 38,
      opacity: 0,
      stagger: 0.12,
      ease: "power3.out",
      delay: 0.1,
    });
    gsap.from("#heroRight", { duration: 1.1, x: 55, opacity: 0, ease: "power3.out", delay: 0.28 });
    gsap.from(".hero-card", {
      duration: 0.8,
      scale: 0.85,
      opacity: 0,
      stagger: 0.15,
      ease: "back.out(1.7)",
      delay: 0.9,
    });
  } catch {
    document.querySelectorAll("#heroLeft > *, #heroRight, .hero-card").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }
}

export function startCountUp() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseInt(el.dataset.count, 10);
    let start = 0;
    const inc = target / 65;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const timer = setInterval(() => {
              start = Math.min(start + inc, target);
              el.textContent = Math.floor(start).toLocaleString("en-IN") + "+";
              if (start >= target) {
                el.textContent = target.toLocaleString("en-IN") + "+";
                clearInterval(timer);
              }
            }, 22);
            obs.unobserve(el);
          }
        });
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
  });
}

export function initTestimonialSlider() {
  let curT = 0;
  const totalT = document.querySelectorAll(".testi-slide").length || 4;
  let autoT = setInterval(next, 4800);

  function go(n) {
    curT = n;
    const track = document.getElementById("testiTrack");
    if (track) track.style.transform = `translateX(-${n * 100}%)`;
    document.querySelectorAll(".s-dot").forEach((d, i) => d.classList.toggle("active", i === n));
  }
  function next() {
    go((curT + 1) % totalT);
  }
  function prev() {
    go((curT - 1 + totalT) % totalT);
  }

  document.getElementById("testiPrev")?.addEventListener("click", prev);
  document.getElementById("testiNext")?.addEventListener("click", next);

  document.querySelectorAll(".s-dot").forEach((d) => {
    d.addEventListener("click", () => {
      const idx = parseInt(d.dataset.index, 10);
      if (!isNaN(idx)) go(idx);
    });
  });

  const ts = document.getElementById("testiSlider");
  if (!ts) return;
  ts.addEventListener("mouseenter", () => clearInterval(autoT));
  ts.addEventListener("mouseleave", () => {
    autoT = setInterval(next, 4800);
  });
  ts.addEventListener("touchstart", (e) => {
    ts._tx = e.touches[0].clientX;
  }, { passive: true });
  ts.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - ts._tx;
    if (Math.abs(dx) > 50) dx > 0 ? prev() : next();
  });
}

export function refreshScroll() {
  try {
    ScrollTrigger.refresh();
  } catch {}
}
