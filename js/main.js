const CHROMA_TRAIL_COLOR = "#fa57c4";

/** All pages: single-color cursor line trail with fixed accent color; no click effect.
 *  Same color is applied to --chroma-trail-accent for the page background gradient. */
function initChromaCursorTrail() {
  const trailColor = CHROMA_TRAIL_COLOR;
  document.documentElement.style.setProperty("--chroma-trail-accent", trailColor);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  const root = document.createElement("div");
  root.className = "site-fx site-fx--chroma-trail";
  root.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas");
  canvas.className = "site-fx__chroma-trail-canvas";
  root.appendChild(canvas);
  document.body.prepend(root);

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  const trailPoints = [];
  let lastX = -9999;
  let lastY = -9999;
  const MAX_TRAIL_POINTS = 38;
  const MIN_MOVE_PX = 2;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  function pushTrailPoint(x, y) {
    trailPoints.push({ x, y });
    while (trailPoints.length > MAX_TRAIL_POINTS) trailPoints.shift();
  }

  function drawLineTrail() {
    const n = trailPoints.length;
    if (n < 2) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    function traceSmoothPath(points) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i += 1) {
        const current = points[i];
        const next = points[i + 1];
        const midX = (current.x + next.x) / 2;
        const midY = (current.y + next.y) / 2;
        ctx.quadraticCurveTo(current.x, current.y, midX, midY);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
    }

    // Glow pass.
    ctx.strokeStyle = trailColor;
    ctx.globalAlpha = 0.85;
    ctx.lineWidth = 3.8;
    ctx.shadowColor = trailColor;
    ctx.shadowBlur = 18;
    traceSmoothPath(trailPoints);
    ctx.stroke();

    // Thin bright core line for a laser-like neon center.
    ctx.strokeStyle = "#ffd8f3";
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 1.1;
    ctx.shadowBlur = 0;
    traceSmoothPath(trailPoints);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    drawLineTrail();
    requestAnimationFrame(tick);
  }

  function onMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    const dist = Math.hypot(x - lastX, y - lastY);
    if (dist < MIN_MOVE_PX) return;
    lastX = x;
    lastY = y;
    pushTrailPoint(x, y);
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", onMove, { passive: true });
  requestAnimationFrame(tick);
}

function initSiteBackgroundFx() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reduceMotion.matches) return;

  const root = document.createElement("div");
  root.className = "site-fx";
  root.setAttribute("aria-hidden", "true");
  const canvas = document.createElement("canvas");
  canvas.className = "site-fx__rain";
  root.append(canvas);
  document.body.prepend(root);

  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  let petals = [];
  const pointer = { x: -9999, y: -9999, active: false };
  const PETAL_COUNT = 42;
  const PETAL_COLOR = "rgba(232, 212, 125, 0.78)";
  const PETAL_STROKE = "rgba(232, 212, 125, 0.38)";

  function spawnPetal(fromTop = false) {
    const size = 5 + Math.random() * 8;
    return {
      x: fromTop ? -20 + Math.random() * (w * 0.42) : -30 + Math.random() * (w * 0.22),
      y: fromTop ? -20 - Math.random() * (h * 0.35) : Math.random() * (h * 0.45),
      vx: 0.45 + Math.random() * 1.15,
      vy: 0.85 + Math.random() * 1.55,
      offsetX: 0,
      offsetY: 0,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.012 + Math.random() * 0.03,
      swayAmp: 0.35 + Math.random() * 1.2,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.035,
      size,
      stretch: 1.1 + Math.random() * 0.35,
    };
  }

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    petals = Array.from({ length: PETAL_COUNT }, () => spawnPetal(true));
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    for (const p of petals) {
      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const dist = Math.hypot(dx, dy);
        const pushRadius = 120;
        if (dist > 0 && dist < pushRadius) {
          const force = ((pushRadius - dist) / pushRadius) * 1.8;
          p.offsetX += (dx / dist) * force;
          p.offsetY += (dy / dist) * force;
        }
      }

      p.offsetX *= 0.9;
      p.offsetY *= 0.9;
      p.swayPhase += p.swaySpeed;
      p.x += p.vx + Math.sin(p.swayPhase) * p.swayAmp + p.offsetX;
      p.y += p.vy + p.offsetY * 0.55;
      p.rot += p.rotSpeed;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.stretch, 1);
      ctx.fillStyle = PETAL_COLOR;
      ctx.strokeStyle = PETAL_STROKE;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -p.size);
      ctx.quadraticCurveTo(p.size * 0.95, -p.size * 0.25, 0, p.size * 0.9);
      ctx.quadraticCurveTo(-p.size * 0.95, -p.size * 0.25, 0, -p.size);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      if (p.y > h + 36 || p.x > w + 36) {
        Object.assign(p, spawnPetal(true));
      }
    }
    requestAnimationFrame(tick);
  }

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener(
    "mousemove",
    (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    },
    { passive: true }
  );
  window.addEventListener("mouseleave", () => {
    pointer.active = false;
    pointer.x = -9999;
    pointer.y = -9999;
  });
  requestAnimationFrame(tick);
}

