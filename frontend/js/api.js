const API = 'http://localhost:5000/api';

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

function toggleMobileMenu() {
  const links = document.querySelector('.nav-links');
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  if (window.innerWidth > 768) links.style.display = 'flex';
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

function createProductCard(p) {
  const inWishlist = false;
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
          ${'<i class="fas fa-star"></i>'.repeat(Math.floor(p.rating || 0))}
          ${p.rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ''}
          <span>(${p.numReviews || 0})</span>
        </div>
        <div class="price">
          Rs.${p.price.toFixed(2)}
          ${p.originalPrice ? `<span class="original">Rs.${p.originalPrice.toFixed(2)}</span>` : ''}
        </div>
      </div>
      <button class="add-to-cart" onclick="event.stopPropagation();window.location.href='checkout.html?id=${p._id}'">
        <i class="fas fa-phone"></i> Order Now
      </button>
    </div>
  `;
}
