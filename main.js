/**
 * Intelligence Designed To Evolve — Landing Page Logic
 * Features: Eased count-up statistics, accessible mobile sheet navigation, responsive listeners.
 */

document.addEventListener("DOMContentLoaded", () => {
  initStatsCounter();
  initMobileMenu();
  initNavigation();
});

/**
 * Animated Count-up for Statistics
 * Formula: easeOutCubic, duration = 1500 + i * 80ms, start offset = 480 + i * 90ms.
 */
function initStatsCounter() {
  const statCards = document.querySelectorAll(".stat-card");
  if (!statCards.length) return;

  const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

  const animateCard = (card, index) => {
    const target = parseFloat(card.dataset.target || "0");
    const decimals = parseInt(card.dataset.decimals || "0", 10);
    const numEl = card.querySelector(".stat-number");
    if (!numEl) return;

    const duration = 1500 + index * 80;
    const startDelay = 480 + index * 90;

    setTimeout(() => {
      let startTime = null;

      const step = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);

        const currentVal = target * easedProgress;
        numEl.textContent = currentVal.toFixed(decimals);

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          numEl.textContent = target.toFixed(decimals);
        }
      };

      requestAnimationFrame(step);
    }, startDelay);
  };

  // IntersectionObserver triggering once at threshold 0.25
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          statCards.forEach((card, idx) => {
            animateCard(card, idx);
          });
          obs.disconnect();
        }
      });
    },
    { threshold: 0.25 }
  );

  const footer = document.querySelector(".stats-footer");
  if (footer) {
    observer.observe(footer);
  } else {
    statCards.forEach((card, idx) => animateCard(card, idx));
  }
}

/**
 * Mobile Navigation Sheet & Burger Controller
 */
function initMobileMenu() {
  const burgerBtn = document.getElementById("burger-btn");
  const overlay = document.getElementById("mobile-overlay");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link, .mobile-sign-in-btn");

  if (!burgerBtn || !overlay || !mobileMenu) return;

  const openMenu = () => {
    burgerBtn.setAttribute("aria-expanded", "true");
    overlay.removeAttribute("hidden");
    mobileMenu.removeAttribute("hidden");
    document.body.classList.add("menu-open");
  };

  const closeMenu = () => {
    burgerBtn.setAttribute("aria-expanded", "false");
    overlay.setAttribute("hidden", "");
    mobileMenu.setAttribute("hidden", "");
    document.body.classList.remove("menu-open");
  };

  const toggleMenu = () => {
    const isExpanded = burgerBtn.getAttribute("aria-expanded") === "true";
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  // Click on Burger Button
  burgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Click on Overlay
  overlay.addEventListener("click", () => {
    closeMenu();
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && burgerBtn.getAttribute("aria-expanded") === "true") {
      closeMenu();
      burgerBtn.focus();
    }
  });

  // Close when clicking any menu link
  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  // Auto-close on resize larger than 720px
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720 && burgerBtn.getAttribute("aria-expanded") === "true") {
      closeMenu();
    }
  });
}

/**
 * Active Navigation Link State Handler
 */
function initNavigation() {
  const desktopLinks = document.querySelectorAll(".nav-link");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  const setupLinks = (links) => {
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        links.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      });
    });
  };

  setupLinks(desktopLinks);
  setupLinks(mobileLinks);
}