function initWorkRevealCards() {
  if (
    document.body.classList.contains("page-artwork") ||
    document.body.classList.contains("page-videos") ||
    document.body.classList.contains("page-coding")
  ) {
    return;
  }

  const cards = document.querySelectorAll(".work-reveal");
  cards.forEach((card, index) => {
    const trigger = card.querySelector(".work-reveal__media");
    const description = card.querySelector(".work-reveal__description");
    const toggleButton = card.querySelector("[data-work-reveal-toggle]");
    if (!trigger || !description) return;

    if (!description.id) {
      description.id = `work-reveal-description-${index + 1}`;
    }

    trigger.setAttribute("role", "button");
    trigger.setAttribute("tabindex", "0");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", description.id);
    trigger.setAttribute("aria-label", "Show or hide description");

    const setOpenState = (isOpen) => {
      card.classList.toggle("is-open", isOpen);
      trigger.setAttribute("aria-expanded", String(isOpen));
      if (toggleButton) {
        toggleButton.setAttribute("aria-expanded", String(isOpen));
        toggleButton.textContent = isOpen ? "Hide text" : "Pop out text";
      }
    };

    const toggleCard = () => {
      const isOpen = !card.classList.contains("is-open");
      setOpenState(isOpen);
    };

    if (toggleButton) {
      toggleButton.setAttribute("aria-controls", description.id);
      toggleButton.setAttribute("aria-expanded", "false");
      toggleButton.addEventListener("click", toggleCard);
    }

    trigger.addEventListener("click", (event) => {
      const clickedControl = event.target.closest(
        "a, button, input, textarea, select, label, iframe"
      );
      if (clickedControl) return;
      const isOpen = card.classList.toggle("is-open");
      setOpenState(isOpen);
    });

    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleCard();
      }
    });
  });
}

