
const data = window.weddingData;
const loader = document.getElementById('loader');
const cover = document.getElementById('cover');
const openBtn = document.getElementById('openInvitation');
const mainContent = document.getElementById('mainContent');
const music = document.getElementById('music');
const musicButton = document.getElementById('musicButton');
const guestNameEl = document.getElementById('guestName');
const copyBtn = document.getElementById('copyRekening');
const toast = document.getElementById('toast');
const galleryModal = document.getElementById('galleryModal');
const modalImage = document.getElementById('modalImage');
const modalClose = document.querySelector('.modal-close');
const modalPrev = document.querySelector('.modal-prev');
const modalNext = document.querySelector('.modal-next');
const galleryButtons = Array.from(document.querySelectorAll('.gallery-item'));
const wishList = document.getElementById('wishList');
const rsvpForm = document.getElementById('rsvpForm');
const sections = Array.from(document.querySelectorAll('main section, footer'));
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));

let heroIndex = 0;
let sliderTimer = null;
let currentGalleryIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  initGuest();
  initLoader();
  initHeroSlider();
  initReveal();
  initCountdown();
  initMusic();
  initCopy();
  initGallery();
  initWishes();
  initRSVP();
  initNavigation();
});

function initGuest() {
  const params = new URLSearchParams(window.location.search);
  const to = params.get('to');
  if (to) {
    guestNameEl.textContent = decodeURIComponent(to.replace(/\+/g, ' '));
  }
}

function initLoader() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hide');
    }, 800);
  });
}

function initHeroSlider() {
  if (!heroSlides.length) return;

  const showSlide = (index) => {
    heroSlides.forEach((slide, i) => slide.classList.toggle('active', i === index));
  };

  const nextSlide = () => {
    heroIndex = (heroIndex + 1) % heroSlides.length;
    showSlide(heroIndex);
  };

  showSlide(heroIndex);
  sliderTimer = setInterval(nextSlide, 6500);
}

function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('show');
    });
  }, { threshold: 0.15 });

  reveals.forEach(el => observer.observe(el));
}

function initCountdown() {
  const targetDate = new Date(data.date).getTime();

  const update = () => {
    const now = new Date().getTime();
    const diff = Math.max(targetDate - now, 0);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(3, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
  };

  update();
  setInterval(update, 1000);
}

async function initMusic() {
  music.src = data.music;
  music.volume = 0.0;

  const fadeIn = () => {
    const tick = setInterval(() => {
      if (music.volume < 0.35) {
        music.volume = Math.min(0.35, music.volume + 0.035);
      } else {
        clearInterval(tick);
      }
    }, 120);
  };

  const toggleMusic = async () => {
    try {
      if (music.paused) {
        await music.play();
        musicButton.classList.add('playing');
        fadeIn();
        showToast('Musik diputar');
      } else {
        music.pause();
        musicButton.classList.remove('playing');
        showToast('Musik dijeda');
      }
    } catch (err) {
      showToast('Browser memblokir audio');
    }
  };

  musicButton.addEventListener('click', toggleMusic);

  openBtn.addEventListener('click', async () => {
    cover.classList.add('closing');
    mainContent.classList.remove('hidden');
    document.body.classList.add('opened');
    document.documentElement.style.scrollBehavior = 'smooth';
    showToast('Selamat datang');
    try {
      await music.play();
      musicButton.classList.add('playing');
      fadeIn();
    } catch (err) {
      // music can still be triggered later by user
    }

    setTimeout(() => {
      const hero = document.getElementById('hero');
      hero.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 650);
  });
}

function initCopy() {
  if (!copyBtn) return;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(data.gift.account);
      showToast('Nomor rekening berhasil disalin');
    } catch {
      showToast('Gagal menyalin nomor rekening');
    }
  });
}

function initGallery() {
  galleryButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => openModal(index));
  });

  modalClose.addEventListener('click', closeModal);
  modalPrev.addEventListener('click', () => navigateGallery(-1));
  modalNext.addEventListener('click', () => navigateGallery(1));
  galleryModal.addEventListener('click', (e) => {
    if (e.target === galleryModal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!galleryModal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') navigateGallery(-1);
    if (e.key === 'ArrowRight') navigateGallery(1);
  });
}

function openModal(index) {
  currentGalleryIndex = index;
  modalImage.src = data.gallery[currentGalleryIndex];
  galleryModal.classList.add('open');
  galleryModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  galleryModal.classList.remove('open');
  galleryModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function navigateGallery(direction) {
  currentGalleryIndex = (currentGalleryIndex + direction + data.gallery.length) % data.gallery.length;
  modalImage.src = data.gallery[currentGalleryIndex];
}

function initWishes() {
  const saved = JSON.parse(localStorage.getItem('aldi-cindy-wishes') || '[]');
  const initial = [...data.wishes, ...saved].slice(0, 12);

  renderWishes(initial);

  if (rsvpForm) {
    rsvpForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(rsvpForm);
      const entry = {
        name: formData.get('name')?.trim() || 'Tamu',
        attendance: formData.get('attendance'),
        guestCount: formData.get('guestCount'),
        message: formData.get('message')?.trim() || 'Semoga bahagia selalu.'
      };

      const list = JSON.parse(localStorage.getItem('aldi-cindy-wishes') || '[]');
      list.unshift(entry);
      localStorage.setItem('aldi-cindy-wishes', JSON.stringify(list.slice(0, 30)));
      renderWishes([...data.wishes, ...list].slice(0, 12));

      rsvpForm.reset();
      showToast('Ucapan berhasil dikirim');
      rsvpForm.querySelector('input[name="name"]').focus();
    });
  }
}

function renderWishes(items) {
  if (!wishList) return;
  wishList.innerHTML = items.map(item => `
    <article class="wish-item">
      <strong>${escapeHTML(item.name || 'Tamu')}</strong>
      <small>${item.attendance ? escapeHTML(item.attendance) : 'Ucapan'}</small>
      <p>${escapeHTML(item.message || '')}</p>
    </article>
  `).join('');
}

function initNavigation() {
  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    const id = '#' + visible.target.id;
    navLinks.forEach(link => link.classList.toggle('active', link.dataset.target === id));
  }, { threshold: [0.3, 0.5, 0.65] });

  sections.forEach(section => {
    if (section.id) observer.observe(section);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.dataset.target);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function escapeHTML(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
