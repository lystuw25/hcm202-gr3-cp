/**
 * Project: Nhat Tam Tap Ky - 3D Interactive Book
 * File: Main JavaScript
 * Description: Interactive book with 3D flipping animation
 * Author: BaoTQ
 * Created: January 2026
 * Last Modified: 2026-01-30
 * 
 * TABLE OF CONTENTS:
 * 1. State Management
 * 2. DOM Elements
 * 3. Initialization Functions
 * 4. Book Control Functions
 * 5. Navigation Functions
 * 6. UI Update Functions
 * 7. Video Modal Functions
 * 8. Interaction Handlers
 * 9. Event Listeners
 * 10. App Initialization
 */

// ============================================
// 1. STATE MANAGEMENT
// ============================================
let isOpen = false;
let currentPage = -1;
let rotateX = 0;
let rotateY = 0;
let isDragging = false;
let startX, startY;
let isTocVisible = false;
let isThankYouMode = false;

// ============================================
// 2. DOM ELEMENTS
// ============================================
const DOM = {
  book: document.getElementById('book'),
  bookWrapper: document.getElementById('bookWrapper'),
  coverFront: document.getElementById('coverFront'),
  pagesContainer: document.getElementById('pagesContainer'),
  tocPanel: document.getElementById('tocPanel'),
  controls: document.getElementById('controls'),
  openHint: document.getElementById('openHint'),
  prevBtn: document.getElementById('prevBtn'),
  nextBtn: document.getElementById('nextBtn'),
  closeBtn: document.getElementById('closeBtn'),
  tocBtn: document.getElementById('tocBtn'),
  pageIndicator: document.getElementById('pageIndicator'),
  tocItems: document.querySelectorAll('.toc-item'),
  pages: document.querySelectorAll('.page'),
  videoOverlay: document.getElementById('videoOverlay'),
  videoModal: document.getElementById('videoModal'),
  modalClose: document.getElementById('modalClose'),
  pageVideo: document.getElementById('pageVideo'),
  modalVideo: document.getElementById('modalVideo'),
  scene: document.getElementById('scene'),
  thankYouScreen: document.getElementById('thankYouScreen'),
  backBtn: document.getElementById('backBtn')
};

// ============================================
// 3. INITIALIZATION FUNCTIONS
// ============================================

/**
 * Generate stars in the universe background
 * Creates 300 regular stars and 3 shooting stars
 */
function generateStars() {
  const starsContainer = document.getElementById('stars');

  // Regular stars - 300
  for (let i = 0; i < 300; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    const size = Math.random() * 3 + 1;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    star.style.setProperty('--duration', (Math.random() * 3 + 2) + 's');
    star.style.setProperty('--min-opacity', Math.random() * 0.3 + 0.1);
    star.style.animationDelay = Math.random() * 5 + 's';
    starsContainer.appendChild(star);
  }

  // Shooting stars - 3
  for (let i = 0; i < 3; i++) {
    const shootingStar = document.createElement('div');
    shootingStar.className = 'shooting-star';
    shootingStar.style.left = Math.random() * 100 + '%';
    shootingStar.style.top = Math.random() * 50 + '%';
    shootingStar.style.animationDelay = (Math.random() * 5 + i * 3) + 's';
    starsContainer.appendChild(shootingStar);
  }
}

// ============================================
// 4. BOOK CONTROL FUNCTIONS
// ============================================

/**
 * Open the book
 * Sets initial state and shows controls
 */
function openBook() {
  if (isOpen) return;

  isOpen = true;
  currentPage = 0;
  DOM.book.classList.add('open');
  DOM.controls.classList.add('visible');
  DOM.openHint.style.display = 'none';

  // Don't show TOC immediately
  isTocVisible = false;
  DOM.tocPanel.classList.remove('active');
  DOM.tocBtn.classList.remove('active');

  updateUI();
}

/**
 * Close the book with stagger animation
 * Flips all pages back in sequence
 */
function closeBook() {
  if (!isOpen) return;

  const flippedPages = [...DOM.pages].filter(p => p.classList.contains('flipped'));
  const staggerDelay = 100;

  flippedPages.reverse().forEach((page, index) => {
    setTimeout(() => {
      page.classList.remove('flipped');
    }, index * staggerDelay);
  });

  const totalDelay = flippedPages.length * staggerDelay + 400;

  setTimeout(() => {
    isOpen = false;
    currentPage = -1;
    isTocVisible = false;
    DOM.tocPanel.classList.remove('active');
    DOM.tocBtn.classList.remove('active');
    DOM.book.classList.remove('open');
    DOM.controls.classList.remove('visible');
    DOM.openHint.style.display = 'block';
    updateUI();
  }, totalDelay);
}