function initArtworkModal() {
  if (!document.body.classList.contains("page-artwork")) return;

  const cards = Array.from(document.querySelectorAll(".page-artwork .artwork-section"));
  if (!cards.length) return;

  const modal = document.createElement("div");
  modal.className = "artwork-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="artwork-modal__backdrop" data-artwork-modal-close></div>
    <div class="artwork-modal__dialog" role="dialog" aria-modal="true" aria-label="Artwork viewer" tabindex="-1">
      <button type="button" class="artwork-modal__close" aria-label="Close viewer" data-artwork-modal-close>×</button>
      <div class="artwork-modal__body">
        <div class="artwork-modal__media-col">
          <div class="artwork-modal__viewer-wrap">
            <button type="button" class="artwork-modal__nav artwork-modal__nav--prev" aria-label="Previous media">←</button>
            <div class="artwork-modal__viewer"></div>
            <button type="button" class="artwork-modal__nav artwork-modal__nav--next" aria-label="Next media">→</button>
          </div>
          <p class="artwork-modal__status" aria-live="polite"></p>
        </div>
        <div class="artwork-modal__text-col">
          <h2 class="artwork-modal__title"></h2>
          <p class="artwork-modal__description"></p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const titleEl = modal.querySelector(".artwork-modal__title");
  const viewerEl = modal.querySelector(".artwork-modal__viewer");
  const statusEl = modal.querySelector(".artwork-modal__status");
  const descriptionEl = modal.querySelector(".artwork-modal__description");
  const dialogEl = modal.querySelector(".artwork-modal__dialog");
  const prevBtn = modal.querySelector(".artwork-modal__nav--prev");
  const nextBtn = modal.querySelector(".artwork-modal__nav--next");
  const closeButtons = modal.querySelectorAll("[data-artwork-modal-close]");

  let activeMedia = [];
  let activeIndex = 0;
  let lastTrigger = null;

  function renderMedia(index) {
    if (!activeMedia.length || !viewerEl || !statusEl) return;
    activeIndex = (index + activeMedia.length) % activeMedia.length;
    const current = activeMedia[activeIndex];
    viewerEl.innerHTML = "";

    if (current.type === "video") {
      const iframe = document.createElement("iframe");
      iframe.src = current.src;
      iframe.title = current.alt;
      iframe.loading = "lazy";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      viewerEl.appendChild(iframe);
    } else {
      const image = document.createElement("img");
      image.src = current.src;
      image.alt = current.alt;
      image.loading = "eager";
      image.decoding = "async";
      viewerEl.appendChild(image);
    }

    statusEl.textContent = `${activeIndex + 1} / ${activeMedia.length}`;
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("artwork-modal-open");
    viewerEl.innerHTML = "";
    if (lastTrigger) lastTrigger.focus();
  }

  function openModal(card) {
    const heading = card.dataset.title?.trim() || "Artwork";
    const descriptions = Array.from(card.querySelectorAll(".artwork-section__description"))
      .map((description) => description.textContent?.trim())
      .filter(Boolean);

    const mediaNodes = Array.from(
      card.querySelectorAll(".artwork-carousel__slide, .artwork-gallery img, .artwork-video iframe")
    );
    activeMedia = mediaNodes.map((node) => {
      if (node.tagName.toLowerCase() === "iframe") {
        return {
          type: "video",
          src: node.getAttribute("src") || "",
          alt: node.getAttribute("title") || heading,
        };
      }
      return {
        type: "image",
        src: node.getAttribute("src") || "",
        alt: node.getAttribute("alt") || heading,
      };
    });

    if (!activeMedia.length) return;

    titleEl.textContent = heading;
    descriptionEl.textContent = descriptions.join(" ");
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("artwork-modal-open");
    renderMedia(0);
    dialogEl?.focus();
  }

  cards.forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-haspopup", "dialog");
    card.setAttribute("aria-label", `Open ${card.dataset.title || "artwork"} details`);

    const activateCard = () => {
      lastTrigger = card;
      openModal(card);
    };

    card.addEventListener("click", (event) => {
      const clickedControl = event.target.closest("a, button, input, textarea, select, label, iframe");
      if (clickedControl) return;
      activateCard();
    });

    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activateCard();
      }
    });
  });

  prevBtn?.addEventListener("click", () => renderMedia(activeIndex - 1));
  nextBtn?.addEventListener("click", () => renderMedia(activeIndex + 1));

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      renderMedia(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      renderMedia(activeIndex + 1);
    }
  });
}

