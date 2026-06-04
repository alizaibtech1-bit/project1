const API = 'https://ianda-backend.onrender.com/api';

function getToken() { return localStorage.getItem('glow_token'); }
function getUser() { return JSON.parse(localStorage.getItem('glow_user') || '{}'); }

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(`${API}${endpoint}`, { ...options, headers });
  if (res.status === 401) {
    localStorage.removeItem('glow_token');
    localStorage.removeItem('glow_user');
    window.location.href = 'index.html';
  }
  return res;
}

// Loading screen: hide immediately if bfcached page
if (performance.navigation?.type === 2) {
  document.getElementById('loadingScreen')?.classList.add('hidden');
}

// Mobile announcement bar ticker
function initMobileTicker() {
  const inner = document.querySelector('.announcement-inner');
  if (!inner) return;
  if (window.innerWidth <= 768) {
    if (inner.querySelector('.ticker-track')) return;
    const items = inner.querySelectorAll('span');
    if (items.length < 2) return;
    const track = document.createElement('div');
    track.className = 'ticker-track';
    const originalHTML = Array.from(items).map(s => s.outerHTML).join('');
    track.innerHTML = originalHTML + originalHTML;
    inner.innerHTML = '';
    inner.appendChild(track);
    inner.classList.add('is-ticker');
  } else {
    // Restore original layout on desktop
    if (!inner.querySelector('.ticker-track')) return;
    inner.classList.remove('is-ticker');
    inner.innerHTML = '<span><i class="fas fa-truck"></i> Free Shipping on Orders Over Rs. 5,000</span><span><i class="fas fa-shield-alt"></i> 100% Authentic Products</span><span><i class="fas fa-headset"></i> 24/7 Customer Support</span>';
  }
}
document.addEventListener('DOMContentLoaded', initMobileTicker);
window.addEventListener('resize', initMobileTicker);

// Navbar scroll handler
document.addEventListener('DOMContentLoaded', () => {
  const navbar = document.getElementById('navbar');
  if (navbar) {
    const annBar = document.querySelector('.announcement-bar');
    const annHeight = annBar ? annBar.offsetHeight : 0;
    if (window.scrollY > annHeight) navbar.classList.add('announcement-hidden');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 50);
      const h = annBar ? document.querySelector('.announcement-bar').offsetHeight : 0;
      navbar.classList.toggle('announcement-hidden', window.scrollY > h);
    });
  }
});

function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.hamburger');
  const open = links.classList.contains('show');
  if (!open) {
    links.classList.add('show');
    hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
    let overlay = document.getElementById('mobileOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'mobileOverlay';
      overlay.onclick = toggleMobileMenu;
      document.body.appendChild(overlay);
    }
    requestAnimationFrame(() => overlay.classList.add('show'));
  } else {
    const overlay = document.getElementById('mobileOverlay');
    if (overlay) overlay.classList.remove('show');
    links.classList.remove('show');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  }
}

function toggleWishlist(productId, btn) {
  const token = getToken();
  if (!token) { window.location.href = 'auth.html'; return; }
  fetch(`${API}/users/wishlist/${productId}`, {
    method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
  }).then(r => r.json()).then(() => {
    btn.classList.toggle('active');
    btn.querySelector('i').classList.toggle('fas');
    btn.querySelector('i').classList.toggle('far');
  });
}

// Dark mode toggle
function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  if (isDark) {
    html.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
  } else {
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
  }
  updateDarkToggleIcon();
}

function updateDarkToggleIcon() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.querySelectorAll('#darkToggle i').forEach(el => {
    el.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  });
}

// Restore theme on load
(function initTheme() {
  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  // Wait for DOM to be ready to update icons
  if (document.readyState === 'complete') {
    updateDarkToggleIcon();
  } else {
    document.addEventListener('DOMContentLoaded', updateDarkToggleIcon);
  }
})();

function renderStars(rating) {
  const num = parseFloat(rating) || 0;
  let s = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= num) s += '<i class="fas fa-star"></i>';
    else if (i - 0.5 <= num) s += '<i class="fas fa-star-half-alt"></i>';
    else s += '<i class="far fa-star"></i>';
  }
  return s;
}

function createProductCard(p) {
  const inWishlist = false;
  const rating = parseFloat(p.rating) || 0;
  let starsHtml = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) starsHtml += '<i class="fas fa-star"></i>';
    else if (i - 0.5 <= rating) starsHtml += '<i class="fas fa-star-half-alt"></i>';
    else starsHtml += '<i class="far fa-star"></i>';
  }
  return `
    <div class="product-card" onclick="window.location.href='product.html?id=${p._id}'">
      <div class="card-image">
        <img src="${API.replace('/api','')}${p.image || 'https://via.placeholder.com/300?text='+encodeURIComponent(p.name)}" alt="${p.name}" loading="lazy">
        ${p.originalPrice ? '<div class="card-badge">Sale</div>' : ''}
        <div class="card-actions">
          <button class="${inWishlist?'active':''}" onclick="event.stopPropagation();toggleWishlist('${p._id}',this)" title="Wishlist">
            <i class="${inWishlist?'fas':'far'} fa-heart"></i>
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-category">${p.category}</div>
        <h3>${p.name}</h3>
        <div class="rating">
          ${starsHtml}
          <span>(${p.numReviews || 0})</span>
        </div>
        <div class="price">
          Rs.${p.price.toFixed(2)}
          ${p.originalPrice ? `<span class="original">Rs.${p.originalPrice.toFixed(2)}</span>` : ''}
        </div>
      </div>
      <button class="add-to-cart" onclick="event.stopPropagation();window.location.href='checkout.html?id=${p._id}'">
        <span><i class="fas fa-phone"></i> Order Now</span>
      </button>
    </div>
  `;
}
