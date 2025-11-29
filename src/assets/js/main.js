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
   * Fetch Images from NAS
   */
  async function fetchNasImages() {
    // Use mock data for now - uncomment proxy line after uploading PHP to NAS
    //const apiEndpoint = '/assets/mock-photos.json';
    const apiEndpoint = '/api/photos';
    
    const container = document.querySelector('.isotope-container');
    const loader = document.querySelector('#portfolio-loader');

    if (!container) return;

    try {
      console.log('Fetching images from:', apiEndpoint);
      const response = await fetch(apiEndpoint);
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data);

      // Check if data contains an error
      if (data.error) {
        throw new Error(`API Error: ${data.error}${data.path ? ' - Path: ' + data.path : ''}`);
      }

      // Check if data is an array
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected array of images');
      }

      const images = data;

      if (loader) loader.remove();

      if (images.length === 0) {
        if (loader) {
          loader.innerHTML = '<p class="text-warning">No images found in gallery.</p>';
        }
        console.warn('No images returned from API');
        initIsotopeLayout();
        return;
      }

      console.log(`Rendering ${images.length} images...`);

      images.forEach(image => {
        const item = document.createElement('div');
        item.className = `col-lg-4 col-md-6 portfolio-item isotope-item ${image.category}`;
        
        // Build metadata display
        let metadataHTML = '';
        if (image.metadata) {
          const meta = image.metadata;
          const metadataItems = [];
          
          if (meta.camera) metadataItems.push(`<i class="bi bi-camera"></i> ${meta.camera}`);
          if (meta.lens) metadataItems.push(`<i class="bi bi-camera-reels"></i> ${meta.lens}`);
          if (meta.iso) metadataItems.push(`<span>ISO ${meta.iso}</span>`);
          if (meta.aperture) metadataItems.push(`<span>${meta.aperture}</span>`);
          if (meta.shutterSpeed) metadataItems.push(`<span>${meta.shutterSpeed}</span>`);
          if (meta.focalLength) metadataItems.push(`<span>${meta.focalLength}</span>`);
          if (meta.dateTaken) metadataItems.push(`<i class="bi bi-calendar"></i> ${new Date(meta.dateTaken).toLocaleDateString()}`);
          if (meta.location) metadataItems.push(`<i class="bi bi-geo-alt"></i> ${meta.location}`);
          
          if (metadataItems.length > 0) {
            metadataHTML = `<div class="photo-metadata">${metadataItems.join(' <span class="separator">•</span> ')}</div>`;
          }
        }
        
        item.innerHTML = `
          <a href="${image.src}" title="${image.title}" data-gallery="portfolio-gallery-${image.category}" class="glightbox preview-link">
            <img src="${image.src}" class="img-fluid" alt="${image.title}" loading="lazy">
          </a>
          <div class="portfolio-info">
            <h4>${image.title}</h4>
            <!-- <p>${image.category}</p> -->
            ${metadataHTML}
            <a href="${image.src}" title="${image.title}" data-gallery="portfolio-gallery-${image.category}" class="glightbox preview-link"><i class="bi bi-zoom-in"></i></a>
          </div>
        `;
        container.appendChild(item);
      });

      // Re-init GLightbox for new elements
      const glightbox = GLightbox({
        selector: '.glightbox'
      });

      // Init Isotope after adding items
      initIsotopeLayout();

      console.log('Images rendered successfully');

    } catch (error) {
      console.error('Error fetching images:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      });
      
      if (loader) {
        loader.innerHTML = `
          <div class="alert alert-danger" role="alert">
            <h5>Failed to load images</h5>
            <p><strong>Error:</strong> ${error.message}</p>
            <p class="mb-0"><small>Check browser console (F12) for more details</small></p>
          </div>
        `;
      }
      // Fallback: Init Isotope anyway so the layout doesn't break if there are static items (though we removed them)
      initIsotopeLayout();
    }
  }

  // Call fetch function on load
  window.addEventListener('load', fetchNasImages);

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