function initVideoEmbedModal() {
  if (!document.body.classList.contains("page-videos")) return;

  const triggers = Array.from(document.querySelectorAll("[data-video-modal-trigger]"));
  if (!triggers.length) return;

  const modal = document.createElement("div");
  modal.className = "video-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="video-modal__backdrop" data-video-modal-close></div>
    <div class="video-modal__dialog" role="dialog" aria-modal="true" aria-label="Video viewer" tabindex="-1">
      <button type="button" class="video-modal__close" aria-label="Close video viewer" data-video-modal-close>×</button>
      <div class="video-modal__body">
        <div class="video-modal__media-col">
          <div class="video-modal__viewer-wrap">
            <button type="button" class="video-modal__nav video-modal__nav--prev" aria-label="Previous media">←</button>
            <div class="video-modal__viewer"></div>
            <button type="button" class="video-modal__nav video-modal__nav--next" aria-label="Next media">→</button>
          </div>
          <p class="video-modal__status" aria-live="polite"></p>
          <div class="video-modal__switches" role="group" aria-label="Media type">
            <button type="button" class="video-modal__switch" data-video-switch="video">Video</button>
            <button type="button" class="video-modal__switch" data-video-switch="photos">Photos</button>
          </div>
        </div>
        <div class="video-modal__text-col">
          <h2 class="video-modal__title"></h2>
          <p class="video-modal__description"></p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const dialogEl = modal.querySelector(".video-modal__dialog");
  const viewerEl = modal.querySelector(".video-modal__viewer");
  const statusEl = modal.querySelector(".video-modal__status");
  const titleEl = modal.querySelector(".video-modal__title");
  const descriptionEl = modal.querySelector(".video-modal__description");
  const prevBtn = modal.querySelector(".video-modal__nav--prev");
  const nextBtn = modal.querySelector(".video-modal__nav--next");
  const switchVideoBtn = modal.querySelector('[data-video-switch="video"]');
  const switchPhotosBtn = modal.querySelector('[data-video-switch="photos"]');
  const closeButtons = modal.querySelectorAll("[data-video-modal-close]");
  let lastTrigger = null;
  let activeMedia = [];
  let activeIndex = 0;

  function parseGallery(galleryText) {
    if (!galleryText) return [];
    return galleryText
      .split("||")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [src = "", alt = ""] = entry.split("::");
        return { src: src.trim(), alt: alt.trim() || "Photo" };
      })
      .filter((item) => item.src);
  }

  function updateSwitchState() {
    const hasPhotos = activeMedia.some((item) => item.type === "image");
    if (switchPhotosBtn) {
      switchPhotosBtn.disabled = !hasPhotos;
    }
    if (switchVideoBtn) {
      switchVideoBtn.disabled = activeMedia.length <= 1;
    }
    const currentType = activeMedia[activeIndex]?.type;
    switchVideoBtn?.classList.toggle("is-active", currentType === "video");
    switchPhotosBtn?.classList.toggle("is-active", currentType === "image");
  }

  function renderMedia(index) {
    if (!viewerEl || !statusEl || !activeMedia.length) return;
    activeIndex = (index + activeMedia.length) % activeMedia.length;
    const current = activeMedia[activeIndex];
    viewerEl.innerHTML = "";

    if (current.type === "video") {
      const iframe = document.createElement("iframe");
      iframe.src = current.src;
      iframe.title = current.alt;
      iframe.loading = "eager";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      viewerEl.appendChild(iframe);
    } else {
      const image = document.createElement("img");
      image.src = current.src;
      image.alt = current.alt;
      image.loading = "eager";
      image.decoding = "async";
      viewerEl.appendChild(image);
    }

    statusEl.textContent = `${activeIndex + 1} / ${activeMedia.length}`;
    updateSwitchState();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("video-modal-open");
    if (viewerEl) viewerEl.innerHTML = "";
    activeMedia = [];
    activeIndex = 0;
    if (lastTrigger) lastTrigger.focus();
  }

  function openModal(trigger) {
    if (!viewerEl || !titleEl || !descriptionEl) return;
    const src = trigger.getAttribute("data-video-embed-src");
    const title = trigger.getAttribute("data-video-title") || "Video";
    const section = trigger.closest(".video-section");
    const sectionHeading = section?.querySelector("h2")?.textContent?.trim() || title;
    const descriptionText =
      section?.querySelector(".video-section__description")?.textContent?.trim() || "";
    const gallery = parseGallery(trigger.getAttribute("data-video-gallery"));
    if (!src) return;

    activeMedia = [
      { type: "video", src, alt: title },
      ...gallery.map((item) => ({ type: "image", src: item.src, alt: item.alt })),
    ];
    titleEl.textContent = sectionHeading;
    descriptionEl.textContent = descriptionText;
    renderMedia(0);

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("video-modal-open");
    dialogEl?.focus();
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      lastTrigger = trigger;
      openModal(trigger);
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  prevBtn?.addEventListener("click", () => renderMedia(activeIndex - 1));
  nextBtn?.addEventListener("click", () => renderMedia(activeIndex + 1));
  switchVideoBtn?.addEventListener("click", () => {
    const videoIndex = activeMedia.findIndex((item) => item.type === "video");
    if (videoIndex >= 0) renderMedia(videoIndex);
  });
  switchPhotosBtn?.addEventListener("click", () => {
    const photoIndex = activeMedia.findIndex((item) => item.type === "image");
    if (photoIndex >= 0) renderMedia(photoIndex);
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      renderMedia(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      renderMedia(activeIndex + 1);
    }
  });
}

