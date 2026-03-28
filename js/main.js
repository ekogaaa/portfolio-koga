document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".featured-carousel");
  if (!carousel) return;

  const slides = carousel.querySelectorAll(".featured-carousel__slide");
  if (slides.length < 2) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  let index = 0;
  const intervalMs = 4500;

  window.setInterval(() => {
    slides[index].classList.remove("is-active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("is-active");
  }, intervalMs);
});
