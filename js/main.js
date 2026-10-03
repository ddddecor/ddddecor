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
}

if (document.querySelector('.gallery-link, .project-gallery-link') && typeof GLightbox === 'function') {
  GLightbox({ selector: '.gallery-link, .project-gallery-link' });
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