/**
 * Show Thank You Screen
 * Displays end screen with team information
 */
function showThankYou() {
  isThankYouMode = true;

  // Hide book and controls with fade
  DOM.bookWrapper.classList.add('hidden');
  DOM.controls.classList.remove('visible');

  // Show thank you screen after book fades
  setTimeout(() => {
    DOM.thankYouScreen.classList.add('active');
    DOM.backBtn.classList.add('visible');
  }, 600);
}

/**
 * Return from Thank You screen back to book
 * Resets to first page
 */
function backToBook() {
  isThankYouMode = false;

  // Hide thank you screen
  DOM.thankYouScreen.classList.remove('active');
  DOM.backBtn.classList.remove('visible');

  // Show book again
  setTimeout(() => {
    DOM.bookWrapper.classList.remove('hidden');
    // Reset to first page
    DOM.pages.forEach(page => page.classList.remove('flipped'));
    currentPage = 0;
    DOM.controls.classList.add('visible');
    updateUI();
  }, 600);
}

/**
 * Toggle Table of Contents visibility
 */
function toggleToc() {
  if (!isOpen) return;

  isTocVisible = !isTocVisible;
  DOM.tocPanel.classList.toggle('active', isTocVisible);
  DOM.tocBtn.classList.toggle('active', isTocVisible);
}

// ============================================
// 5. NAVIGATION FUNCTIONS
// ============================================

/**
 * Flip to next page
 * Shows Thank You screen if at last page
 */
function flipNext() {
  if (!isOpen) return;

  if (currentPage < 7) {
    DOM.pages[currentPage].classList.add('flipped');
    currentPage++;
    updateUI();
  } else if (currentPage === 7) {
    // At last page, show Thank You screen
    showThankYou();
  }
}

/**
 * Flip to previous page
 * Closes book if at first page
 */
function flipPrev() {
  if (!isOpen) return;

  if (currentPage > 0) {
    currentPage--;
    DOM.pages[currentPage].classList.remove('flipped');
    updateUI();
  } else if (currentPage === 0) {
    closeBook();
  }
}

/**
 * Go to specific page with animated transitions
 * @param {number} pageIndex - Target page index (0-7)
 */
function goToPage(pageIndex) {
  if (!isOpen || pageIndex < 0 || pageIndex > 7) return;

  if (pageIndex > currentPage) {
    // Flip forward
    for (let i = currentPage; i < pageIndex; i++) {
      setTimeout(() => {
        DOM.pages[i].classList.add('flipped');
      }, (i - currentPage) * 150);
    }
  } else if (pageIndex < currentPage) {
    // Flip backward
    for (let i = currentPage - 1; i >= pageIndex; i--) {
      setTimeout(() => {
        DOM.pages[i].classList.remove('flipped');
      }, (currentPage - 1 - i) * 150);
    }
  }

  setTimeout(() => {
    currentPage = pageIndex;
    updateUI();

    // Hide TOC after navigation
    isTocVisible = false;
    DOM.tocPanel.classList.remove('active');
    DOM.tocBtn.classList.remove('active');
  }, Math.abs(pageIndex - currentPage) * 150 + 100);
}

// ============================================
// 6. UI UPDATE FUNCTIONS
// ============================================

/**
 * Update UI elements based on current state
 * Updates page indicator and TOC active states
 */
function updateUI() {
  if (isOpen) {
    DOM.pageIndicator.textContent = `Trang ${currentPage + 1}/8`;
  }

  // Update TOC active item
  DOM.tocItems.forEach((item, index) => {
    item.classList.toggle('active', index === currentPage);
  });

  // Enable/disable navigation buttons
  DOM.prevBtn.disabled = false;
  DOM.nextBtn.disabled = false;
}

// ============================================
// 7. VIDEO MODAL FUNCTIONS
// ============================================

/**
 * Open video in fullscreen modal
 * Rotates book and plays video
 */
function openVideoModal() {
  DOM.bookWrapper.classList.add('rotated');

  setTimeout(() => {
    DOM.videoModal.classList.add('active');
    DOM.modalVideo.currentTime = 0;
    DOM.modalVideo.play();
  }, 800);
}

/**
 * Close video modal and return to book
 */
function closeVideoModal() {
  DOM.modalVideo.pause();
  DOM.videoModal.classList.remove('active');

  setTimeout(() => {
    DOM.bookWrapper.classList.remove('rotated');
  }, 100);
}

// ============================================
// 8. INTERACTION HANDLERS
// ============================================

