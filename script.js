// =========================================================
// MOBILE NAV TOGGLE — basic state management
// =========================================================
const navToggle = document.getElementById('navToggle');
const primaryNav = document.getElementById('primaryNav');

navToggle.addEventListener('click', () => {
  const isOpen = primaryNav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close menu after a link is tapped (mobile)
document.querySelectorAll('[data-link]').forEach(link => {
  link.addEventListener('click', () => {
    primaryNav.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// =========================================================
// ACTIVE NAV LINK ON SCROLL
// =========================================================
const sections = document.querySelectorAll('main section[id]');
const navLinks = document.querySelectorAll('.nav-link[data-link]');

const setActiveLink = () => {
  let currentId = '';
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= 120 && rect.bottom > 120) {
      currentId = section.id;
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
  });
};

window.addEventListener('scroll', setActiveLink);
setActiveLink();

// =========================================================
// LIVE VIEWPORT WIDTH READOUT + BREAKPOINT PREVIEW CHIPS
// =========================================================
const liveWidthEl = document.getElementById('liveWidth');
const chips = document.querySelectorAll('.chip');

const updateLiveWidth = () => {
  liveWidthEl.textContent = window.innerWidth;
};
window.addEventListener('resize', updateLiveWidth);
updateLiveWidth();

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    document.body.style.maxWidth = chip.dataset.width === '100%' ? 'none' : `${chip.dataset.width}px`;
    document.body.style.marginInline = chip.dataset.width === '100%' ? '0' : 'auto';
    document.body.style.outline = '3px dashed var(--ethereal-blue-dark)';
    document.body.style.transition = 'max-width 0.35s ease';
    setTimeout(() => { document.body.style.outline = 'none'; }, 600);
  });
});

// =========================================================
// SIMPLE COUNT-UP ANIMATION FOR STATS (basic JS state + interactivity)
// =========================================================
const animateCount = (el, target, duration = 900) => {
  let startTime = null;
  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    el.textContent = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
};

const statProjects = document.getElementById('statProjects');
const statHours = document.getElementById('statHours');
let statsAnimated = false;

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !statsAnimated) {
      animateCount(statProjects, 3);
      animateCount(statHours, 40);
      statsAnimated = true;
    }
  });
}, { threshold: 0.4 });

observer.observe(document.querySelector('.about'));

// =========================================================
// CONTACT FORM — basic validation + state feedback (no backend)
// =========================================================
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    formStatus.textContent = 'Please fill in every field before sending.';
    formStatus.style.color = '#ffd9d9';
    return;
  }

  formStatus.textContent = `Thanks, ${name.split(' ')[0]} — your message has been noted. I'll reply at ${email}.`;
  formStatus.style.color = '#eaffea';
  contactForm.reset();
});

// =========================================================
// FOOTER YEAR + BACK TO TOP
// =========================================================
document.getElementById('year').textContent = new Date().getFullYear();

document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
