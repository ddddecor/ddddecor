const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#primary-navigation');

if (menuButton && navigation) {
  document.documentElement.classList.add('has-js');

  function setMenuOpen(isOpen) {
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    navigation.classList.toggle('is-open', isOpen);
  }

  menuButton.addEventListener('click', () => {
    setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenuOpen(false);
      menuButton.focus();
    }
  });

  const submenuItems = [...navigation.querySelectorAll('.has-submenu')];

  function setSubmenuOpen(item, isOpen) {
    item.classList.toggle('is-open', isOpen);
    item.querySelector('.submenu-toggle').setAttribute('aria-expanded', String(isOpen));
  }

  submenuItems.forEach((item, index) => {
    const link = item.querySelector(':scope > a');
    const submenu = item.querySelector('.submenu');
    const toggle = document.createElement('button');

    submenu.id = submenu.id || `submenu-${index + 1}`;
    toggle.className = 'submenu-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-controls', submenu.id);
    toggle.setAttribute('aria-label', `${link.textContent.trim()} submenu`);
    toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>';
    link.after(toggle);

    toggle.addEventListener('click', () => {
      setSubmenuOpen(item, toggle.getAttribute('aria-expanded') !== 'true');
    });
  });

  document.addEventListener('click', (event) => {
    submenuItems.forEach((item) => {
      if (!item.contains(event.target)) setSubmenuOpen(item, false);
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    submenuItems.forEach((item) => {
      if (item.classList.contains('is-open')) {
        setSubmenuOpen(item, false);
        item.querySelector('.submenu-toggle').focus();
      }
    });
  });
}

if (document.querySelector('.gallery-link, .project-gallery-link') && typeof GLightbox === 'function') {
  const lightbox = GLightbox({ selector: '.gallery-link, .project-gallery-link' });
  let lightboxOpen = false;

  // Let the browser Back button close the lightbox instead of leaving the page.
  lightbox.on('open', () => {
    lightboxOpen = true;
    history.pushState({ lightbox: true }, '');
  });

  lightbox.on('close', () => {
    lightboxOpen = false;
    // Closed via X, Esc or swipe: drop the history entry we added on open.
    if (history.state && history.state.lightbox) {
      history.back();
    }
  });

  window.addEventListener('popstate', () => {
    // Back was pressed: the entry is already gone, so just close.
    if (lightboxOpen) {
      lightbox.close();
    }
  });
}

const portfolioFilters = document.querySelector('.portfolio-filters');

if (portfolioFilters) {
  const filterButtons = [...portfolioFilters.querySelectorAll('.portfolio-filter')];
  const portfolioItems = [...document.querySelectorAll('.portfolio-feed .portfolio-item')];

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;

      filterButtons.forEach((filterButton) => {
        filterButton.setAttribute('aria-pressed', String(filterButton === button));
      });

      portfolioItems.forEach((item) => {
        item.hidden = category !== 'all' && !item.dataset.categories.split(/\s+/).includes(category);
      });
    });
  });

  portfolioFilters.hidden = false;
}

const contactFab = document.querySelector('.contact-fab');
const contactFabToggle = document.querySelector('.contact-fab-toggle');

if (contactFab && contactFabToggle) {
  function setContactFabOpen(isOpen) {
    contactFab.classList.toggle('is-open', isOpen);
    contactFabToggle.setAttribute('aria-expanded', String(isOpen));
    contactFabToggle.setAttribute('aria-label', isOpen ? 'Close contact options' : 'Open contact options');
  }

  contactFabToggle.addEventListener('click', () => {
    setContactFabOpen(!contactFab.classList.contains('is-open'));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && contactFab.classList.contains('is-open')) {
      setContactFabOpen(false);
      contactFabToggle.focus();
    }
  });

  document.addEventListener('click', (event) => {
    if (!contactFab.contains(event.target)) {
      setContactFabOpen(false);
    }
  });
}

const heroCarousel = document.querySelector('[data-hero-carousel]');

