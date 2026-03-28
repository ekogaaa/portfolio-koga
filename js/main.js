document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".featured-carousel");
  if (carousel) {
    const slides = carousel.querySelectorAll(".featured-carousel__slide");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (slides.length >= 2 && !reduceMotion.matches) {
      let index = 0;
      const intervalMs = 4500;
      window.setInterval(() => {
        slides[index].classList.remove("is-active");
        index = (index + 1) % slides.length;
        slides[index].classList.add("is-active");
      }, intervalMs);
    }
  }

  const spriteCarousel = document.querySelector(".sprite-carousel");
  if (spriteCarousel) {
    const slides = spriteCarousel.querySelectorAll(".sprite-carousel__slide");
    const prevBtn = spriteCarousel.querySelector(".sprite-carousel__btn--prev");
    const nextBtn = spriteCarousel.querySelector(".sprite-carousel__btn--next");
    const statusEl = spriteCarousel.querySelector(".sprite-carousel__status");
    if (slides.length && prevBtn && nextBtn) {
      let index = 0;
      const total = slides.length;

      function showSlide(nextIndex) {
        slides[index].classList.remove("is-active");
        slides[index].setAttribute("aria-hidden", "true");
        index = (nextIndex + total) % total;
        slides[index].classList.add("is-active");
        slides[index].setAttribute("aria-hidden", "false");
        if (statusEl) statusEl.textContent = `${index + 1} / ${total}`;
      }

      prevBtn.addEventListener("click", () => showSlide(index - 1));
      nextBtn.addEventListener("click", () => showSlide(index + 1));

      spriteCarousel.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          showSlide(index - 1);
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          showSlide(index + 1);
        }
      });
      spriteCarousel.tabIndex = 0;
    }
  }
});
