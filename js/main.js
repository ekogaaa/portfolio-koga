document.addEventListener("DOMContentLoaded", () => {
  const carousel = document.querySelector(".featured-carousel");
  if (carousel) {
    const slides = carousel.querySelectorAll(".featured-carousel__slide");
    if (slides.length >= 2) {
      let index = 0;
      const intervalMs = 4500;
      window.setInterval(() => {
        slides[index].classList.remove("is-active");
        index = (index + 1) % slides.length;
        slides[index].classList.add("is-active");
      }, intervalMs);
    }
  }

  document.querySelectorAll(".artwork-carousel").forEach((root) => {
    const slides = root.querySelectorAll(".artwork-carousel__slide");
    const prevBtn = root.querySelector(".artwork-carousel__btn--prev");
    const nextBtn = root.querySelector(".artwork-carousel__btn--next");
    const statusEl = root.querySelector(".artwork-carousel__status");
    if (!slides.length || !prevBtn || !nextBtn) return;

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

    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        showSlide(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        showSlide(index + 1);
      }
    });
    root.tabIndex = 0;
  });
});
