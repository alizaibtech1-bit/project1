document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => document.getElementById('loadingScreen')?.classList.add('hidden'), 400);
  const user = getUser();
  if (!getToken() || user.role !== 'admin') {
    document.getElementById('adminApp').style.display = 'none';
    document.getElementById('adminLogin').style.display = 'flex';
    return;
  }
  document.getElementById('adminApp').style.display = 'flex';
  document.getElementById('adminLogin').style.display = 'none';
  document.getElementById('adminName').textContent = user.name || 'Admin';

  // Verify token is still valid (database may have been re-seeded)
  fetch(`${API}/auth/profile`, { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(r => {
    if (!r.ok) throw new Error('Invalid token');
  }).catch(() => {
    localStorage.removeItem('glow_token');
    localStorage.removeItem('glow_user');
    window.location.reload();
  });

  // Ping backend to wake it up
  fetch(API.replace('/api','')).then(r => {
    document.getElementById('backendStatus').innerHTML = '<i class="fas fa-circle" style="color:#16a34a;font-size:0.5rem;"></i> Backend Online';
  }).catch(() => {
    document.getElementById('backendStatus').innerHTML = '<i class="fas fa-circle" style="color:#dc2626;font-size:0.5rem;"></i> Backend Offline — Wake it up at <a href="https://ianda-backend.onrender.com" target="_blank" style="color:var(--gold);text-decoration:underline;">ianda-backend.onrender.com</a>';
  });

  // Check ImgBB status
  fetch(`${API}/products/imgbb-status`, { headers: { 'Authorization': `Bearer ${getToken()}` } }).then(r => r.json()).then(d => {
    if (!d.configured) {
      const statusEl = document.getElementById('backendStatus');
      statusEl.innerHTML += '<br><span style="font-size:0.65rem;color:var(--gold);"><i class="fas fa-exclamation-triangle"></i> Image uploads need ImgBB setup — <a href="#imgbb-setup" style="color:var(--gold);text-decoration:underline;">configure</a></span>';
    }
  }).catch(() => {});

  loadDashboard();
});

document.getElementById('adminLoginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('adminLoginEmail').value;
  const password = document.getElementById('adminLoginPassword').value;
  const alertBox = document.getElementById('adminLoginAlert');
  try {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.role === 'admin') {
      localStorage.setItem('glow_token', data.token);
      localStorage.setItem('glow_user', JSON.stringify(data));
      window.location.reload();
    } else {
      alertBox.innerHTML = '<div class="alert alert-error">Invalid credentials or not an admin</div>';
    }
  } catch (err) {
    alertBox.innerHTML = '<div class="alert alert-error">Cannot connect to server</div>';
  }
});

