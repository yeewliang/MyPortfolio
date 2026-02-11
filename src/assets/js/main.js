/**
* Template Name: MyResume
* Template URL: https://bootstrapmade.com/free-html-bootstrap-template-my-resume/
* Updated: Jun 29 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function () {
  "use strict";

  /**
   * Header toggle
   */
  const headerToggleBtn = document.querySelector('.header-toggle');

  function headerToggle() {
    document.querySelector('#header').classList.toggle('header-show');
    headerToggleBtn.classList.toggle('bi-list');
    headerToggleBtn.classList.toggle('bi-x');
  }
  headerToggleBtn.addEventListener('click', headerToggle);

  /**
   * Hide mobile nav on same-page/hash links
   */
  document.querySelectorAll('#navmenu a').forEach(navmenu => {
    navmenu.addEventListener('click', () => {
      if (document.querySelector('.header-show')) {
        headerToggle();
      }
    });

  });

  /**
   * Toggle mobile nav dropdowns
   */
  document.querySelectorAll('.navmenu .toggle-dropdown').forEach(navmenu => {
    navmenu.addEventListener('click', function (e) {
      e.preventDefault();
      this.parentNode.classList.toggle('active');
      this.parentNode.nextElementSibling.classList.toggle('dropdown-active');
      e.stopImmediatePropagation();
    });
  });

  /**
   * Preloader
   */
  const preloader = document.querySelector('#preloader');
  if (preloader) {
    window.addEventListener('load', () => {
      preloader.remove();
    });
  }

  /**
   * Scroll top button
   */
  let scrollTop = document.querySelector('.scroll-top');

  function toggleScrollTop() {
    if (scrollTop) {
      window.scrollY > 100 ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init
   */
  function aosInit() {
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }
  window.addEventListener('load', aosInit);

  /**
   * Init typed.js
   */
  const selectTyped = document.querySelector('.typed');
  if (selectTyped) {
    let typed_strings = selectTyped.getAttribute('data-typed-items');
    typed_strings = typed_strings.split(',');
    new Typed('.typed', {
      strings: typed_strings,
      loop: true,
      typeSpeed: 100,
      backSpeed: 50,
      backDelay: 2000
    });
  }

  /**
   * Initiate Pure Counter
   */
  new PureCounter();

  /**
   * Animate the skills items on reveal
   */
  let skillsAnimation = document.querySelectorAll('.skills-animation');
  skillsAnimation.forEach((item) => {
    new Waypoint({
      element: item,
      offset: '80%',
      handler: function (direction) {
        let progress = item.querySelectorAll('.progress .progress-bar');
        progress.forEach(el => {
          el.style.width = el.getAttribute('aria-valuenow') + '%';
        });
      }
    });
  });

  /**
   * Initiate glightbox
   */
  const glightbox = GLightbox({
    selector: '.glightbox'
  });

  /**
   * Init isotope layout and filters
   */
  /**
   * Init isotope layout and filters
   */
  function initIsotopeLayout() {
    document.querySelectorAll('.isotope-layout').forEach(function (isotopeItem) {
      let layout = isotopeItem.getAttribute('data-layout') ?? 'masonry';
      let filter = isotopeItem.getAttribute('data-default-filter') ?? '*';
      let sort = isotopeItem.getAttribute('data-sort') ?? 'original-order';

      let initIsotope;
      imagesLoaded(isotopeItem.querySelector('.isotope-container'), function () {
        initIsotope = new Isotope(isotopeItem.querySelector('.isotope-container'), {
          itemSelector: '.isotope-item',
          layoutMode: layout,
          filter: filter,
          sortBy: sort
        });
        
        // Store globally for later access
        window.portfolioIsotope = initIsotope;
      });

      isotopeItem.querySelectorAll('.isotope-filters li').forEach(function (filters) {
        filters.addEventListener('click', function () {
          isotopeItem.querySelector('.isotope-filters .filter-active').classList.remove('filter-active');
          this.classList.add('filter-active');
          initIsotope.arrange({
            filter: this.getAttribute('data-filter')
          });
          if (typeof aosInit === 'function') {
            aosInit();
          }
        }, false);
      });

    });
  }

  /**
   * Fetch Images from Cloudinary via static photos.json
   */
  async function fetchPortfolioImages() {
    const endpoints = [
      'assets/photos.json',
      '/assets/photos.json',
      'assets/mock-photos.json',
      '/assets/mock-photos.json'
    ];

    const container = document.querySelector('.isotope-container');
    const loader = document.querySelector('#portfolio-loader');

    if (!container) return;

    try {
      let data = null;
      let lastError = null;
      let usedEndpoint = null;

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (!response.ok) {
            lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
            continue;
          }
          data = await response.json();
          usedEndpoint = endpoint;
          break;
        } catch (err) {
          lastError = err;
        }
      }

      if (!data) {
        throw lastError || new Error('All photo endpoints failed');
      }

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array of images');
      }

      if (usedEndpoint && usedEndpoint.includes('mock-photos')) {
        console.warn('Using mock photos — photos.json was not found.');
      }

      const images = data;

      if (loader) loader.remove();

      if (images.length === 0) {
        if (loader) {
          loader.innerHTML = '<p class="text-warning">No images found in gallery.</p>';
        }
        initIsotopeLayout();
        return;
      }

      // Track loaded images for batched Isotope layout
      let loadedCount = 0;
      const totalImages = images.length;
      let layoutTimer = null;

      function batchLayout() {
        // Debounce layout calls — wait 150ms after last image load
        if (layoutTimer) clearTimeout(layoutTimer);
        layoutTimer = setTimeout(() => {
          if (window.portfolioIsotope) {
            window.portfolioIsotope.layout();
          }
        }, 150);
      }

      images.forEach(image => {
        const item = document.createElement('div');
        item.className = `col-lg-4 col-md-6 portfolio-item isotope-item ${image.category}`;

        // Build metadata display
        let metadataHTML = '';
        if (image.metadata) {
          const meta = image.metadata;
          const metadataItems = [];

          if (meta.iso) metadataItems.push(`<span>ISO ${meta.iso}</span>`);
          if (meta.aperture) metadataItems.push(`<span>${meta.aperture}</span>`);
          if (meta.shutterSpeed) metadataItems.push(`<span>${meta.shutterSpeed}</span>`);
          if (meta.focalLength) metadataItems.push(`<span>${meta.focalLength}</span>`);
          if (meta.dateTaken) metadataItems.push(`<i class="bi bi-calendar"></i> ${new Date(meta.dateTaken).getFullYear()}`);
          if (meta.location) metadataItems.push(`<i class="bi bi-geo-alt"></i> ${meta.location}`);

          if (metadataItems.length > 0) {
            metadataHTML = `<div class="photo-metadata">${metadataItems.join(' <span class="separator">•</span> ')}</div>`;
          }
        }

        // Use thumbnail URL for grid, full-size URL for lightbox
        const thumbSrc = image.thumb || image.src;
        const fullSrc = image.src;

        // Create image element to detect orientation
        const img = document.createElement('img');
        img.src = thumbSrc;
        img.className = 'img-fluid';
        img.alt = image.title;
        img.loading = 'lazy';
        // Add decoding async for better performance
        img.decoding = 'async';

        // Use known dimensions for immediate orientation class (avoids layout shift)
        if (image.width && image.height) {
          const aspectRatio = image.width / image.height;
          if (aspectRatio < 0.85) item.classList.add('portrait');
          else if (aspectRatio > 1.2) item.classList.add('landscape');
          else item.classList.add('square');
        }

        // Batched layout on image load
        img.onload = function () {
          loadedCount++;
          batchLayout();
        };

        // Handle broken images gracefully
        img.onerror = function () {
          loadedCount++;
          this.style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.className = 'img-placeholder d-flex align-items-center justify-content-center bg-light';
          placeholder.style.height = '200px';
          placeholder.innerHTML = '<i class="bi bi-image text-muted" style="font-size: 2rem;"></i>';
          this.parentNode.appendChild(placeholder);
          batchLayout();
        };

        item.innerHTML = `
            <a href="${fullSrc}" title="${image.title}" data-gallery="portfolio-gallery-${image.category}" class="glightbox preview-link" data-type="image">
              <div class="portfolio-img-wrapper"></div>
            </a>
          <div class="portfolio-info">
            <h4>${image.title}</h4>
            ${metadataHTML}
            <a href="${fullSrc}" title="${image.title}" class="preview-link preview-icon"><i class="bi bi-zoom-in"></i></a>
          </div>
        `;

        // Append the img to the wrapper
        item.querySelector('.portfolio-img-wrapper').appendChild(img);
        container.appendChild(item);
      });

      // Re-init GLightbox for new elements (destroy previous instance if present)
      if (window._portfolioGlightbox) {
        try {
          window._portfolioGlightbox.destroy();
        } catch (e) {
          console.warn('Failed to destroy previous glightbox instance', e);
        }
      }
      window._portfolioGlightbox = GLightbox({
        selector: '.glightbox'
      });

      // Add click handlers for zoom icons to trigger main glightbox link
      document.querySelectorAll('.preview-icon').forEach(icon => {
        icon.addEventListener('click', function (e) {
          e.preventDefault();
          const mainLink = this.closest('.portfolio-item').querySelector('.glightbox');
          if (mainLink) {
            mainLink.click();
          }
        });
      });

      // Init Isotope after adding items
      initIsotopeLayout();

    } catch (error) {
      console.error('Portfolio image load error:', error);
      if (loader) {
        loader.innerHTML = `
          <div class="alert alert-danger" role="alert">
            <h5>Failed to load images</h5>
            <p><strong>Error:</strong> ${error.message}</p>
            <hr>
            <p class="mb-1"><small><strong>Troubleshooting:</strong></small></p>
            <ul class="mb-0" style="font-size: 0.875rem;">
              <li>Ensure <code>photos.json</code> exists in <code>src/assets/</code></li>
              <li>Start the dev server with <code>npm start</code> (serves from <code>src/</code>)</li>
              <li>Check browser console (F12) for more details</li>
            </ul>
          </div>
        `;
      }
      initIsotopeLayout();
    }
  }

  // Call fetch function on load
  window.addEventListener('load', fetchPortfolioImages);

  /**
   * Init swiper sliders
   */
  function initSwiper() {
    document.querySelectorAll(".init-swiper").forEach(function (swiperElement) {
      let config = JSON.parse(
        swiperElement.querySelector(".swiper-config").innerHTML.trim()
      );

      if (swiperElement.classList.contains("swiper-tab")) {
        initSwiperWithCustomPagination(swiperElement, config);
      } else {
        new Swiper(swiperElement, config);
      }
    });
  }

  window.addEventListener("load", initSwiper);

  /**
   * Correct scrolling position upon page load for URLs containing hash links.
   */
  window.addEventListener('load', function (e) {
    if (window.location.hash) {
      if (document.querySelector(window.location.hash)) {
        setTimeout(() => {
          let section = document.querySelector(window.location.hash);
          let scrollMarginTop = getComputedStyle(section).scrollMarginTop;
          window.scrollTo({
            top: section.offsetTop - parseInt(scrollMarginTop),
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  });

  /**
   * Navmenu Scrollspy
   */
  let navmenulinks = document.querySelectorAll('.navmenu a');

  function navmenuScrollspy() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;
    const documentHeight = document.body.offsetHeight;

    navmenulinks.forEach(navmenulink => {
      if (!navmenulink.hash) return;
      let section = document.querySelector(navmenulink.hash);
      if (!section) return;

      const sectionTop = section.offsetTop;
      const sectionBottom = section.offsetTop + section.offsetHeight;

      // Special handling for the last section (Contact) when scrolled to the very bottom
      if (navmenulink.hash === '#contact' && (scrollY + viewportHeight >= documentHeight)) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else if (scrollY + 10 >= sectionTop && scrollY + 10 < sectionBottom) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    });
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

  /**
   * Calculate and display age
   */
  function calculateAge(birthYear) {
    const currentYear = new Date().getFullYear();
    return currentYear - birthYear;
  }

  function displayAge() {
    const birthYear = 1988; // Replace with the actual birth year
    const ageElement = document.querySelector('.currentage');
    if (ageElement) {
      ageElement.innerText = calculateAge(birthYear);
    }
  }

  window.addEventListener('load', displayAge);

})();