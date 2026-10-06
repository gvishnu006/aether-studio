/* ============ AETHER · Interactions ============ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const coarse = window.matchMedia("(pointer: coarse)").matches;

/* ---------- Preloader ---------- */
let progress = 0;
const barEl = $(".preloader__bar i");
const countEl = $("#preloaderCount");

function tickLoader() {
  progress += Math.random() * 16 + 6;
  if (progress > 100) progress = 100;
  barEl.style.width = progress + "%";
  countEl.textContent = Math.floor(progress);
  if (progress < 100) {
    setTimeout(tickLoader, 80 + Math.random() * 120);
  } else {
    setTimeout(() => {
      $("#preloader").classList.add("done");
      document.body.style.overflow = "";
      startReveals();
    }, 350);
  }
}

function startReveals() {
  $$(".line").forEach((l, i) => setTimeout(() => l.classList.add("in"), 150 + i * 140));
  $$(".hero__eyebrow, .hero__sub, .hero__actions").forEach((el, i) => {
    el.classList.add("in-view");
  });
  requestAnimationFrame(() => {
    $$("main .reveal-fade, main .reveal-rise, .footer .reveal-fade").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) el.classList.add("in-view");
    });
  });
}

document.body.style.overflow = "hidden";
window.addEventListener("load", () => {
  setTimeout(tickLoader, 240);
});

/* ---------- Custom cursor (magnetic + grow) ---------- */
const cursor = $(".cursor");
const follower = $(".cursor-follower");
let mouseX = -100, mouseY = -100, folX = -100, folY = -100;

if (!coarse && !reduceMotion) {
  document.body.classList.add("has-cursor");
  window.addEventListener("pointermove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + "px";
    cursor.style.top = mouseY + "px";
  });
  (function loop() {
    folX += (mouseX - folX) * 0.16;
    folY += (mouseY - folY) * 0.16;
    follower.style.left = folX + "px";
    follower.style.top = folY + "px";
    requestAnimationFrame(loop);
  })();

  const growOn = "a, button, [data-tilt], [data-work], input, textarea";
  document.addEventListener("pointerover", (e) => {
    if (e.target.closest(growOn)) {
      follower.style.width = "64px";
      follower.style.height = "64px";
      follower.style.borderColor = "transparent";
      follower.style.background = "rgba(124,92,255,.35)";
    }
  });
  document.addEventListener("pointerout", (e) => {
    if (e.target.closest(growOn)) {
      follower.style.width = "38px";
      follower.style.height = "38px";
      follower.style.borderColor = "rgba(255,255,255,.5)";
      follower.style.background = "transparent";
    }
  });
}

/* ---------- Nav: scrolled + hide on scroll down ---------- */
const nav = $("[data-nav]");
let lastY = 0;

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  nav.classList.toggle("scrolled", y > 40);
  if (y > lastY && y > 500 && !menuOpen) nav.classList.add("hidden-nav");
  else nav.classList.remove("hidden-nav");
  lastY = y;
}, { passive: true });

/* ---------- Mobile menu ---------- */
const burger = $("[data-burger]");
const menu = $("[data-menu]");
let menuOpen = false;

function setMenu(open) {
  menuOpen = open;
  burger.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  menu.classList.toggle("open", open);
  menu.setAttribute("aria-hidden", String(!open));
  document.body.style.overflow = open ? "hidden" : "";
  if (open) {
    $$(".menu a").forEach((a, i) => {
      a.style.transitionDelay = (0.1 + i * 0.07) + "s";
      a.style.opacity = "1";
      a.style.transform = "translateY(0)";
    });
  } else {
    $$(".menu a").forEach((a) => {
      a.style.transitionDelay = "0s";
      a.style.opacity = "0";
      a.style.transform = "translateY(30px)";
    });
  }
}

burger.addEventListener("click", () => setMenu(!menuOpen));
$$(".menu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

/* ---------- Scroll reveal (IntersectionObserver) ---------- */
const revealEls = $$(".reveal-fade, .reveal-rise, .line:not(.in)");
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in-view");
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });

revealEls.forEach((el) => io.observe(el));

/* Highlight <em> underline when its parent section scrolls into view */
const emIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      $$("em[data-text]", entry.target).forEach((em) => em.classList.add("under"));
    }
  });
}, { threshold: 0.25 });
$$(".section-title").forEach((t) => emIO.observe(t));

/* ---------- Tilt cards with pointer glare ---------- */
$$("[data-tilt]").forEach((card) => {
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (0.5 - py) * 14;
    const ry = (px - 0.5) * 14;
    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    card.style.setProperty("--mx", px * 100 + "%");
    card.style.setProperty("--my", py * 100 + "%");
  });
  card.addEventListener("pointerleave", () => {
    card.style.transform = "perspective(800px) rotateX(0) rotateY(0) translateY(0)";
  });
});

/* ---------- Magnetic buttons ---------- */
$$(".magnetic").forEach((el) => {
  if (reduceMotion) return;
  el.addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.transform = `translate(${dx * 0.28}px, ${dy * 0.28}px)`;
  });
  el.addEventListener("pointerleave", () => {
    el.style.transition = "transform .5s var(--ease-expo)";
    el.style.transform = "translate(0,0)";
    setTimeout(() => (el.style.transition = ""), 500);
  });
});

/* ---------- Stats counter ---------- */
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.count;
    let cur = 0;
    const step = Math.max(1, Math.round(target / 60));
    countIO.unobserve(el);
    const run = () => {
      cur += step;
      if (cur >= target) {
        el.textContent = target;
        return;
      }
      el.textContent = cur;
      requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
  });
}, { threshold: 0.5 });
$$("[data-count]").forEach((el) => countIO.observe(el));

/* ---------- Reveal em underline on scroll for contact title ---------- */
const contactTitle = $(".contact__title em");
if (contactTitle) {
  const cIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) contactTitle.classList.add("under");
    });
  }, { threshold: 0.3 });
  cIO.observe(contactTitle);
}

/* ---------- Keyboard: close menu on Escape ---------- */
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menuOpen) setMenu(false);
});

/* ---------- Safe-area fallback: reveal all lines if JS load delayed ---------- */
setTimeout(() => {
  if (progress < 100) $$(".line").forEach((l) => l.classList.add("in"));
}, 6000);