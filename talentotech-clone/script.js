// Mobile menu toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  hamburger.classList.toggle('active');
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
    // Close mobile menu after clicking a link
    if (navMenu.classList.contains('active')) {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });
});

// Animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate');
    }
  });
}, observerOptions);

// Observe all sections for animation
document.querySelectorAll('section').forEach(section => {
  observer.observe(section);
});

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    section {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }
    section.animate {
        opacity: 1;
        transform: translateY(0);
    }
    .hamburger.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
        transition: transform 0.3s ease;
    }
    .hamburger.active span:nth-child(2) {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    .hamburger.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
        transition: transform 0.3s ease;
    }

    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    .bootcamp-item:nth-child(odd) {
        animation: slideInLeft 0.6s ease-out forwards;
    }

    .bootcamp-item:nth-child(even) {
        animation: slideInRight 0.6s ease-out forwards;
    }

    .benefit:nth-child(odd) {
        animation: slideInLeft 0.6s ease-out forwards;
    }

    .benefit:nth-child(even) {
        animation: slideInRight 0.6s ease-out forwards;
    }

    .step:nth-child(odd) {
        animation: slideInLeft 0.6s ease-out forwards;
    }

    .step:nth-child(even) {
        animation: slideInRight 0.6s ease-out forwards;
    }
`;
document.head.appendChild(style);

// CTA button click handler (redirects to official site)
document.querySelector('.cta-button').addEventListener('click', () => {
  window.open('https://talentotech.gov.co/', '_blank');
});

// Bootcamp item hover effects (additional enhancement)
document.querySelectorAll('.bootcamp-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.style.transform = 'translateY(-10px) scale(1.02)';
  });
  item.addEventListener('mouseleave', () => {
    item.style.transform = 'translateY(0) scale(1)';
  });
});

// FAQ accordion functionality
document.querySelectorAll('.faq-question').forEach(question => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;
    const isOpen = answer.style.display === 'block';

    // Close all answers
    document.querySelectorAll('.faq-answer').forEach(ans => {
      ans.style.display = 'none';
    });

    // Open clicked answer if it was closed
    if (!isOpen) {
      answer.style.display = 'block';
    }
  });
});

// Enhanced animations for testimonials
document.querySelectorAll('.testimonial').forEach((testimonial, index) => {
  testimonial.style.animationDelay = `${index * 0.2}s`;
});