document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => document.getElementById('loadingScreen')?.classList.add('hidden'), 400);
  loadProduct();
});

async function loadProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const div = document.getElementById('productDetail');

  if (!id) { div.innerHTML = '<p style="text-align:center;color:var(--text-light);">No product selected</p>'; return; }

  try {
    const res = await fetch(`${API}/products/${id}`);
    if (!res.ok) throw new Error('Not found');
    const p = await res.json();

    // Load reviews
    const reviewsRes = await fetch(`${API}/products/${id}/reviews`);
    const reviews = reviewsRes.ok ? await reviewsRes.json() : [];

    const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : p.rating;

    div.innerHTML = `
      <div class="product-detail-layout">
        <div class="product-detail-image">
          <div class="img-wrap">
            <img src="${API.replace('/api','')}${p.image || 'https://via.placeholder.com/500?text='+encodeURIComponent(p.name)}" alt="${p.name}">
            <div class="zoom-hint"><i class="fas fa-expand"></i></div>
          </div>
        </div>
        <div class="product-detail-info">
          <div class="product-category">${p.category}</div>
          <h1>${p.name}</h1>
          <div class="product-variant-line"></div>
          <div class="product-rating">
            <div class="stars">${renderStars(avgRating)}</div>
            <span>${avgRating} (${reviews.length > 0 ? reviews.length : p.numReviews || 0} reviews)</span>
          </div>
          <div class="product-price">
            Rs.${p.price.toFixed(2)}
            ${p.originalPrice ? `<span class="original">Rs.${p.originalPrice.toFixed(2)}</span>` : ''}
          </div>
          <p class="product-desc">${p.description}</p>
          ${p.skinType ? `<p class="product-meta"><strong>Skin Type:</strong> ${p.skinType}</p>` : ''}
          ${p.ingredients ? `<p class="product-meta"><strong>Key Ingredients:</strong> ${p.ingredients}</p>` : ''}
          ${p.howToUse ? `
            <div class="product-meta">
              <strong>How to Use:</strong>
              <p>${p.howToUse}</p>
            </div>
          ` : ''}
          <p class="product-stock ${p.countInStock > 0 ? 'in-stock' : 'out-of-stock'}">
            <i class="fas fa-${p.countInStock > 0 ? 'check-circle' : 'times-circle'}"></i> ${p.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
          </p>
          <div class="product-actions">
            <a href="checkout.html?id=${p._id}" class="btn btn-primary" style="flex:1;justify-content:center;">
              <i class="fas fa-phone"></i> Order Now — Cash on Delivery
            </a>
            <button class="btn btn-outline" onclick="toggleWishlist('${p._id}',this)" style="width:56px;justify-content:center;">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="reviews-section">
        <div class="reviews-header">
          <h2>Customer Reviews</h2>
          <button class="btn btn-outline" onclick="document.getElementById('reviewForm').scrollIntoView({behavior:'smooth'});">Write a Review</button>
        </div>

        <div class="reviews-summary">
          <div class="reviews-avg">
            <span class="avg-rating">${avgRating}</span>
            <div class="stars">${renderStars(avgRating)}</div>
            <span>${reviews.length} review${reviews.length !== 1 ? 's' : ''}</span>
          </div>
          <div class="reviews-bars">
            ${[5,4,3,2,1].map(star => {
              const count = reviews.filter(r => Math.round(r.rating) === star).length;
              const pct = reviews.length > 0 ? (count / reviews.length * 100) : 0;
              return `<div class="bar-row"><span>${star}</span><div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div><span>${count}</span></div>`;
            }).join('')}
          </div>
        </div>

        <div class="reviews-list" id="reviewsList">
          ${reviews.length === 0 ? '<p class="no-reviews">No reviews yet. Be the first to review!</p>' : reviews.map(r => renderReview(r)).join('')}
        </div>

        <div class="review-form-wrap" id="reviewForm">
          <h3>Write a Review</h3>
          <form id="reviewFormEl" onsubmit="submitReview(event, '${id}')">
            <div class="form-row">
              <div class="form-group"><label>Your Name</label><input type="text" id="reviewName" required placeholder="e.g. Ayesha Khan"></div>
              <div class="form-group"><label>Rating</label><select id="reviewRating" required><option value="">Select</option>${[5,4,3,2,1].map(n => `<option value="${n}">${'★'.repeat(n)}${'☆'.repeat(5-n)}</option>`).join('')}</select></div>
            </div>
            <div class="form-group"><label>Review Title (optional)</label><input type="text" id="reviewTitle" placeholder="Summarize your experience"></div>
            <div class="form-group"><label>Your Review</label><textarea id="reviewComment" required placeholder="Tell others about your experience with this product..." rows="4"></textarea></div>
            <button type="submit" class="btn btn-gold">Submit Review</button>
          </form>
          <div id="reviewSuccess" style="display:none;text-align:center;padding:32px;background:var(--beige);">
            <i class="fas fa-check-circle" style="font-size:2.5rem;color:#16a34a;margin-bottom:12px;"></i>
            <h3>Thank you!</h3>
            <p style="color:var(--text-light);margin-top:8px;">Your review has been submitted and will appear after verification.</p>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    div.innerHTML = '<p style="text-align:center;color:var(--text-light);">Product not found</p>';
  }
}

function renderReview(r) {
  const date = new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  return `
    <div class="review-card">
      <div class="review-header">
        <div class="review-avatar">${r.name.charAt(0)}</div>
        <div>
          <strong>${r.name}</strong>
          ${r.isVerified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> Verified Purchase</span>' : ''}
          <div class="review-date">${date}</div>
        </div>
        <div class="stars">${renderStars(r.rating)}</div>
      </div>
      ${r.title ? `<h4 class="review-title">${r.title}</h4>` : ''}
      <p class="review-comment">${r.comment}</p>
    </div>
  `;
}

async function submitReview(e, productId) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Submitting...';

  try {
    const res = await fetch(`${API}/products/${productId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('reviewName').value,
        rating: parseInt(document.getElementById('reviewRating').value),
        title: document.getElementById('reviewTitle').value,
        comment: document.getElementById('reviewComment').value
      })
    });
    if (res.ok) {
      document.getElementById('reviewFormEl').style.display = 'none';
      document.getElementById('reviewSuccess').style.display = 'block';
    } else {
      const data = await res.json();
      alert(data.message || 'Submission failed');
    }
  } catch (err) {
    alert('Cannot connect to server');
  }
  btn.disabled = false;
  btn.textContent = 'Submit Review';
}