function initCodingEmbedModal() {
  if (!document.body.classList.contains("page-coding")) return;

  const triggers = Array.from(document.querySelectorAll("[data-coding-modal-trigger]"));
  if (!triggers.length) return;

  const modal = document.createElement("div");
  modal.className = "coding-modal";
  modal.setAttribute("aria-hidden", "true");
  modal.innerHTML = `
    <div class="coding-modal__backdrop" data-coding-modal-close></div>
    <div class="coding-modal__dialog" role="dialog" aria-modal="true" aria-label="Coding viewer" tabindex="-1">
      <button type="button" class="coding-modal__close" aria-label="Close coding viewer" data-coding-modal-close>×</button>
      <div class="coding-modal__body">
        <div class="coding-modal__viewer"></div>
        <div class="coding-modal__text-col">
          <h2 class="coding-modal__title"></h2>
          <p class="coding-modal__description"></p>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const dialogEl = modal.querySelector(".coding-modal__dialog");
  const viewerEl = modal.querySelector(".coding-modal__viewer");
  const titleEl = modal.querySelector(".coding-modal__title");
  const descriptionEl = modal.querySelector(".coding-modal__description");
  const closeButtons = modal.querySelectorAll("[data-coding-modal-close]");
  let lastTrigger = null;

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("coding-modal-open");
    if (viewerEl) viewerEl.innerHTML = "";
    if (lastTrigger) lastTrigger.focus();
  }

  function openModal(trigger) {
    if (!viewerEl || !titleEl || !descriptionEl) return;
    const src = trigger.getAttribute("data-coding-embed-src");
    const title = trigger.getAttribute("data-coding-title") || "Coding Project";
    const section = trigger.closest(".coding-section");
    const sectionHeading = section?.querySelector("h2")?.textContent?.trim() || title;
    const descriptionText =
      section?.querySelector(".coding-section__description")?.textContent?.trim() || "";
    if (!src) return;

    viewerEl.innerHTML = "";
    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.title = title;
    iframe.loading = "eager";
    iframe.allowFullscreen = true;
    iframe.sandbox =
      "allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-modals allow-downloads";
    viewerEl.appendChild(iframe);

    titleEl.textContent = sectionHeading;
    descriptionEl.textContent = descriptionText;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("coding-modal-open");
    dialogEl?.focus();
  }

  triggers.forEach((trigger) => {
    const activate = () => {
      lastTrigger = trigger;
      openModal(trigger);
    };
    trigger.addEventListener("click", activate);
    trigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  modal.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initChromaCursorTrail();
  initSiteBackgroundFx();
  initWorkRevealCards();
  initArtworkModal();
  initVideoEmbedModal();
  initCodingEmbedModal();

  const randomWorkTrigger = document.querySelector("[data-random-work]");
  if (randomWorkTrigger) {
    const workTargets = [
      "artwork.html#artwork-glitch-art",
      "artwork.html#artwork-album-cover",
      "artwork.html#artwork-vector-art",
      "videos.html#video-digital-animation",
      "artwork.html#artwork-drawn-from-sketchbook",
      "artwork.html#artwork-snake-reference",
      "videos.html#video-single-channel-1",
      "videos.html#video-single-channel-2",
      "videos.html#video-single-channel-3",
      "videos.html#video-abstract-video",
      "videos.html#video-double-channel",
      "coding.html#coding-creative-coding",
      "coding.html#coding-art-74-portfolio",
    ];

    const goToRandomWork = () => {
      const randomIndex = Math.floor(Math.random() * workTargets.length);
      window.location.href = workTargets[randomIndex];
    };

    randomWorkTrigger.addEventListener("click", goToRandomWork);
    randomWorkTrigger.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToRandomWork();
      }
    });
  }

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
    if (root.closest(".page-artwork")) return;

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
