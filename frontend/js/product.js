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
    div.innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:start;">
        <div>
          <img src="${API.replace('/api','')}${p.image || 'https://via.placeholder.com/500?text='+encodeURIComponent(p.name)}" alt="${p.name}" style="width:100%;aspect-ratio:1;object-fit:cover;background:var(--beige);">
        </div>
        <div>
          <div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:2px;color:var(--gold);margin-bottom:12px;">${p.category}</div>
          <h1 style="font-size:2.5rem;font-weight:300;margin-bottom:16px;">${p.name}</h1>
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
            <div style="color:var(--gold);">${'<i class="fas fa-star"></i>'.repeat(Math.floor(p.rating || 0))}${p.rating % 1 >= 0.5 ? '<i class="fas fa-star-half-alt"></i>' : ''}</div>
            <span style="font-size:0.85rem;color:var(--text-light);">${p.rating || 0} (${p.numReviews || 0} reviews)</span>
          </div>
          <div style="font-family:var(--font-serif);font-size:2rem;color:var(--charcoal);margin-bottom:24px;">
            Rs.${p.price.toFixed(2)}
            ${p.originalPrice ? `<span style="font-size:1.2rem;color:var(--text-light);text-decoration:line-through;margin-left:12px;">Rs.${p.originalPrice.toFixed(2)}</span>` : ''}
          </div>
          <p style="line-height:1.8;color:var(--charcoal-light);margin-bottom:24px;">${p.description}</p>
          ${p.skinType ? `<p style="font-size:0.85rem;margin-bottom:8px;"><strong>Skin Type:</strong> ${p.skinType}</p>` : ''}
          ${p.ingredients ? `<p style="font-size:0.85rem;margin-bottom:24px;"><strong>Key Ingredients:</strong> ${p.ingredients}</p>` : ''}
          ${p.howToUse ? `
            <div style="margin-bottom:24px;">
              <strong style="font-size:0.85rem;">How to Use:</strong>
              <p style="font-size:0.85rem;color:var(--charcoal-light);margin-top:4px;">${p.howToUse}</p>
            </div>
          ` : ''}
          <p style="font-size:0.8rem;color:${p.countInStock > 0 ? '#16a34a' : '#dc2626'};margin-bottom:24px;">
            <i class="fas fa-${p.countInStock > 0 ? 'check-circle' : 'times-circle'}"></i> ${p.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
          </p>
          <div style="display:flex;gap:12px;">
            <a href="checkout.html?id=${p._id}" class="btn btn-primary" style="flex:1;justify-content:center;">
              <i class="fas fa-phone"></i> Order Now — Cash on Delivery
            </a>
            <button class="btn btn-outline" onclick="toggleWishlist('${p._id}',this)" style="width:56px;justify-content:center;">
              <i class="far fa-heart"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    div.innerHTML = '<p style="text-align:center;color:var(--text-light);">Product not found</p>';
  }
}
