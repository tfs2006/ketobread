/**
 * Keto Bread by 4OurMedia - Main JavaScript
 * Handles mobile navigation, smooth scrolling, and back-to-top button
 * Cross-browser compatible (IE11+, all modern browsers)
 */

(function() {
  'use strict';

  // ============================================
  // POLYFILLS FOR OLDER BROWSERS
  // ============================================
  
  // Element.closest() polyfill for IE11
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(selector) {
      var el = this;
      while (el) {
        if (el.matches(selector)) {
          return el;
        }
        el = el.parentElement;
      }
      return null;
    };
  }

  // Element.matches() polyfill for IE11
  if (!Element.prototype.matches) {
    Element.prototype.matches = 
      Element.prototype.msMatchesSelector || 
      Element.prototype.webkitMatchesSelector;
  }

  // NodeList.forEach() polyfill for IE11
  if (!NodeList.prototype.forEach) {
    NodeList.prototype.forEach = Array.prototype.forEach;
  }

  // requestAnimationFrame polyfill
  window.requestAnimationFrame = window.requestAnimationFrame || 
    window.webkitRequestAnimationFrame || 
    window.mozRequestAnimationFrame || 
    function(callback) {
      return window.setTimeout(callback, 1000 / 60);
    };

  // Smooth scroll polyfill (basic fallback)
  function smoothScrollTo(top) {
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo({
        top: top,
        behavior: 'smooth'
      });
    } else {
      // Fallback for browsers without smooth scroll support
      var startY = window.pageYOffset || document.documentElement.scrollTop;
      var diff = top - startY;
      var duration = 500;
      var start;
      
      function step(timestamp) {
        if (!start) start = timestamp;
        var progress = timestamp - start;
        var percent = Math.min(progress / duration, 1);
        
        // Easing function
        percent = percent * (2 - percent);
        
        window.scrollTo(0, startY + diff * percent);
        
        if (progress < duration) {
          window.requestAnimationFrame(step);
        }
      }
      
      window.requestAnimationFrame(step);
    }
  }

  // DOM Elements
  var menuToggle = document.querySelector('.menu-toggle');
  var mainNav = document.querySelector('.main-nav');
  var backToTopBtn = document.querySelector('.back-to-top');

  // ============================================
  // MOBILE NAVIGATION TOGGLE
  // ============================================
  function initMobileNav() {
    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener('click', function() {
      var isOpen = mainNav.classList.toggle('main-nav--open');
      menuToggle.classList.toggle('menu-toggle--open');
      
      // Update ARIA attributes for accessibility
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mainNav.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!event.target.closest('.site-header') && mainNav.classList.contains('main-nav--open')) {
        mainNav.classList.remove('main-nav--open');
        menuToggle.classList.remove('menu-toggle--open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mainNav.setAttribute('aria-hidden', 'true');
      }
    });

    // Close menu on window resize (if switching to desktop view)
    var resizeTimer;
    window.addEventListener('resize', function() {
      // Debounce resize event
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        if (window.innerWidth >= 768 && mainNav.classList.contains('main-nav--open')) {
          mainNav.classList.remove('main-nav--open');
          menuToggle.classList.remove('menu-toggle--open');
          menuToggle.setAttribute('aria-expanded', 'false');
          mainNav.setAttribute('aria-hidden', 'true');
        }
      }, 100);
    });

    // Handle keyboard navigation (Escape to close)
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' || event.keyCode === 27) {
        if (mainNav.classList.contains('main-nav--open')) {
          mainNav.classList.remove('main-nav--open');
          menuToggle.classList.remove('menu-toggle--open');
          menuToggle.setAttribute('aria-expanded', 'false');
          mainNav.setAttribute('aria-hidden', 'true');
          menuToggle.focus();
        }
      }
    });
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(event) {
        var targetId = this.getAttribute('href');
        
        // Skip if it's just "#" or empty
        if (targetId === '#' || targetId === '') return;

        var targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          event.preventDefault();
          
          // Calculate offset for sticky header
          var header = document.querySelector('.site-header');
          var headerHeight = header ? header.offsetHeight : 0;
          var elementTop = targetElement.getBoundingClientRect().top;
          var offsetPosition = elementTop + (window.pageYOffset || document.documentElement.scrollTop) - headerHeight - 16;

          smoothScrollTo(offsetPosition);

          // Update URL hash without jumping (only in modern browsers)
          if (history.pushState) {
            history.pushState(null, null, targetId);
          }

          // Set focus for accessibility
          targetElement.setAttribute('tabindex', '-1');
          if (targetElement.focus) {
            targetElement.focus({ preventScroll: true });
          }
        }
      });
    });
  }

  // ============================================
  // BACK TO TOP BUTTON
  // ============================================
  function initBackToTop() {
    if (!backToTopBtn) return;

    // Show/hide button based on scroll position
    function toggleBackToTop() {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollTop > 300) {
        backToTopBtn.classList.add('back-to-top--visible');
      } else {
        backToTopBtn.classList.remove('back-to-top--visible');
      }
    }

    // Throttle scroll events for performance
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          toggleBackToTop();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Scroll to top on click
    backToTopBtn.addEventListener('click', function() {
      smoothScrollTo(0);
    });

    // Initial check
    toggleBackToTop();
  }

  // ============================================
  // ACTIVE NAVIGATION LINK HIGHLIGHTING
  // ============================================
  function initActiveNavHighlight() {
    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.main-nav__link');

    navLinks.forEach(function(link) {
      var linkHref = link.href;
      var linkPath;
      
      // Handle URL parsing cross-browser (IE11 compatible)
      try {
        linkPath = new URL(linkHref).pathname;
      } catch (e) {
        // Fallback for IE11
        var parser = document.createElement('a');
        parser.href = linkHref;
        linkPath = parser.pathname;
        // IE11 may omit leading slash
        if (linkPath.charAt(0) !== '/') {
          linkPath = '/' + linkPath;
        }
      }
      
      // Check for exact match or if current page is within a section
      if (linkPath === currentPath || 
          (linkPath !== '/' && currentPath.indexOf(linkPath) === 0)) {
        link.classList.add('main-nav__link--active');
      }
    });
  }

  // ============================================
  // FAQ ACCORDION ENHANCEMENT
  // ============================================
  function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq__item');
    
    faqItems.forEach(function(item) {
      const summary = item.querySelector('summary');
      
      if (summary) {
        // Close other FAQs when opening one (optional - creates accordion behavior)
        summary.addEventListener('click', function() {
          // Comment out the following lines if you want multiple FAQs open at once
          // faqItems.forEach(function(otherItem) {
          //   if (otherItem !== item && otherItem.hasAttribute('open')) {
          //     otherItem.removeAttribute('open');
          //   }
          // });
        });
      }
    });
  }

  // ============================================
  // LAZY LOADING IMAGES (if needed in future)
  // ============================================
  function initLazyLoad() {
    // Native lazy loading is used via loading="lazy" attribute
    // This function provides fallback for older browsers
    
    var lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      lazyImages.forEach(function(img) {
        img.addEventListener('load', function() {
          img.classList.add('loaded');
        });
      });
    } else if ('IntersectionObserver' in window) {
      // Fallback using IntersectionObserver
      var imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            var image = entry.target;
            if (image.dataset.src) {
              image.src = image.dataset.src;
              image.classList.add('loaded');
            }
            imageObserver.unobserve(image);
          }
        });
      });

      lazyImages.forEach(function(img) {
        imageObserver.observe(img);
      });
    } else {
      // Final fallback - load all images immediately
      lazyImages.forEach(function(img) {
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        img.classList.add('loaded');
      });
    }
  }

  // ============================================
  // EXTERNAL LINKS - Open in new tab
  // ============================================
  function initExternalLinks() {
    var affiliateLinks = document.querySelectorAll('a[href*="clickbank.net"]');
    
    affiliateLinks.forEach(function(link) {
      // Ensure affiliate links open in new tab and have proper security attributes
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener sponsored');
    });

    // Also handle all external links
    var allLinks = document.querySelectorAll('a[href^="http"]');
    allLinks.forEach(function(link) {
      var linkHost = '';
      try {
        linkHost = new URL(link.href).host;
      } catch (e) {
        var parser = document.createElement('a');
        parser.href = link.href;
        linkHost = parser.host;
      }
      
      if (linkHost && linkHost !== window.location.host) {
        if (!link.getAttribute('target')) {
          link.setAttribute('target', '_blank');
        }
        var rel = link.getAttribute('rel') || '';
        if (rel.indexOf('noopener') === -1) {
          link.setAttribute('rel', (rel + ' noopener').trim());
        }
      }
    });
  }

  // ============================================
  // VIEWPORT HEIGHT FIX FOR MOBILE BROWSERS
  // ============================================
  function initViewportFix() {
    // Fix for mobile browsers where 100vh includes address bar
    function setVh() {
      var vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', vh + 'px');
    }
    
    setVh();
    
    var resizeTimer;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setVh, 100);
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    initMobileNav();
    initSmoothScroll();
    initBackToTop();
    initActiveNavHighlight();
    initFaqAccordion();
    initLazyLoad();
    initExternalLinks();
    initViewportFix();
  }

  // Run on DOM ready (cross-browser compatible)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded
    init();
  }

  // Expose for testing if needed
  window.KetoBread = {
    init: init
  };

})();
