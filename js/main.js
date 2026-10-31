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

  // Back/forward can restore the page from the browser's back/forward cache with
  // the menu still open, so always start from the closed state.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      setMenuOpen(false);
    }
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
  const filterRow = portfolioFilters.querySelector('ul');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Scroll the filter row horizontally (not the page) so the button is fully visible.
  function revealFilterButton(button, behavior) {
    const gutter = parseFloat(getComputedStyle(filterRow).paddingLeft);
    const rowStart = filterRow.scrollLeft;
    const rowEnd = rowStart + filterRow.clientWidth;
    const buttonRect = button.getBoundingClientRect();
    const buttonStart = buttonRect.left - filterRow.getBoundingClientRect().left + rowStart;
    const buttonEnd = buttonStart + buttonRect.width;
    let target = null;

    if (buttonStart - gutter < rowStart) {
      target = buttonStart - gutter;
    } else if (buttonEnd + gutter > rowEnd) {
      target = buttonEnd + gutter - filterRow.clientWidth;
    }

    if (target !== null) {
      filterRow.scrollTo({ left: target, behavior: reducedMotion.matches ? 'auto' : behavior });
    }
  }

  function applyFilter(category, behavior = 'smooth') {
    filterButtons.forEach((filterButton) => {
      const isActive = filterButton.dataset.category === category;
      filterButton.setAttribute('aria-pressed', String(isActive));

      if (isActive) {
        revealFilterButton(filterButton, behavior);
      }
    });

    portfolioItems.forEach((item) => {
      item.hidden = category !== 'all' && !item.dataset.categories.split(/\s+/).includes(category);
    });
  }

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => applyFilter(button.dataset.category));
  });

  // When the row overflows, widen the gap slightly if needed so the category at the
  // right edge is clearly cut off, hinting that the row scrolls.
  function adjustFilterGap() {
    filterRow.style.removeProperty('--filter-gap');

    if (filterRow.scrollWidth <= filterRow.clientWidth) {
      return;
    }

    const minPeek = 24;
    const rowStyle = getComputedStyle(filterRow);
    const baseGap = parseFloat(rowStyle.columnGap);
    const gutter = parseFloat(rowStyle.paddingLeft);
    const itemWidths = [...filterRow.children].map((item) => item.getBoundingClientRect().width);

    for (let gap = baseGap; gap <= baseGap + 16; gap += 2) {
      let itemStart = gutter;
      const edgeItemPeeks = itemWidths.some((width) => {
        const visible = filterRow.clientWidth - itemStart;
        const crossesEdge = itemStart + width > filterRow.clientWidth;
        itemStart += width + gap;
        return crossesEdge && visible >= minPeek && width - visible >= minPeek;
      });

      if (edgeItemPeeks) {
        filterRow.style.setProperty('--filter-gap', `${gap}px`);
        return;
      }
    }
  }

  function updateFilterFades() {
    const maxScroll = filterRow.scrollWidth - filterRow.clientWidth;
    filterRow.classList.toggle('has-fade-start', filterRow.scrollLeft > 1);
    filterRow.classList.toggle('has-fade-end', filterRow.scrollLeft < maxScroll - 1);
  }

  function layoutFilterRow() {
    adjustFilterGap();
    updateFilterFades();
  }

  filterRow.addEventListener('scroll', updateFilterFades, { passive: true });
  window.addEventListener('resize', layoutFilterRow);
  document.fonts?.ready.then(layoutFilterRow);

  // Show the row before measuring so the preselected button can be scrolled into view.
  portfolioFilters.hidden = false;
  layoutFilterRow();

  // Preselect a filter from a link such as portfolio.html?category=curtains.
  const requestedCategory = new URLSearchParams(window.location.search).get('category');

  if (filterButtons.some((button) => button.dataset.category === requestedCategory)) {
    applyFilter(requestedCategory, 'auto');
  }
}

const trustList = document.querySelector('.trust-list');

if (trustList) {
  // Show edge fades while the strip has more to scroll in that direction (mobile only).
  function updateTrustFades() {
    const maxScroll = trustList.scrollWidth - trustList.clientWidth;
    trustList.classList.toggle('has-fade-start', trustList.scrollLeft > 1);
    trustList.classList.toggle('has-fade-end', trustList.scrollLeft < maxScroll - 1);
  }

  trustList.addEventListener('scroll', updateTrustFades, { passive: true });
  window.addEventListener('resize', updateTrustFades);
  document.fonts?.ready.then(updateTrustFades);
  updateTrustFades();
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
    const willOpen = !contactFab.classList.contains('is-open');
    setContactFabOpen(willOpen);

    if (willOpen) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'ddd_contact_menu_open' });
    }
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
  const slideInterval = 5000;
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
    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.remove('is-entering');
        slide.classList.toggle('is-active', i === index);
        slide.classList.toggle('is-previous', i === current);
        slide.setAttribute('aria-hidden', String(i !== index));
      });
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

const revealSections = document.querySelectorAll('.feature-section--split, .testimonials-layout, .our-projects-list--reveal, .intro-split--reveal, .mini-gallery--reveal');

if (revealSections.length && 'IntersectionObserver' in window) {
  const revealQuery = window.matchMedia('(prefers-reduced-motion: no-preference)');
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

// Allowed GTM event names. Add new names here and create a matching
// Custom Event trigger in GTM. Unlisted names are reported as gtm_unknown_event.
const GTM_EVENTS = new Set([
  'ddd_line_chat',
  'ddd_phone_call',
  'ddd_email_click',
  'ddd_facebook_click',
  'ddd_instagram_click',
  'ddd_tiktok_click',
  // 'ddd_contact_menu_open' is pushed directly by the contact FAB toggle, not via data-gtm-event.
]);

document.addEventListener('click', (event) => {
  const tracked = event.target.closest('[data-gtm-event]');
  if (!tracked) return;

  const eventName = tracked.dataset.gtmEvent;
  const isKnown = GTM_EVENTS.has(eventName);

  if (!isKnown) {
    console.warn(`Unknown data-gtm-event "${eventName}"`, tracked);
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: isKnown ? eventName : 'gtm_unknown_event',
    attempted_event: isKnown ? undefined : eventName,
    link_url: tracked.href || undefined,
  });
});

// Position dots under the mobile "Our projects" carousel. Hidden on desktop, where the cards form a grid.
document.querySelectorAll('.our-projects-list').forEach((list) => {
  const items = Array.from(list.querySelectorAll('.our-projects-item'));
  if (items.length < 2) return;

  const dotsList = document.createElement('div');
  dotsList.className = 'our-projects-dots';
  dotsList.setAttribute('role', 'group');
  dotsList.setAttribute('aria-label', 'Projects');

  const dots = items.map((item, index) => {
    const dot = document.createElement('button');
    dot.className = 'our-projects-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show project ${index + 1} of ${items.length}`);
    dot.addEventListener('click', () => {
      list.scrollTo({ left: item.offsetLeft - items[0].offsetLeft, behavior: 'smooth' });
    });
    dotsList.append(dot);
    return dot;
  });

  list.after(dotsList);

  function updateDots() {
    const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
    let active = items.length - 1;
    if (!atEnd) {
      active = items.findIndex((item) => item.offsetLeft - items[0].offsetLeft >= list.scrollLeft - 2);
    }
    dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === active)));
  }

  list.addEventListener('scroll', updateDots, { passive: true });
  window.addEventListener('resize', updateDots);
  updateDots();
});