/**
 * Handle drag start for book rotation
 * @param {Event} e - Mouse or touch event
 */
function handleDragStart(e) {
  if (isOpen || isThankYouMode) return;
  isDragging = true;
  startX = e.clientX || e.touches[0].clientX;
  startY = e.clientY || e.touches[0].clientY;
}

/**
 * Handle drag move for book rotation
 * @param {Event} e - Mouse or touch event
 */
function handleDragMove(e) {
  if (!isDragging || isOpen || isThankYouMode) return;

  const x = e.clientX || e.touches[0].clientX;
  const y = e.clientY || e.touches[0].clientY;

  const deltaX = (x - startX) * 0.3;
  const deltaY = (y - startY) * 0.3;

  rotateY = Math.max(-30, Math.min(30, deltaX));
  rotateX = Math.max(-15, Math.min(15, -deltaY));

  DOM.book.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

/**
 * Handle drag end - reset book rotation
 */
function handleDragEnd() {
  if (!isDragging) return;
  isDragging = false;

  DOM.book.style.transition = 'transform 0.5s ease';
  DOM.book.style.transform = 'rotateX(0deg) rotateY(0deg)';
  rotateX = 0;
  rotateY = 0;

  setTimeout(() => {
    DOM.book.style.transition = '';
  }, 500);
}

/**
 * Handle mouse hover for subtle book rotation
 * @param {Event} e - Mouse event
 */
function handleHover(e) {
  if (isOpen || isDragging || isThankYouMode) return;

  const rect = DOM.scene.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const x = (e.clientX - centerX) / (rect.width / 2);
  const y = (e.clientY - centerY) / (rect.height / 2);

  rotateY = x * 10;
  rotateX = -y * 5;

  DOM.book.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

/**
 * Reset hover effect when mouse leaves
 */
function resetHover() {
  if (isOpen || isDragging || isThankYouMode) return;

  DOM.book.style.transition = 'transform 0.5s ease';
  DOM.book.style.transform = 'rotateX(0deg) rotateY(0deg)';

  setTimeout(() => {
    DOM.book.style.transition = '';
  }, 500);
}

// ============================================
// 9. EVENT LISTENERS
// ============================================

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Book controls
  DOM.coverFront.addEventListener('click', (e) => {
    if (!isOpen && !isThankYouMode) {
      openBook();
      e.stopPropagation();
    }
  });

  DOM.prevBtn.addEventListener('click', flipPrev);
  DOM.nextBtn.addEventListener('click', flipNext);
  DOM.closeBtn.addEventListener('click', closeBook);
  DOM.tocBtn.addEventListener('click', toggleToc);
  DOM.backBtn.addEventListener('click', backToBook);

  // TOC navigation
  DOM.tocItems.forEach((item) => {
    item.addEventListener('click', () => {
      const pageIndex = parseInt(item.dataset.page);
      goToPage(pageIndex);
    });
  });

  // Video controls
  DOM.videoOverlay.addEventListener('click', (e) => {
    e.stopPropagation();
    openVideoModal();
  });

  DOM.modalClose.addEventListener('click', closeVideoModal);
  DOM.videoModal.addEventListener('click', (e) => {
    if (e.target === DOM.videoModal) {
      closeVideoModal();
    }
  });

  // Drag events
  DOM.scene.addEventListener('mousedown', handleDragStart);
  DOM.scene.addEventListener('mousemove', handleDragMove);
  DOM.scene.addEventListener('mouseup', handleDragEnd);
  DOM.scene.addEventListener('mouseleave', handleDragEnd);

  DOM.scene.addEventListener('touchstart', handleDragStart);
  DOM.scene.addEventListener('touchmove', handleDragMove);
  DOM.scene.addEventListener('touchend', handleDragEnd);

  // Hover events
  DOM.scene.addEventListener('mousemove', handleHover);
  DOM.scene.addEventListener('mouseleave', resetHover);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (isThankYouMode) {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        backToBook();
      }
      return;
    }

    if (!isOpen) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      flipNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      flipPrev();
    } else if (e.key === 'Escape') {
      if (DOM.videoModal.classList.contains('active')) {
        closeVideoModal();
      } else if (isTocVisible) {
        toggleToc();
      } else {
        closeBook();
      }
    } else if (e.key === 't' || e.key === 'T') {
      toggleToc();
    }
  });
}

// ============================================
// 10. APP INITIALIZATION
// ============================================

/**
 * Initialize the application
 * Called when DOM is ready
 */
function init() {
  generateStars();
  setupEventListeners();
  console.log('3D Interactive Book initialized successfully!');
}

// Run when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
