// Footer year
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Gentle fade-up reveal for the product cards, respecting reduced-motion preference
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced && 'IntersectionObserver' in window) {
  const revealTargets = document.querySelectorAll('.game-card, .yt-card');

  revealTargets.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(16px)';
    el.style.transition = 'opacity .6s ease, transform .6s ease';
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealTargets.forEach(el => observer.observe(el));
}

// Screenshot zoom lightbox
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

function openLightbox(src, alt) {
  lightboxImg.src = src;
  lightboxImg.alt = alt || '';
  lightbox.hidden = false;
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxImg.src = '';
}

document.querySelectorAll('.shots__item').forEach(button => {
  button.addEventListener('click', () => {
    const img = button.querySelector('img');
    if (!img || button.classList.contains('shots__item--empty')) return;
    openLightbox(img.src, img.alt);
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
});

// Load recent videos from data/videos.json (kept up to date by the
// "Update YouTube videos" GitHub Action) and render both the video grid
// and the "Recent" quick-access nav pills.
const NAV_PILL_COUNT = 3;   // how many videos to show in the top nav strip
const GRID_VIDEO_COUNT = 6; // how many videos to show in the full grid

function renderVideoGrid(videos) {
  const grid = document.getElementById('videoGrid');
  const emptyMsg = document.getElementById('videoGridEmpty');
  if (!grid) return;

  if (!videos.length) {
    // leave the built-in "not synced yet" message in place
    return;
  }
  if (emptyMsg) emptyMsg.remove();

  videos.slice(0, GRID_VIDEO_COUNT).forEach(video => {
    const card = document.createElement('a');
    card.className = 'video-card';
    card.href = video.url;
    card.target = '_blank';
    card.rel = 'noopener';

    const thumbWrap = document.createElement('div');
    thumbWrap.className = 'video-card__thumb';
    const img = document.createElement('img');
    img.src = video.thumbnail;
    img.alt = video.title;
    img.loading = 'lazy';
    thumbWrap.appendChild(img);

    const titleEl = document.createElement('div');
    titleEl.className = 'video-card__title';
    titleEl.textContent = video.title;

    card.appendChild(thumbWrap);
    card.appendChild(titleEl);
    grid.appendChild(card);
  });
}

function renderRecentPills(videos) {
  const container = document.getElementById('recentItems');
  if (!container) return;

  videos.slice(0, NAV_PILL_COUNT).forEach(video => {
    const pill = document.createElement('a');
    pill.className = 'recent-pill';
    pill.href = video.url;
    pill.target = '_blank';
    pill.rel = 'noopener';
    pill.textContent = `Video: ${video.title}`;
    container.appendChild(pill);
  });
}

fetch('data/videos.json')
  .then(res => {
    if (!res.ok) throw new Error(`videos.json responded with ${res.status}`);
    return res.json();
  })
  .then(videos => {
    if (!Array.isArray(videos)) return;
    renderVideoGrid(videos);
    renderRecentPills(videos);
  })
  .catch(err => {
    // Fine if this hasn't been synced yet — the built-in empty-state
    // message in the video grid already covers that case.
    console.warn('Could not load data/videos.json:', err);
  });
