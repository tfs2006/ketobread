/**
 * Keto Bread by 4OurMedia - Main JavaScript
 * Handles mobile navigation, smooth scrolling, and back-to-top button
 */

(function() {
  'use strict';

  // DOM Elements
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const backToTopBtn = document.querySelector('.back-to-top');

  // ============================================
  // MOBILE NAVIGATION TOGGLE
  // ============================================
  function initMobileNav() {
    if (!menuToggle || !mainNav) return;

    menuToggle.addEventListener('click', function() {
      const isOpen = mainNav.classList.toggle('main-nav--open');
      menuToggle.classList.toggle('menu-toggle--open');
      
      // Update ARIA attributes for accessibility
      menuToggle.setAttribute('aria-expanded', isOpen);
      mainNav.setAttribute('aria-hidden', !isOpen);
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
    window.addEventListener('resize', function() {
      if (window.innerWidth >= 768 && mainNav.classList.contains('main-nav--open')) {
        mainNav.classList.remove('main-nav--open');
        menuToggle.classList.remove('menu-toggle--open');
        menuToggle.setAttribute('aria-expanded', 'false');
        mainNav.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(event) {
        const targetId = this.getAttribute('href');
        
        // Skip if it's just "#" or empty
        if (targetId === '#' || targetId === '') return;

        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          event.preventDefault();
          
          // Calculate offset for sticky header
          const headerHeight = document.querySelector('.site-header')?.offsetHeight || 0;
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          // Update URL hash without jumping
          history.pushState(null, null, targetId);

          // Set focus for accessibility
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus({ preventScroll: true });
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
      if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('back-to-top--visible');
      } else {
        backToTopBtn.classList.remove('back-to-top--visible');
      }
    }

    // Throttle scroll events for performance
    let ticking = false;
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
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // Initial check
    toggleBackToTop();
  }

  // ============================================
  // ACTIVE NAVIGATION LINK HIGHLIGHTING
  // ============================================
  function initActiveNavHighlight() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.main-nav__link');

    navLinks.forEach(function(link) {
      const linkPath = new URL(link.href).pathname;
      
      // Check for exact match or if current page is within a section
      if (linkPath === currentPath || 
          (linkPath !== '/' && currentPath.startsWith(linkPath))) {
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
    // This function is a placeholder for future enhancements
    // such as fade-in effects when images load
    
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('loading' in HTMLImageElement.prototype) {
      // Browser supports native lazy loading
      lazyImages.forEach(function(img) {
        img.addEventListener('load', function() {
          img.classList.add('loaded');
        });
      });
    }
  }

  // ============================================
  // EXTERNAL LINKS - Open in new tab
  // ============================================
  function initExternalLinks() {
    const affiliateLinks = document.querySelectorAll('a[href*="clickbank.net"]');
    
    affiliateLinks.forEach(function(link) {
      // Ensure affiliate links open in new tab and have proper security attributes
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener sponsored');
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
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
