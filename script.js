/* =============================================
   ExpaHome — script.js (SuperHosting + Resend)
   ============================================= */

// === CUSTOM CURSOR ===
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');

if (cursor && cursorDot) {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        cursorDot.style.left = mouseX + 'px';
        cursorDot.style.top = mouseY + 'px';
    });

    (function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.12;
        cursorY += (mouseY - cursorY) * 0.12;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        requestAnimationFrame(animateCursor);
    })();

    document.querySelectorAll('a, button, .house-card, .gallery-item, .filter-btn, input, textarea, select, video, .preview-item').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
}

// === HEADER SCROLL ===
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 30);
    }, { passive: true });
}

// === HAMBURGER ===
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });
}

// === HERO SLIDER ===
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.dot');
let currentSlide = 0;
let sliderTimer;

function goToSlide(n) {
    slides[currentSlide]?.classList.remove('active');
    dots[currentSlide]?.classList.remove('active');
    currentSlide = (n + slides.length) % slides.length;
    slides[currentSlide]?.classList.add('active');
    dots[currentSlide]?.classList.add('active');
}

if (slides.length > 1) {
    sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            clearInterval(sliderTimer);
            goToSlide(parseInt(dot.dataset.slide));
            sliderTimer = setInterval(() => goToSlide(currentSlide + 1), 5000);
        });
    });
}

// === SCROLL REVEAL ===
const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay || 0);
            setTimeout(() => entry.target.classList.add('revealed'), delay);
            revealObs.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

// === COUNTER ANIMATION (removed) ===
document.querySelectorAll('.stat-num').forEach(el => {
    el.textContent = el.dataset.target;
});

// === SMOOTH SCROLL ===
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
        const id = link.getAttribute('href');
        if (id === '#') return;
        const target = document.querySelector(id);
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
});

// === GALLERY FILTER ===
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

if (filterBtns.length > 0) {
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            let visibleIndex = 0;
            galleryItems.forEach(item => {
                const match = filter === 'all' || item.dataset.category === filter;
                if (match) {
                    item.classList.remove('hidden');
                    item.style.animationDelay = (visibleIndex * 40) + 'ms';
                    item.style.animation = 'fadeInScale .4s ease forwards';
                    visibleIndex++;
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

// === CONTACT FORM (Netlify Function + Resend) ===
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

const API_ENDPOINT = '/.netlify/functions/contact';

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const phone = document.getElementById('phone')?.value.trim();
        const model = document.getElementById('model')?.value;
        const message = document.getElementById('message')?.value.trim();
        const privacy = document.getElementById('privacy')?.checked;
        const honeypot = document.getElementById('honeypot')?.value;

        // Clear old errors
        document.querySelector('.form-error-msg')?.remove();

        // Client-side validation
        if (!name || !email || !message) {
            showError('Моля, попълнете всички задължителни полета.');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            showError('Моля, въведете валиден имейл адрес.');
            return;
        }
        if (!privacy) {
            showError('Моля, приемете Политиката за поверителност.');
            return;
        }

        const btnText = contactForm.querySelector('.btn-text');
        const btnLoader = contactForm.querySelector('.btn-loader');
        const submitBtn = contactForm.querySelector('button[type="submit"]');

        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline';
        if (submitBtn) submitBtn.disabled = true;

        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    model,
                    message,
                    honeypot
                })
            });

            const result = await response.json();

            if (response.ok && result.success) {
                contactForm.style.display = 'none';
                if (formSuccess) formSuccess.style.display = 'block';
                formSuccess?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                throw new Error(result.error || 'Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showError(error.message || 'Възникна грешка при изпращането. Моля, опитайте отново или се свържете с нас на expahomedt@gmail.com');

            // Reset button
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

function showError(msg) {
    const err = document.createElement('div');
    err.className = 'form-error-msg';
    err.style.cssText = 'background:#fee2e2;color:#991b1b;border-radius:8px;padding:.75rem 1rem;font-size:.85rem;margin-bottom:1rem;border:1px solid #fecaca;';
    err.textContent = msg;
    contactForm.insertBefore(err, contactForm.firstChild);
    setTimeout(() => err.remove(), 5000);
}

// === SUBTLE PARALLAX ON HERO ===
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroContent = document.querySelector('.hero-content');
    if (heroContent && scrollY < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrollY * 0.07}px)`;
    }
}, { passive: true });

// === INJECT KEYFRAMES ===
const style = document.createElement('style');
style.textContent = `
@keyframes fadeInScale {
    from { opacity:0; transform:scale(0.95); }
    to   { opacity:1; transform:scale(1); }
}`;
document.head.appendChild(style);

// === FAQ ACCORDION ===
const faqItems = document.querySelectorAll('.faq-item');
if (faqItems.length > 0) {
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });
}