if (heroCarousel) {
  const slides = [...heroCarousel.querySelectorAll('.hero-slide')];
  const slideInterval = 7000;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = 0;
  let timer = null;
  let isPaused = false;

  function loadSlide(slide) {
    slide.querySelectorAll('[data-srcset]').forEach((source) => {
      source.srcset = source.dataset.srcset;
      source.removeAttribute('data-srcset');
    });
    slide.querySelectorAll('[data-src]').forEach((image) => {
      image.src = image.dataset.src;
      image.removeAttribute('data-src');
    });
  }

  if (slides.length > 1) {
    const dotsList = document.createElement('div');
    dotsList.className = 'hero-dots';
    dotsList.setAttribute('role', 'group');
    dotsList.setAttribute('aria-label', 'Hero images');

    const dots = slides.map((slide, index) => {
      const dot = document.createElement('button');
      dot.className = 'hero-dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Show image ${index + 1} of ${slides.length}`);
      dot.addEventListener('click', () => {
        goToSlide(index);
        restartTimer();
      });
      dotsList.append(dot);
      return dot;
    });

    heroCarousel.append(dotsList);

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.remove('is-entering');
        slide.classList.toggle('is-active', i === index);
        slide.classList.toggle('is-previous', i === current);
        slide.setAttribute('aria-hidden', String(i !== index));
      });
      dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
      // Restart the incoming slide's fade-in and image motion from the beginning.
      const incomingImage = slides[index].querySelector('img');
      incomingImage.style.animation = 'none';
      void slides[index].offsetWidth;
      incomingImage.style.animation = '';
      slides[index].classList.add('is-entering');
      current = index;
    }

    // Switch only once the target image has loaded, so a slow download never leaves an empty frame.
    let latestRequest = 0;

    function goToSlide(index) {
      if (index === current) return;
      const request = ++latestRequest;
      loadSlide(slides[index]);
      const image = slides[index].querySelector('img');
      const decoded = image.decode ? image.decode().catch(() => {}) : Promise.resolve();
      decoded.then(() => {
        if (request === latestRequest) showSlide(index);
      });
    }

    function stopTimer() {
      clearInterval(timer);
      timer = null;
    }

    function restartTimer() {
      stopTimer();
      if (reducedMotion.matches || isPaused || document.hidden) return;
      timer = setInterval(() => goToSlide((current + 1) % slides.length), slideInterval);
    }

    dots[0].setAttribute('aria-current', 'true');

    // Fetch the remaining slides only once the first image has loaded, so it keeps priority.
    const firstImage = slides[0].querySelector('img');
    const preloadSlides = () => slides.slice(1).forEach(loadSlide);

    if (firstImage.complete) {
      preloadSlides();
    } else {
      firstImage.addEventListener('load', preloadSlides, { once: true });
    }

    heroCarousel.addEventListener('mouseenter', () => { isPaused = true; stopTimer(); });
    heroCarousel.addEventListener('mouseleave', () => { isPaused = false; restartTimer(); });
    heroCarousel.addEventListener('focusin', () => { isPaused = true; stopTimer(); });
    heroCarousel.addEventListener('focusout', () => { isPaused = false; restartTimer(); });
    document.addEventListener('visibilitychange', restartTimer);
    reducedMotion.addEventListener('change', restartTimer);

    restartTimer();
  }
}

const revealSections = document.querySelectorAll('.feature-section--split');

if (revealSections.length && 'IntersectionObserver' in window) {
  const revealQuery = window.matchMedia('(min-width: 64rem) and (prefers-reduced-motion: no-preference)');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-revealed');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.25 });

  function updateReveal() {
    revealSections.forEach((section) => {
      if (revealQuery.matches) {
        section.classList.add('reveal-ready');
        if (!section.classList.contains('is-revealed')) revealObserver.observe(section);
      } else {
        section.classList.remove('reveal-ready');
        revealObserver.unobserve(section);
      }
    });
  }

  revealQuery.addEventListener('change', updateReveal);
  updateReveal();
}
