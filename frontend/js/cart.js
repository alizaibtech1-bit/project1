document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => document.getElementById('loadingScreen')?.classList.add('hidden'), 400);
  renderCart();
});

function renderCart() {
  const cart = getCart();
  const content = document.getElementById('cartContent');

  if (cart.length === 0) {
    content.innerHTML = `
      <div class="cart-empty">
        <i class="fas fa-shopping-bag"></i>
        <h2>Your bag is empty</h2>
        <p style="color:var(--text-light);margin-bottom:24px;">Discover our luxury collection</p>
        <a href="index.html" class="btn btn-outline">Shop Now</a>
      </div>
    `;
    return;
  }

  let subtotal = 0;
  let itemsHtml = '';
  cart.forEach((item, idx) => {
    subtotal += item.price * item.qty;
    itemsHtml += `
      <div class="cart-item">
        <img src="${imageUrl(item.image) || 'https://via.placeholder.com/100?text='+encodeURIComponent(item.name)}" alt="${item.name}">
        <div class="cart-item-info">
          <h3>${item.name}</h3>
          <div class="price">Rs.${item.price.toFixed(2)}</div>
          <div class="cart-item-qty">
            <button onclick="updateCartQty(${idx}, -1)">−</button>
            <span>${item.qty}</span>
            <button onclick="updateCartQty(${idx}, 1)">+</button>
            <button class="cart-item-remove" onclick="removeCartItem(${idx})"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
        <div style="font-family:var(--font-serif);font-size:1.2rem;min-width:80px;text-align:right;">
          Rs.${(item.price * item.qty).toFixed(2)}
        </div>
      </div>
    `;
  });

  const shipping = subtotal > 5000 ? 0 : 199;
  const total = subtotal + shipping;

  content.innerHTML = `
    <div class="cart-layout">
      <div class="cart-items">${itemsHtml}</div>
      <div class="cart-summary">
        <h3>Order Summary</h3>
        <div class="row"><span>Subtotal</span><span>Rs.${subtotal.toFixed(2)}</span></div>
        <div class="row"><span>Shipping</span><span>${shipping === 0 ? '<span style="color:#16a34a;">FREE</span>' : 'Rs.'+shipping.toFixed(2)}</span></div>
        <div class="row total"><span>Total</span><span>Rs.${total.toFixed(2)}</span></div>
        ${subtotal < 5000 ? `<p style="font-size:0.75rem;color:var(--text-light);margin-top:8px;">Add Rs.${(5000 - subtotal).toFixed(2)} more for free shipping</p>` : ''}
        <a href="checkout.html" class="btn btn-gold"><i class="fas fa-lock"></i> Checkout</a>
        <a href="index.html" style="display:block;text-align:center;margin-top:12px;font-size:0.8rem;color:var(--text-light);">Continue Shopping</a>
      </div>
    </div>
  `;
  updateCartCount();
}

function updateCartQty(idx, delta) {
  let cart = getCart();
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart(cart);
  renderCart();
}

function removeCartItem(idx) {
  let cart = getCart();
  cart.splice(idx, 1);
  saveCart(cart);
  renderCart();
}
