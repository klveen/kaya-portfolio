const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const nav = document.querySelector("[data-nav]");
const navLinks = [...document.querySelectorAll("[data-nav-link]")];
const sections = [...document.querySelectorAll("[data-nav-section]")];

const pinRunway = document.querySelector("[data-pin]");
const pinStage = pinRunway.querySelector(".pin-stage");
const pinPhoto = pinRunway.querySelector(".pin-photo");
const outcome = pinRunway.querySelector("[data-outcome]");

const reveals = [...document.querySelectorAll("[data-reveal]")].map((reveal) => {
  const pairs = [...reveal.querySelectorAll(".pair")];
  const order = pairs.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return {
    reveal,
    pairs,
    stepOfPair: new Map(order.map((pairIndex, step) => [pairIndex, step])),
  };
});

function updateNav() {
  const marker = nav.getBoundingClientRect().bottom + 8;
  let current = "info";
  let onDark = false;

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= marker && rect.bottom > marker) {
      current = section.dataset.navSection;
    }
    if ((section.classList.contains("profile") || section.classList.contains("contact")) && rect.top <= marker && rect.bottom > marker) {
      onDark = true;
    }
  });

  nav.classList.toggle("is-dark", onDark);
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.navLink === current);
  });
}

function updatePin() {
  if (motionQuery.matches || getComputedStyle(pinStage).position !== "sticky") {
    pinPhoto.style.transform = "";
    pinPhoto.style.opacity = "";
    pinStage.classList.remove("is-receiving");
    outcome.style.opacity = "";
    outcome.style.transform = "";
    return;
  }

  const lock = parseFloat(getComputedStyle(pinStage).top) || 0;
  const top = pinStage.getBoundingClientRect().top;
  const start = window.innerHeight * 0.55;
  const progress = (start - top) / Math.max(start - lock, 1);
  const arrive = Math.min(Math.max(progress, 0), 1);
  const fromRight = (1 - arrive) * 78;

  pinStage.classList.toggle("is-receiving", arrive < 0.98);
  pinPhoto.style.transform = `translate3d(${fromRight}%, 0, 0)`;
  pinPhoto.style.opacity = String(arrive);
  outcome.style.opacity = String(arrive);
  outcome.style.transform = `translateY(${(1 - arrive) * 28}px)`;
}

function updateReveal() {
  reveals.forEach(({ reveal, pairs, stepOfPair }) => {
    if (motionQuery.matches) {
      pairs.forEach((pair) => pair.classList.add("is-in"));
      return;
    }

    const top = reveal.getBoundingClientRect().top;
    const start = window.innerHeight * 0.9;
    const end = window.innerHeight * 0.34;
    const progress = Math.min(Math.max((start - top) / Math.max(start - end, 1), 0), 1);

    pairs.forEach((pair, index) => {
      const step = stepOfPair.get(index);
      const threshold = (step + 0.2) / pairs.length;
      pair.classList.toggle("is-in", progress >= threshold);
    });
  });
}

function update() {
  updateNav();
  updatePin();
  updateReveal();
}

let frame = 0;
function requestUpdate() {
  if (frame) return;
  frame = window.requestAnimationFrame(() => {
    frame = 0;
    update();
  });
}

update();
window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", requestUpdate);
motionQuery.addEventListener("change", requestUpdate);
