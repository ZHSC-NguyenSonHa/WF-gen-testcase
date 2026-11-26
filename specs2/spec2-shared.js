/* ══════════════════════════════════════════════════════
   spec2-shared.js — Standalone JS cho specs2
   Bao gồm: Mermaid init, search, scrollspy, lightbox, placeholder handler
   Load duy nhất 1 file này (thay thế spec-shared.js)
   ══════════════════════════════════════════════════════ */

// ── Mermaid init ──
if (typeof mermaid !== 'undefined') {
  mermaid.initialize({ startOnLoad: true, theme: 'default', flowchart: { useMaxWidth: true } });
}

// ── Live search: ẩn/hiện section theo từ khoá ──
const searchBox = document.getElementById('search-box');
if (searchBox) {
  searchBox.addEventListener('input', () => {
    const q = searchBox.value.toLowerCase().trim();
    document.querySelectorAll('section').forEach(sec => {
      sec.style.display = (!q || sec.textContent.toLowerCase().includes(q)) ? '' : 'none';
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === '/' && document.activeElement !== searchBox) {
      e.preventDefault();
      searchBox.focus();
      searchBox.select();
    }
  });
}

// ── Scrollspy: active sidebar link theo section đang xem ──
const sections = document.querySelectorAll('section[id]');
const sideLinks = document.querySelectorAll('#sidebar a');
if (sections.length && sideLinks.length) {
  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sideLinks.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`#sidebar a[href="#${entry.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.25 });
  sections.forEach(s => spy.observe(s));
}

// ── Placeholder: đánh dấu figure khi ảnh bị lỗi / chưa có ──
function initPlaceholders() {
  document.querySelectorAll('.step-shot img, .shot-gallery img').forEach(img => {
    const markMissing = () => {
      const fig = img.closest('figure') || img.parentElement;
      if (!fig) return;
      // MANUAL placeholder (vàng) vs AUTO placeholder (xám)
      const isManual = fig.dataset.capture === 'manual';
      fig.classList.add(isManual ? 'img-manual' : 'img-missing');
    };

    if (img.complete && img.naturalHeight === 0) markMissing();
    img.addEventListener('error', markMissing);
  });
}

// ── Lightbox ──
(function () {
  const overlay  = document.getElementById('lb-overlay');
  const lbImg    = document.getElementById('lb-img');
  const lbCaption = document.getElementById('lb-caption');
  const lbClose  = document.getElementById('lb-close');
  if (!overlay) return;

  function openLightbox(imgEl) {
    lbImg.src = imgEl.src;
    lbImg.alt = imgEl.alt || '';
    const fig = imgEl.closest('figure');
    const cap = fig ? fig.querySelector('figcaption') : null;
    lbCaption.textContent = cap ? cap.textContent : '';
    lbCaption.style.display = lbCaption.textContent ? '' : 'none';
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  // Bind click trên tất cả ảnh screenshot
  document.querySelectorAll('.step-shot img, .shot-gallery img').forEach(img => {
    img.addEventListener('click', () => {
      const fig = img.closest('figure');
      if (fig && fig.classList.contains('img-missing')) return; // skip placeholder
      openLightbox(img);
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeLightbox(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
})();

// Chạy placeholder sau khi DOM sẵn sàng
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPlaceholders);
} else {
  initPlaceholders();
}