function showSection(section, btn) {
  document.querySelectorAll('.admin-nav a').forEach(a => a.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.querySelectorAll('[id^="section-"]').forEach(s => s.style.display = 'none');
  document.getElementById(`section-${section}`).style.display = 'block';

  const titles = { dashboard: 'Dashboard', products: 'Products', orders: 'Orders', users: 'Users' };
  document.getElementById('pageTitle').textContent = titles[section] || 'Dashboard';

  if (section === 'dashboard') loadDashboard();
  if (section === 'products') loadAdminProducts();
  if (section === 'orders') loadAdminOrders();
  if (section === 'users') loadAdminUsers();
}

async function loadDashboard() {
  try {
    const res = await fetch(`${API}/orders/stats`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    const stats = await res.json();
    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><div class="stat-icon"><i class="fas fa-rupee-sign"></i></div><div class="stat-value">Rs.${stats.totalRevenue?.toFixed(2) || '0.00'}</div><div class="stat-label">Total Revenue</div></div>
      <div class="stat-card"><div class="stat-icon"><i class="fas fa-shopping-cart"></i></div><div class="stat-value">${stats.totalOrders || 0}</div><div class="stat-label">Total Orders</div></div>
      <div class="stat-card"><div class="stat-icon"><i class="fas fa-box"></i></div><div class="stat-value">${stats.totalProducts || 0}</div><div class="stat-label">Products</div></div>
      <div class="stat-card"><div class="stat-icon"><i class="fas fa-users"></i></div><div class="stat-value">${stats.totalUsers || 0}</div><div class="stat-label">Users</div></div>
    `;

    if (stats.recentOrders?.length > 0) {
      document.getElementById('recentOrders').innerHTML = `
        <table class="admin-table">
          <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
          <tbody>${stats.recentOrders.map(o => `
            <tr>
              <td>#${o._id.slice(-6)}</td>
              <td>${o.shippingAddress?.fullName || o.user?.name || 'N/A'}<br><small style="color:var(--text-light);">${o.shippingAddress?.phone || ''}</small></td>
              <td>Rs.${o.totalPrice?.toFixed(2)}</td>
              <td><span class="status-badge status-${o.status}">${o.status}</span></td>
              <td>${new Date(o.createdAt).toLocaleDateString()}</td>
              <td><button class="btn-view" onclick="viewOrderDetails('${o._id}')">View</button></td>
            </tr>
          `).join('')}</tbody>
        </table>
      `;
    } else {
      document.getElementById('recentOrders').innerHTML = '<p style="color:var(--text-light);">No orders yet</p>';
    }
  } catch (err) {
    document.getElementById('statsGrid').innerHTML = '<p style="color:var(--text-light);">Could not load stats. Ensure backend is running and database is seeded.</p>';
    document.getElementById('recentOrders').innerHTML = '';
  }
}

async function loadAdminProducts() {
  try {
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    document.getElementById('productsTableWrap').innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th>Actions</th></tr></thead>
        <tbody>${products.map(p => `
          <tr>
            <td><img src="${imageUrl(p.image) || 'https://via.placeholder.com/48?text='+encodeURIComponent(p.name)}" alt=""></td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>Rs.${p.price.toFixed(2)}</td>
            <td>${p.countInStock}</td>
            <td>${p.isFeatured ? '<i class="fas fa-star" style="color:var(--gold);"></i>' : '—'}</td>
            <td class="actions">
              <button class="btn-edit" onclick="editProduct('${p._id}')">Edit</button>
              <button class="btn-delete" onclick="deleteProduct('${p._id}')">Delete</button>
            </td>
          </tr>
        `).join('')}</tbody>
      </table>
    `;
  } catch (err) {
    document.getElementById('productsTableWrap').innerHTML = '<p style="color:var(--text-light);">Error loading products</p>';
  }
}

async function editProduct(id) {
  try {
    const res = await fetch(`${API}/products/${id}`);
    const p = await res.json();
    document.getElementById('editProductId').value = p._id;
    document.getElementById('prodName').value = p.name;
    document.getElementById('prodDesc').value = p.description;
    document.getElementById('prodPrice').value = p.price;
    document.getElementById('prodOrigPrice').value = p.originalPrice || '';
    document.getElementById('prodCategory').value = p.category;
    document.getElementById('prodStock').value = p.countInStock;
    document.getElementById('prodRating').value = p.rating;
    document.getElementById('prodReviews').value = p.numReviews;
    document.getElementById('prodSkinType').value = p.skinType || '';
    document.getElementById('prodIngredients').value = p.ingredients || '';
    document.getElementById('prodHowToUse').value = p.howToUse || '';
    document.getElementById('prodFeatured').checked = p.isFeatured;
    document.getElementById('modalProductTitle').textContent = 'Edit Product';
    document.getElementById('productModal').classList.add('open');
  } catch (err) {
    alert('Error loading product');
  }
}

function openProductModal() {
  document.getElementById('productForm').reset();
  document.getElementById('editProductId').value = '';
  document.getElementById('modalProductTitle').textContent = 'Add Product';
  document.getElementById('productModal').classList.add('open');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

document.getElementById('productForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('editProductId').value;
  const isEdit = !!id;

  const formData = new FormData();
  formData.append('name', document.getElementById('prodName').value);
  formData.append('description', document.getElementById('prodDesc').value);
  formData.append('price', document.getElementById('prodPrice').value);
  formData.append('originalPrice', document.getElementById('prodOrigPrice').value || '');
  formData.append('category', document.getElementById('prodCategory').value);
  formData.append('countInStock', document.getElementById('prodStock').value);
  formData.append('rating', document.getElementById('prodRating').value);
  formData.append('numReviews', document.getElementById('prodReviews').value);
  formData.append('skinType', document.getElementById('prodSkinType').value);
  formData.append('ingredients', document.getElementById('prodIngredients').value);
  formData.append('howToUse', document.getElementById('prodHowToUse').value);
  formData.append('isFeatured', document.getElementById('prodFeatured').checked);

  const fileInput = document.getElementById('prodImage');
  if (fileInput.files[0]) formData.append('image', fileInput.files[0]);

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Saving...';

  const trySave = async (retries = 2) => {
    try {
      const url = isEdit ? `${API}/products/${id}` : `${API}/products`;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });

      if (res.ok) {
        closeProductModal();
        loadAdminProducts();
        alert(isEdit ? 'Product updated!' : 'Product created!');
        return;
      }
      const data = await res.json().catch(() => ({}));
      alert((data && data.message) || 'Error saving product (HTTP ' + res.status + '). Check backend logs.');
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => trySave(retries - 1), 3000);
      } else {
        alert('Backend not reachable after multiple attempts. Please visit https://ianda-backend.onrender.com to wake it up, then try again.');
      }
    }
  };
  trySave();
  submitBtn.disabled = false;
  submitBtn.textContent = isEdit ? 'Update Product' : 'Add Product';
});

