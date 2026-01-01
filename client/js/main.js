/**
 * Main JavaScript file for HOMES HUB
 * Contains shared logic for Theme, Mobile Menu, Chatbot, and UI utilities.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initBackToTop();
  initChatbot();
  initGallery();
  initContactAgent();
});

// ===== DARK MODE =====
function initTheme() {
  const htmlRoot = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  
  if (!themeToggle) return;

  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    htmlRoot.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
  } else {
    themeToggle.textContent = '🌙';
  }
  
  themeToggle.addEventListener('click', () => {
    htmlRoot.classList.toggle('dark-mode');
    const isDark = htmlRoot.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  });
}

// ===== MOBILE MENU =====
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }
}

// ===== BACK TO TOP =====
function initBackToTop() {
  const backToTopButton = document.getElementById('back-to-top');
  
  if (!backToTopButton) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopButton.style.display = 'block';
    } else {
      backToTopButton.style.display = 'none';
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== VIRTUAL ASSISTANT =====
function initChatbot() {
  const chatbotBtn = document.getElementById('chatbot-btn');
  const chatbotWindow = document.getElementById('chatbot-window');
  const closeChat = document.getElementById('close-chat');
  const chatMessages = document.getElementById('chatbot-messages');
  const chatInput = document.getElementById('chatbot-input');
  const sendMessage = document.getElementById('send-message');

  if (!chatbotBtn || !chatbotWindow) return;

  // Toggle chat window
  chatbotBtn.addEventListener('click', () => {
    chatbotWindow.style.display = chatbotWindow.style.display === 'flex' ? 'none' : 'flex';
  });

  // Close chat window
  if (closeChat) {
    closeChat.addEventListener('click', () => {
      chatbotWindow.style.display = 'none';
    });
  }

  // Send message function
  function processMessage() {
    const input = chatInput.value.trim().toLowerCase();
    if (!input) return;
    
    // Show user message
    addMessage(input, true);
    chatInput.value = '';
    
    // Default response
    let response = "I'm not sure how to help with that. Try asking about pricing, neighborhoods, favorites, or contacting agents.";
    
    // Rule-based responses
    if (input.includes('price') || input.includes('cost') || input.includes('expensive')) {
      response = "I can help you understand property pricing! Each property page shows if the price is fair, above, or below market average compared to similar homes in the area. Look for the 📊 Price Fairness Checker!";
    }
    else if (input.includes('neighbor') || input.includes('area') || input.includes('location')) {
      response = "Check the 'LIVE NEIGHBORHOOD SNAPSHOT' on any property page! It shows nearby schools, hospitals, safety ratings, and average prices for that area.";
    }
    else if (input.includes('save') || input.includes('favorite') || input.includes('heart')) {
      response = "To save a property, click the ❤️ icon on any listing! You can view all your favorites by clicking the 'Favorites' link in the navigation.";
    }
    else if (input.includes('contact') || input.includes('agent') || input.includes('email')) {
      response = "Click the 'Contact Agent' button on any property page to send a message to our team!";
    }
    else if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      response = "Hello! I'm your HOMES HUB assistant. How can I help you find your dream home today?";
    }
    else if (input.includes('thank')) {
      response = "You're welcome! Happy house hunting! 🏠";
    }
    
    // Show bot response after a short delay
    setTimeout(() => addMessage(response), 500);
  }

  function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${isUser ? 'user-message' : 'bot-message'}`;
    messageDiv.innerHTML = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // Event listeners for sending
  if (sendMessage) sendMessage.addEventListener('click', processMessage);
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') processMessage();
    });
  }
}

// ===== IMAGE GALLERY =====
function initGallery() {
  const galleryModal = document.getElementById('gallery-modal');
  const modalImage = document.getElementById('modal-image');
  const detailImage = document.getElementById('detail-image');
  
  if (!galleryModal || !modalImage || !detailImage) return;

  // Make global so onclick in HTML works (if used there)
  // But better to attach event listener here if we can identify the trigger
  // The trigger is onclick="openGallery()" in HTML usually. 
  // Let's attach to window to support existing inline calls or refactor HTML.
  // The user's HTML likely has onclick="openGallery()".
  // Let's attach to window for compatibility with inline handlers.
  window.openGallery = function() {
    modalImage.src = detailImage.src;
    galleryModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeGallery = function() {
    galleryModal.style.display = 'none';
    document.body.style.overflow = 'auto';
  };

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') window.closeGallery();
  });
  
  // Close on click outside (optional, but good UX)
  galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) window.closeGallery();
  });
}

// ===== CONTACT AGENT =====
function initContactAgent() {
  // Expose globally for onclick="contactAgent()"
  window.contactAgent = function() {
    const titleElement = document.getElementById('detail-title');
    const title = titleElement ? titleElement.textContent : 'Property';
    const subject = `Inquiry: ${title}`;
    const body = `Hello,\n\nI am interested in the following property:\n\n${title}\n\nPlease share more details.\n\nThank you!`;
    window.location.href = `mailto:maheenrauf55@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
}

function proxyImageUrl(url) {
  try {
    const u = new URL(url);
    const allowed = ['images.unsplash.com'];
    if (!allowed.includes(u.hostname)) return url;
    return `/api/proxy/image?url=${encodeURIComponent(url)}`;
  } catch {
    return url;
  }
}

window.proxyImageUrl = proxyImageUrl;
