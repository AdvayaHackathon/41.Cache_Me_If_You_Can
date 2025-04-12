

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking on a nav link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form input values
        const name = this.querySelector('input[type="text"]').value;
        const email = this.querySelector('input[type="email"]').value;
        const message = this.querySelector('textarea').value;
        
        // Simple validation
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        // Simulate form submission
        alert('Thank you for your message! We will get back to you soon.');
        this.reset();
    });
}

// Add scroll animation for sections
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (sectionTop < windowHeight * 0.75) {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }
    });
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Add initial animations to sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        // Explore button logic
const exploreBtn = document.querySelector('.btn-explore');
const exploreContent = document.getElementById('explore-content');

if (exploreBtn && exploreContent) {
    exploreBtn.addEventListener('click', function (e) {
        e.preventDefault();
        exploreContent.style.display = 'block';
        exploreContent.scrollIntoView({ behavior: 'smooth' });
    });
}

    });
    
    // Trigger initial scroll event to show visible sections
    window.dispatchEvent(new Event('scroll'));
// Let's Start button logic
document.querySelector('.btn-Lets-Start').addEventListener('click', function(e) {
    e.preventDefault(); // prevent default link behavior
    
    const isLoggedIn = sessionStorage.getItem('isLoggedIn'); // or localStorage

    if (isLoggedIn === 'true') {
        // Proceed to the chatbot or next step
        window.location.href = 'chatbot.html'; // change to your actual chatbot URL
    } else {
        // Redirect to login
        window.location.href = 'login.html';
    }
});
});
