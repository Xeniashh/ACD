const stage = document.getElementById("cardsStage");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

const cardsData = [
  { image: "images/card-1.jpg", link: "tut.html" },
  { image: "images/card-2.jpg", link: "tut.html" },
  { image: "images/card-3.jpg", link: "tut.html" },
  { image: "images/card-4.jpg", link: "tut.html" }
];

let currentIndex = 0;
let isAnimating = false;

let startX = 0;
let currentX = 0;
let isDragging = false;
let isSwipeIntent = false;

const SWIPE_THRESHOLD = 80;
const CLICK_CANCEL_THRESHOLD = 8;
const ANIMATION_DURATION = 550;

if (stage) {
  renderCards();
  bindStageEvents();
}

if (nextBtn) {
  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    nextSlide();
  });
}

if (prevBtn) {
  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    prevSlide();
  });
}

function getVisibleCards() {
  const visible = [];
  const visibleCount = Math.min(4, cardsData.length);

  for (let i = 0; i < visibleCount; i++) {
    const index = (currentIndex + i) % cardsData.length;
    visible.push(cardsData[index]);
  }

  return visible;
}

function renderCards() {
  if (!stage) return;

  stage.innerHTML = "";

  const visibleCards = getVisibleCards();

  visibleCards
    .slice()
    .reverse()
    .forEach((card, reverseIndex) => {
      const visualIndex = visibleCards.length - 1 - reverseIndex;

      const el = document.createElement("a");
      el.href = card.link;
      el.className = "task-card";
      el.dataset.position = String(visualIndex);

      el.innerHTML = `
        <img
          src="${card.image}"
          class="task-card__image"
          alt=""
          draggable="false"
        >
      `;

      el.addEventListener("dragstart", (e) => e.preventDefault());

      el.addEventListener("click", (e) => {
        if (isSwipeIntent) {
          e.preventDefault();
        }
      });

      stage.appendChild(el);
    });
}

function getFrontCard() {
  return stage ? stage.querySelector('[data-position="0"]') : null;
}

function nextSlide() {
  if (isAnimating || cardsData.length <= 1) return;

  const front = getFrontCard();
  if (!front) return;

  isAnimating = true;

  front.style.transition = "transform 0.55s ease, opacity 0.55s ease";
  front.classList.add("is-leaving-left");

  window.setTimeout(() => {
    currentIndex = (currentIndex + 1) % cardsData.length;
    renderCards();

    requestAnimationFrame(() => {
      isAnimating = false;
      isSwipeIntent = false;
    });
  }, ANIMATION_DURATION);
}

function prevSlide() {
  if (isAnimating || cardsData.length <= 1) return;

  const front = getFrontCard();
  if (!front) return;

  isAnimating = true;

  front.style.transition = "transform 0.55s ease, opacity 0.55s ease";
  front.classList.add("is-leaving-right");

  window.setTimeout(() => {
    currentIndex = (currentIndex - 1 + cardsData.length) % cardsData.length;
    renderCards();

    requestAnimationFrame(() => {
      isAnimating = false;
      isSwipeIntent = false;
    });
  }, ANIMATION_DURATION);
}

function bindStageEvents() {
  stage.addEventListener("mousedown", startDrag);
  stage.addEventListener("touchstart", startDrag, { passive: true });
}

function startDrag(e) {
  if (isAnimating || cardsData.length <= 1) return;

  const front = getFrontCard();
  if (!front) return;

  isDragging = true;
  isSwipeIntent = false;

  startX = getClientX(e);
  currentX = startX;

  front.style.transition = "none";

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("touchmove", onDrag, { passive: true });

  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag);
  document.addEventListener("touchcancel", endDrag);
}

function onDrag(e) {
  if (!isDragging) return;

  currentX = getClientX(e);
  const diff = currentX - startX;

  if (Math.abs(diff) > CLICK_CANCEL_THRESHOLD) {
    isSwipeIntent = true;
  }

  const front = getFrontCard();
  if (!front) return;

  requestAnimationFrame(() => {
    front.style.transform = `translateX(${diff}px) rotate(${diff / 14}deg)`;
    front.style.opacity = String(Math.max(0.72, 1 - Math.abs(diff) / 500));
  });
}

function endDrag() {
  if (!isDragging) return;

  const diff = currentX - startX;
  const front = getFrontCard();

  isDragging = false;

  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("mouseup", endDrag);
  document.removeEventListener("touchend", endDrag);
  document.removeEventListener("touchcancel", endDrag);

  if (!front) {
    isSwipeIntent = false;
    return;
  }

  front.style.transition = "transform 0.35s ease, opacity 0.35s ease";

  if (diff <= -SWIPE_THRESHOLD) {
    nextSlide();
    return;
  }

  if (diff >= SWIPE_THRESHOLD) {
    prevSlide();
    return;
  }

  requestAnimationFrame(() => {
    front.style.transform = "";
    front.style.opacity = "";
  });

  window.setTimeout(() => {
    isSwipeIntent = false;
  }, 50);
}

function getClientX(e) {
  if (e.touches && e.touches.length > 0) {
    return e.touches[0].clientX;
  }

  if (e.changedTouches && e.changedTouches.length > 0) {
    return e.changedTouches[0].clientX;
  }

  return e.clientX;
}
