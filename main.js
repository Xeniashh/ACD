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

// drag состояние
let startX = 0;
let currentX = 0;
let isDragging = false;

function getVisibleCards() {
  const visible = [];
  for (let i = 0; i < Math.min(4, cardsData.length); i++) {
    const index = (currentIndex + i) % cardsData.length;
    visible.push(cardsData[index]);
  }
  return visible;
}

function renderCards() {
  stage.innerHTML = "";

  const visibleCards = getVisibleCards();

  visibleCards.slice().reverse().forEach((card, reverseIndex) => {
    const visualIndex = visibleCards.length - 1 - reverseIndex;

    const el = document.createElement("a");
    el.href = card.link;
    el.className = "task-card";
    el.dataset.position = visualIndex;

    el.innerHTML = `<img src="${card.image}" class="task-card__image">`;

    stage.appendChild(el);
  });
}

function nextSlide() {
  if (isAnimating) return;
  isAnimating = true;

  const front = stage.querySelector('[data-position="0"]');
  front.classList.add("is-leaving-left");

  setTimeout(() => {
    currentIndex = (currentIndex + 1) % cardsData.length;
    renderCards();
    isAnimating = false;
  }, 500);
}

function prevSlide() {
  if (isAnimating) return;
  isAnimating = true;

  const front = stage.querySelector('[data-position="0"]');
  front.classList.add("is-leaving-right");

  setTimeout(() => {
    currentIndex = (currentIndex - 1 + cardsData.length) % cardsData.length;
    renderCards();
    isAnimating = false;
  }, 500);
}

nextBtn.addEventListener("click", nextSlide);
prevBtn.addEventListener("click", prevSlide);

renderCards();


// =======================
// DRAG / SWIPE ЛОГИКА
// =======================

stage.addEventListener("mousedown", startDrag);
stage.addEventListener("touchstart", startDrag);

function startDrag(e) {
  if (isAnimating) return;

  isDragging = true;
  startX = e.touches ? e.touches[0].clientX : e.clientX;

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("touchmove", onDrag);

  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag);
}

function onDrag(e) {
  if (!isDragging) return;

  currentX = e.touches ? e.touches[0].clientX : e.clientX;
  const diff = currentX - startX;

  const front = stage.querySelector('[data-position="0"]');

  if (!front) return;

  front.style.transform = `
    translateX(${diff}px)
    rotate(${diff / 10}deg)
  `;
}

function endDrag() {
  if (!isDragging) return;

  const diff = currentX - startX;

  isDragging = false;

  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("mouseup", endDrag);
  document.removeEventListener("touchend", endDrag);

  const threshold = 80;

  if (diff < -threshold) {
    nextSlide();
  } else if (diff > threshold) {
    prevSlide();
  } else {
    // возврат назад
    renderCards();
  }
}