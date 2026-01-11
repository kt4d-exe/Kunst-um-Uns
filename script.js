/**
 * Kunst-um-Uns - Main JavaScript File
 * Handles smooth scrolling and form handling functionality
 * Created: 2026-01-11
 */

// ============================================
// SMOOTH SCROLLING FUNCTIONALITY
// ============================================

/**
 * Initialize smooth scrolling for all anchor links
 * Adds smooth scroll behavior to internal navigation links
 */
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      
      // Prevent default behavior only for valid target IDs
      if (targetId !== '#') {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without page reload
          window.history.pushState(null, null, targetId);
        }
      }
    });
  });
}

/**
 * Scroll to a specific element smoothly
 * @param {string|HTMLElement} target - Target element ID or element reference
 * @param {number} offset - Optional offset from the top in pixels
 */
function scrollToElement(target, offset = 0) {
  const element = typeof target === 'string' ? document.getElementById(target) : target;
  
  if (element) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
}

/**
 * Scroll to top of page smoothly
 * @param {number} duration - Animation duration in milliseconds (optional)
 */
function scrollToTop(duration = 800) {
  const startPosition = window.pageYOffset;
  const distance = -startPosition;
  const startTime = performance.now();
  
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }
  
  function animation(currentTime) {
    const timeElapsed = currentTime - startTime;
    const position = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, position);
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }
  
  requestAnimationFrame(animation);
}

// ============================================
// FORM HANDLING FUNCTIONALITY
// ============================================

/**
 * Initialize form validation and submission handling
 * Handles real-time validation and prevents invalid submissions
 */
function initFormHandling() {
  const forms = document.querySelectorAll('form');
  
  forms.forEach(form => {
    // Add real-time validation
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateField(this);
      });
      
      input.addEventListener('input', function() {
        clearFieldError(this);
      });
    });
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      handleFormSubmit(this);
    });
  });
}

/**
 * Validate a form field based on its type and attributes
 * @param {HTMLElement} field - The form field to validate
 * @returns {boolean} - True if field is valid, false otherwise
 */
function validateField(field) {
  const value = field.value.trim();
  const type = field.type;
  const name = field.name;
  const required = field.hasAttribute('required');
  
  // Check if field is required and empty
  if (required && !value) {
    showFieldError(field, `${name} is required`);
    return false;
  }
  
  // Type-specific validation
  switch (type) {
    case 'email':
      if (value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
      }
      break;
      
    case 'number':
      if (value && isNaN(value)) {
        showFieldError(field, 'Please enter a valid number');
        return false;
      }
      break;
      
    case 'tel':
      if (value && !isValidPhone(value)) {
        showFieldError(field, 'Please enter a valid phone number');
        return false;
      }
      break;
  }
  
  // Textarea validation
  if (field.tagName === 'TEXTAREA') {
    const minLength = field.getAttribute('minlength');
    if (minLength && value.length < parseInt(minLength)) {
      showFieldError(field, `Minimum length is ${minLength} characters`);
      return false;
    }
  }
  
  clearFieldError(field);
  return true;
}

/**
 * Display error message for a field
 * @param {HTMLElement} field - The form field
 * @param {string} message - Error message to display
 */
function showFieldError(field, message) {
  // Remove existing error if present
  clearFieldError(field);
  
  // Add error class
  field.classList.add('error');
  
  // Create and insert error message
  const errorElement = document.createElement('span');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  field.parentNode.insertBefore(errorElement, field.nextSibling);
}

/**
 * Clear error state for a field
 * @param {HTMLElement} field - The form field
 */
function clearFieldError(field) {
  field.classList.remove('error');
  
  const errorMessage = field.nextElementSibling;
  if (errorMessage && errorMessage.classList.contains('error-message')) {
    errorMessage.remove();
  }
}

/**
 * Handle form submission
 * Validates all fields and handles submission
 * @param {HTMLFormElement} form - The form element
 */
function handleFormSubmit(form) {
  const inputs = form.querySelectorAll('input, textarea, select');
  let isValid = true;
  
  // Validate all fields
  inputs.forEach(input => {
    if (!validateField(input)) {
      isValid = false;
    }
  });
  
  if (!isValid) {
    showNotification('Please correct the errors above', 'error');
    return;
  }
  
  // Form is valid - proceed with submission
  submitForm(form);
}

/**
 * Submit form data
 * Can be customized for different submission methods (AJAX, API, etc.)
 * @param {HTMLFormElement} form - The form element
 */
function submitForm(form) {
  const formData = new FormData(form);
  const method = form.method.toUpperCase();
  const action = form.action;
  
  // Show loading state
  const submitButton = form.querySelector('button[type="submit"]');
  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
  }
  
  // Send form data via AJAX
  fetch(action, {
    method: method,
    body: formData,
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  })
  .then(response => {
    if (response.ok) {
      showNotification('Form submitted successfully!', 'success');
      form.reset();
      
      // Reset all validation states
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach(input => clearFieldError(input));
    } else {
      showNotification('Error submitting form. Please try again.', 'error');
    }
  })
  .catch(error => {
    console.error('Form submission error:', error);
    showNotification('An error occurred. Please try again.', 'error');
  })
  .finally(() => {
    // Restore submit button
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Submit';
    }
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone format
 */
function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-\(\)\+]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - Type of notification ('success', 'error', 'info')
 * @param {number} duration - Duration to show notification in milliseconds
 */
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 4px;
    z-index: 9999;
    animation: slideIn 0.3s ease-in-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in-out';
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

/**
 * Debounce function to limit function execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit function execution frequency
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize all functionality when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Initializing Kunst-um-Uns scripts');
  
  initSmoothScrolling();
  initFormHandling();
  
  // Add CSS animation styles if not already present
  if (!document.getElementById('kunst-animations')) {
    const style = document.createElement('style');
    style.id = 'kunst-animations';
    style.textContent = `
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes slideOut {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }
      
      input.error,
      textarea.error,
      select.error {
        border-color: #d32f2f !important;
        background-color: #ffebee;
      }
      
      .error-message {
        display: block;
        color: #d32f2f;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }
      
      .notification {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        font-weight: 500;
      }
      
      .notification-success {
        background-color: #4caf50;
        color: white;
      }
      
      .notification-error {
        background-color: #f44336;
        color: white;
      }
      
      .notification-info {
        background-color: #2196f3;
        color: white;
      }
    `;
    document.head.appendChild(style);
  }
});

// Export functions for external use if using modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initSmoothScrolling,
    scrollToElement,
    scrollToTop,
    initFormHandling,
    validateField,
    showNotification,
    debounce,
    throttle
  };
}