async function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  try {
    await fetch(`${API}/products/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    loadAdminProducts();
  } catch (err) {
    alert('Error deleting product');
  }
}

async function loadAdminOrders() {
  try {
    const res = await fetch(`${API}/orders/all`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    const orders = await res.json();
    document.getElementById('ordersTableWrap').innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th><th></th></tr></thead>
        <tbody>${orders.map(o => `
          <tr>
            <td>#${o._id.slice(-6)}</td>
            <td>${o.shippingAddress?.fullName || o.user?.name || 'N/A'}<br><small style="color:var(--text-light);">${o.shippingAddress?.phone || o.user?.email || ''}</small></td>
            <td>${o.items?.reduce((s,i) => s + i.quantity, 0) || 0}</td>
            <td>Rs.${o.totalPrice?.toFixed(2)}</td>
            <td><span class="status-badge status-${o.status}">${o.status}</span></td>
            <td>${new Date(o.createdAt).toLocaleDateString()}</td>
            <td class="actions">
              <select onchange="updateOrderStatus('${o._id}', this.value)" style="padding:4px 8px;font-size:0.75rem;border:1px solid var(--beige-dark);">
                <option value="pending" ${o.status==='pending'?'selected':''}>Pending</option>
                <option value="processing" ${o.status==='processing'?'selected':''}>Processing</option>
                <option value="shipped" ${o.status==='shipped'?'selected':''}>Shipped</option>
                <option value="delivered" ${o.status==='delivered'?'selected':''}>Delivered</option>
                <option value="cancelled" ${o.status==='cancelled'?'selected':''}>Cancelled</option>
              </select>
            </td>
            <td><button class="btn-view" onclick="viewOrderDetails('${o._id}')">View</button></td>
          </tr>
        `).join('')}</tbody>
      </table>
    `;
  } catch (err) {
    document.getElementById('ordersTableWrap').innerHTML = '<p style="color:var(--text-light);">Error loading orders</p>';
  }
}

async function updateOrderStatus(id, status) {
  try {
    await fetch(`${API}/orders/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ status })
    });
    loadAdminOrders();
  } catch (err) {
    alert('Error updating order');
  }
}

async function loadAdminUsers() {
  try {
    const res = await fetch(`${API}/users`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    const users = await res.json();
    document.getElementById('usersTableWrap').innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>${users.map(u => `
          <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td><span class="status-badge ${u.role === 'admin' ? 'status-processing' : 'status-pending'}">${u.role}</span></td>
            <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            <td class="actions">
              <button class="btn-delete" onclick="deleteUser('${u._id}')">Delete</button>
            </td>
          </tr>
        `).join('')}</tbody>
      </table>
    `;
  } catch (err) {
    document.getElementById('usersTableWrap').innerHTML = '<p style="color:var(--text-light);">Error loading users</p>';
  }
}

async function deleteUser(id) {
  if (!confirm('Delete this user?')) return;
  try {
    await fetch(`${API}/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    loadAdminUsers();
  } catch (err) {
    alert('Error deleting user');
  }
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('open');
}

async function viewOrderDetails(id) {
  try {
    const res = await fetch(`${API}/orders/all`, { headers: { 'Authorization': `Bearer ${getToken()}` } });
    const orders = await res.json();
    const o = orders.find(x => x._id === id);
    if (!o) { alert('Order not found'); return; }
    const addr = o.shippingAddress || {};
    document.getElementById('orderModalBody').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
        <div>
          <h4 style="font-size:0.9rem;margin-bottom:12px;color:var(--gold);">Customer</h4>
          <p><strong>Name:</strong> ${addr.fullName || 'N/A'}</p>
          <p><strong>Phone:</strong> ${addr.phone || 'N/A'}</p>
        </div>
        <div>
          <h4 style="font-size:0.9rem;margin-bottom:12px;color:var(--gold);">Shipping Address</h4>
          <p>${addr.street || ''}</p>
          <p>${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}</p>
          <p>${addr.country || ''}</p>
        </div>
      </div>
      ${o.orderNotes ? `<div style="margin-top:16px;"><h4 style="font-size:0.9rem;margin-bottom:8px;color:var(--gold);">Order Notes</h4><p>${o.orderNotes}</p></div>` : ''}
      <div style="margin-top:20px;">
        <h4 style="font-size:0.9rem;margin-bottom:12px;color:var(--gold);">Items</h4>
        <table class="admin-table">
          <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
          <tbody>${(o.items || []).map(i => `
            <tr><td>${i.name}</td><td>${i.quantity}</td><td>Rs.${(i.price * i.quantity).toFixed(2)}</td></tr>
          `).join('')}</tbody>
        </table>
      </div>
      <div style="margin-top:16px;text-align:right;font-family:var(--font-serif);font-size:1.3rem;">
        Total: Rs.${o.totalPrice?.toFixed(2)} &nbsp;|&nbsp; Status: <span class="status-badge status-${o.status}">${o.status}</span>
      </div>
    `;
    document.getElementById('orderModal').classList.add('open');
  } catch (err) {
    alert('Error loading order details');
  }
}

function logout() {
  localStorage.removeItem('glow_token');
  localStorage.removeItem('glow_user');
  window.location.href = 'auth.html';
}
