// footer year, so I don't have to remember to bump it
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// gentle fade-up when the game/video cards scroll into view (skips if the
// visitor has reduced motion on, which is only polite)
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

// screenshot click-to-zoom
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

// pulls my latest videos in from videos.json (the action keeps that fresh)
// and builds both the video grid and the "Recent" pills up top from it
const NAV_PILL_COUNT = 3;   // how many show up in the top strip
const GRID_VIDEO_COUNT = 6; // how many show up in the full grid

function renderVideoGrid(videos) {
  const grid = document.getElementById('videoGrid');
  const emptyMsg = document.getElementById('videoGridEmpty');
  if (!grid) return;

  if (!videos.length) {
    // just leave the "nothing synced yet" message showing
    return;
  }
  if (emptyMsg) emptyMsg.remove();

  videos.slice(0, GRID_VIDEO_COUNT).forEach(video => {
    const card = document.createElement('a');
    card.className = 'video-card';
    card.id = `video-${video.id}`;
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

    if (video.description) {
      const descEl = document.createElement('div');
      descEl.className = 'video-card__desc';
      descEl.textContent = video.description;
      card.appendChild(descEl);
    }

    grid.appendChild(card);
  });
}

function renderRecentPills(videos) {
  const container = document.getElementById('recentItems');
  if (!container) return;

  videos.slice(0, NAV_PILL_COUNT).forEach(video => {
    const pill = document.createElement('a');
    pill.className = 'recent-pill';
    // jump down to the card instead of bouncing off to youtube
    pill.href = `#video-${video.id}`;
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
    // not a big deal if this hasn't synced yet, the empty-state message
    // in the grid already covers it
    console.warn('could not load videos.json:', err);
  });
