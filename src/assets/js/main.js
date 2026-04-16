/**
* Template Name: MyResume
* Template URL: https://bootstrapmade.com/free-html-bootstrap-template-my-resume/
* Updated: Jun 29 2024 with Bootstrap v5.3.3
* Author: BootstrapMade.com
* License: https://bootstrapmade.com/license/
*/

(function () {
  "use strict";

  const CONFIG = {
    scrollTopThreshold: 100,
    scrollspyOffset: 10,
    layoutDebounceMs: 150,
    hashScrollDelayMs: 100,
    typed: { typeSpeed: 100, backSpeed: 50, backDelay: 2000 },
    aos: { duration: 600, easing: 'ease-in-out', once: true, mirror: false },
    aspectRatio: { portraitMax: 0.85, landscapeMin: 1.2 }
  };

  const portfolio = {};
  window.portfolio = portfolio;

  // ──────────────────────────────────────────────
  // Content renderer — populates sections from content.json
  // ──────────────────────────────────────────────

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  async function loadContent() {
    const endpoints = ['assets/content.json', '/assets/content.json'];
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint);
        if (response.ok) return await response.json();
      } catch (_) { /* try next */ }
    }
    return null;
  }

  function renderContent(data) {
    // ── About ──
    const aboutIntro = document.querySelector('[data-slot="about.intro"]');
    if (aboutIntro) aboutIntro.textContent = data.about.intro;

    const aboutBody = document.querySelector('[data-slot="about.body"]');
    if (aboutBody) {
      const facts = data.about.facts.map(f =>
        `<li><i class="bi bi-chevron-right"></i> <strong>${escapeHtml(f.label)}:</strong> <span>${escapeHtml(f.value)}</span></li>`
      ).join('');
      aboutBody.innerHTML = `
        <div class="row gy-4 justify-content-center">
          <div class="col-lg-4">
            <img src="${escapeHtml(data.about.profileImage)}" class="img-fluid" alt="${escapeHtml(data.site.name)}">
          </div>
          <div class="col-lg-8 content">
            <h2>${escapeHtml(data.about.headline)}</h2>
            <p class="fst-italic py-3">${escapeHtml(data.about.subheadline)}</p>
            <div class="row"><div class="col-lg"><ul>${facts}</ul></div></div>
          </div>
        </div>`;
    }

    // ── Skills ──
    const skillsSlot = document.querySelector('[data-slot="skills"]');
    if (skillsSlot) {
      skillsSlot.innerHTML = data.skills.map((s, i) => `
        <div class="col-lg-6 col-md-6">
          <div class="skill-category" data-aos="fade-up" data-aos-delay="${100 + i * 100}">
            <div class="skill-category-header">
              <i class="bi ${escapeHtml(s.icon)}"></i>
              <h3>${escapeHtml(s.title)}</h3>
            </div>
            <div class="skill-tags">
              ${s.tags.map(t => `<span class="skill-tag">${escapeHtml(t)}</span>`).join('')}
            </div>
          </div>
        </div>`).join('');
    }

    // ── Resume (CV QR + education + experience) ──
    const cvSlot = document.querySelector('[data-slot="resume.cv"]');
    if (cvSlot && data.resume.cvUrl) {
      cvSlot.innerHTML = `
        <a href="${escapeHtml(data.resume.cvUrl)}" target="_blank" rel="noopener noreferrer">
          <img src="${escapeHtml(data.resume.cvQrImage)}" alt="Resume QR Code" class="qr-code-img">
        </a>
        <div class="qr-code-label">
          <a href="${escapeHtml(data.resume.cvUrl)}" target="_blank" rel="noopener noreferrer">Download Latest CV</a>
        </div>`;
    }

    const eduCol = document.querySelector('[data-slot="resume.education"]');
    if (eduCol) {
      const edu = (data.resume.education || []).map(e => {
        const certs = e.certificates
          ? `<h6>Certificates Taken:</h6><ul>${e.certificates.map(c => `<li>${escapeHtml(c)}</li>`).join('')}</ul>`
          : '';
        return `<div class="resume-item">
          <h4>${escapeHtml(e.degree)}</h4>
          <h5>${escapeHtml(e.period)}</h5>
          <p><em>${escapeHtml(e.institution)}</em></p>
          ${certs}
        </div>`;
      }).join('');
      const certs = (data.resume.certifications || []).map(c => `
        <div class="resume-item">
          <h4>${escapeHtml(c.degree)}</h4>
          <h5>${escapeHtml(c.period)}</h5>
          <p><em>${escapeHtml(c.institution)}</em></p>
        </div>`).join('');
      eduCol.innerHTML = `
        <h3 class="resume-title">Education</h3>
        ${edu}
        ${certs ? `<h3 class="resume-title">Professional Certifications</h3>${certs}` : ''}`;
    }

    const expCol = document.querySelector('[data-slot="resume.experience"]');
    if (expCol) {
      const exp = (data.resume.experience || []).map(e => {
        const groups = (e.groups || []).map(g => `
          <h6>${escapeHtml(g.heading)}</h6>
          <ul>${(g.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>
        `).join('');
        return `<div class="resume-item">
          <h4>${escapeHtml(e.role)}</h4>
          <h5>${escapeHtml(e.period)}</h5>
          <p><em>${escapeHtml(e.company)}</em></p>
          ${groups}
        </div>`;
      }).join('');
      expCol.innerHTML = `<h3 class="resume-title">Professional Experience</h3>${exp}`;
    }

    // ── Photography intro ──
    const photoIntro = document.querySelector('[data-slot="photography.intro"]');
    if (photoIntro) photoIntro.textContent = data.photography.intro;
    const photoSub = document.querySelector('[data-slot="photography.subintro"]');
    if (photoSub) photoSub.innerHTML = `<em>${escapeHtml(data.photography.subintro)}</em>`;

    // ── Contact ──
    const contactIntro = document.querySelector('[data-slot="contact.intro"]');
    if (contactIntro) contactIntro.textContent = data.contact.intro;
    const contactItems = document.querySelector('[data-slot="contact.items"]');
    if (contactItems) {
      contactItems.innerHTML = (data.contact.items || []).map((c, i) => {
        const val = c.url
          ? `<a href="${escapeHtml(c.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(c.value)}</a>`
          : escapeHtml(c.value);
        return `<div class="info-item d-flex" data-aos="fade-up" data-aos-delay="${200 + i * 100}">
          <i class="bi ${escapeHtml(c.icon)} flex-shrink-0"></i>
          <div><h3>${escapeHtml(c.title)}</h3><p>${val}</p></div>
        </div>`;
      }).join('');
    }

    // ── Socials (hero + footer) ──
    document.querySelectorAll('[data-slot="socials"]').forEach(el => {
      el.innerHTML = (data.socials || []).map(s =>
        `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(s.label)}"><i class="bi ${escapeHtml(s.icon)}"></i></a>`
      ).join('');
    });

    // ── Site name (footer, hero, etc.) ──
    document.querySelectorAll('[data-slot="site.name"]').forEach(el => {
      el.textContent = data.site.name;
    });
  }

  // Kick off content load immediately; keep a promise others can await.
  const contentReady = loadContent().then(data => {
    if (data) {
      renderContent(data);
      portfolio.content = data;
    } else {
      console.error('content.json failed to load — page sections will be empty.');
    }
  });

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
      window.scrollY > CONFIG.scrollTopThreshold ? scrollTop.classList.add('active') : scrollTop.classList.remove('active');
    }
  }
  if (scrollTop) scrollTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  window.addEventListener('load', toggleScrollTop);
  document.addEventListener('scroll', toggleScrollTop);

  /**
   * Animation on scroll function and init — runs after content renders so the
   * dynamically injected [data-aos] elements are picked up.
   */
  function aosInit() {
    if (typeof AOS !== 'undefined') AOS.init(CONFIG.aos);
  }
  window.addEventListener('load', () => contentReady.then(aosInit));

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
      ...CONFIG.typed
    });
  }

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
        
        portfolio.isotope = initIsotope;
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

      // Debounced Isotope layout — recomputes once images finish decoding
      let layoutTimer = null;

      function batchLayout() {
        if (layoutTimer) clearTimeout(layoutTimer);
        layoutTimer = setTimeout(() => {
          if (portfolio.isotope) portfolio.isotope.layout();
        }, CONFIG.layoutDebounceMs);
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
          if (aspectRatio < CONFIG.aspectRatio.portraitMax) item.classList.add('portrait');
          else if (aspectRatio > CONFIG.aspectRatio.landscapeMin) item.classList.add('landscape');
          else item.classList.add('square');
        }

        // Batched layout on image load
        img.onload = function () {
          batchLayout();
        };

        // Handle broken images gracefully
        img.onerror = function () {
          this.style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.className = 'img-placeholder d-flex align-items-center justify-content-center bg-light';
          placeholder.style.height = '200px';
          placeholder.innerHTML = '<i class="bi bi-image text-muted" style="font-size: 2rem;"></i>';
          this.parentNode.appendChild(placeholder);
          batchLayout();
        };

        item.innerHTML = `
            <a href="${fullSrc}" title="${image.title}" data-gallery="portfolio-gallery" class="glightbox preview-link" data-type="image">
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

      if (portfolio.glightbox) {
        try { portfolio.glightbox.destroy(); } catch (e) { /* ignore */ }
      }
      portfolio.glightbox = GLightbox({ selector: '.glightbox' });

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
        }, CONFIG.hashScrollDelayMs);
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
      } else if (scrollY + CONFIG.scrollspyOffset >= sectionTop && scrollY + CONFIG.scrollspyOffset < sectionBottom) {
        document.querySelectorAll('.navmenu a.active').forEach(link => link.classList.remove('active'));
        navmenulink.classList.add('active');
      } else {
        navmenulink.classList.remove('active');
      }
    });
  }
  window.addEventListener('load', navmenuScrollspy);
  document.addEventListener('scroll', navmenuScrollspy);

})();