/* ============================================================
   Harshal Tupke — Portfolio
   script.js — lightweight vanilla JS, progressive enhancement only.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     1. DOM SELECTIONS
     ============================================================ */

  const siteHeader = document.getElementById('site-header');
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
  const desktopNavLinks = document.querySelectorAll('.navbar__links a');
  const allInternalNavLinks = document.querySelectorAll(
    '.navbar__links a, .mobile-menu a, .hero__cta-group a'
  );

  const sections = document.querySelectorAll('main section[id]');

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  /* ============================================================
     2. MOBILE NAVIGATION
     ============================================================ */

  function openMobileMenu() {
    if (!mobileMenu || !navToggle) return;
    mobileMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    if (!mobileMenu || !navToggle) return;
    mobileMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  function isMobileMenuOpen() {
    return !!mobileMenu && mobileMenu.classList.contains('is-open');
  }

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      if (isMobileMenuOpen()) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close the menu after choosing a section
    mobileMenuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close when clicking outside the header/menu
    document.addEventListener('click', (event) => {
      if (!isMobileMenuOpen()) return;
      const clickedInsideHeader = siteHeader && siteHeader.contains(event.target);
      if (!clickedInsideHeader) {
        closeMobileMenu();
      }
    });

    // Close on Escape and return focus to the toggle button
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isMobileMenuOpen()) {
        closeMobileMenu();
        navToggle.focus();
      }
    });

    // If the viewport grows back to desktop width, ensure the menu resets
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && isMobileMenuOpen()) {
        closeMobileMenu();
      }
    });
  }

  /* ============================================================
     3. SMOOTH SCROLLING (offset for the sticky header)
     ============================================================ */

  function getHeaderOffset() {
    return siteHeader ? siteHeader.offsetHeight : 0;
  }

  function scrollToTarget(targetEl) {
    const targetPosition =
      targetEl.getBoundingClientRect().top + window.pageYOffset - getHeaderOffset();

    window.scrollTo({
      top: targetPosition,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }

  allInternalNavLinks.forEach((link) => {
    const href = link.getAttribute('href') || '';

    // Only handle same-page anchor links (e.g. #about), leave everything else alone
    if (!href.startsWith('#') || href === '#') return;

    link.addEventListener('click', (event) => {
      const targetId = href.slice(1);
      const targetEl = document.getElementById(targetId);
      if (!targetEl) return;

      event.preventDefault();
      scrollToTarget(targetEl);

      // Update the URL hash without an extra jump
      if (history.pushState) {
        history.pushState(null, '', href);
      }
    });
  });

  /* ============================================================
     4. ACTIVE SECTION NAVIGATION
     ============================================================ */

  if (sections.length && 'IntersectionObserver' in window) {
    const setActiveLink = (id) => {
      desktopNavLinks.forEach((link) => {
        const isMatch = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('is-active', isMatch);
      });
    };

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveLink(entry.target.id);
          }
        });
      },
      {
        root: null,
        // Treat a section as "current" once it sits just below the sticky header
        rootMargin: `-${getHeaderOffset() + 16}px 0px -60% 0px`,
        threshold: 0,
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ============================================================
     6. SUBTLE SCROLL REVEALS
     ============================================================ */

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealSelectors = [
      '.about__panel',
      '.skill-card',
      '.project-card',
      '.experience-item',
      '.certification-card',
    ];

    const revealEls = document.querySelectorAll(revealSelectors.join(', '));

    revealEls.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(12px)';
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      // A very small, capped stagger for grouped items (project/skill cards)
      el.style.transitionDelay = `${Math.min(index % 6, 5) * 40}ms`;
    });

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1,
      }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  }

});