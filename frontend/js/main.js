document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => document.getElementById('loadingScreen')?.classList.add('hidden'), 600);

  const user = getUser();
  if (getToken()) {
    document.getElementById('authBtn').innerHTML = `<a href="#" id="logoutBtn" title="Logout"><i class="fas fa-sign-out-alt"></i></a>`;
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('glow_token');
      localStorage.removeItem('glow_user');
      window.location.reload();
    });
  }

  // Scroll progress bar
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    const scrollProgress = document.getElementById('scrollProgress');
    if (scrollProgress) {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      scrollProgress.style.width = (winScroll / height) * 100 + '%';
    }
  });

  // Reveal animation
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  createHeroParticles();
  loadFeatured();
  loadCategories();
  loadAllProducts();
  loadTestimonials();
  filterProducts();
});

let featuredIndex = 0;

async function loadFeatured() {
  try {
    const res = await fetch(`${API}/products?featured=true`);
    const products = await res.json();
    const slider = document.getElementById('featuredSlider');
    if (products.length === 0) {
      // load some as featured
      const all = await (await fetch(`${API}/products`)).json();
      slider.innerHTML = all.slice(0, 4).map(p => createProductCard(p)).join('');
    } else {
      slider.innerHTML = products.map(p => createProductCard(p)).join('');
    }
  } catch (err) {
    showDemoProducts('featuredSlider');
  }
}

function slideFeatured(dir) {
  const slider = document.getElementById('featuredSlider');
  const cards = slider.querySelectorAll('.product-card');
  if (cards.length === 0) return;
  const cardWidth = cards[0].offsetWidth + 24;
  const max = Math.max(0, cards.length * (cardWidth) - slider.parentElement.offsetWidth);
  featuredIndex += dir * cardWidth;
  if (featuredIndex < 0) featuredIndex = 0;
  if (featuredIndex > max) featuredIndex = max;
  slider.style.transform = `translateX(-${featuredIndex}px)`;
}

let allProducts = [];

async function loadCategories() {
  const cats = [
    { name: 'Facewash', icon: 'fas fa-hand-sparkles', desc: 'Gentle daily cleansers' },
    { name: 'Sunblock', icon: 'fas fa-sun', desc: 'Broad spectrum protection' },
    { name: 'Serums', icon: 'fas fa-droplet', desc: 'Targeted treatments' },
    { name: 'Creams', icon: 'fas fa-jar', desc: 'Deep hydration' }
  ];
  const grid = document.getElementById('categoriesGrid');
  grid.innerHTML = cats.map(c => `
    <div class="category-card" onclick="filterByCategory('${c.name}')">
      <div class="cat-bg"><i class="${c.icon}" style="color:var(--gold);opacity:0.5;"></i></div>
      <div class="cat-label">
        <h3>${c.name}</h3>
        <p>${c.desc}</p>
      </div>
    </div>
  `).join('');
}

function filterByCategory(cat) {
  window.location.href = `search.html?category=${cat}`;
}

async function loadAllProducts() {
  try {
    const res = await fetch(`${API}/products`);
    allProducts = await res.json();
    document.getElementById('productsGrid').innerHTML = allProducts.map(p => createProductCard(p)).join('');
  } catch (err) {
    showDemoProducts('productsGrid');
  }
}

function filterProducts() {
  // Simple client-side filter used on homepage
}

function loadTestimonials() {
  const testimonials = [
    { name: 'Sophie Laurent', title: 'Skincare Enthusiast', text: 'The serum transformed my skin in just two weeks. I have never felt more confident without makeup. Truly luxury results.', initial: 'SL' },
    { name: 'Emma Chen', title: 'Beauty Editor', text: 'i&A has redefined my morning routine. The texture, the scent, the results — every detail speaks of quality and care.', initial: 'EC' },
    { name: 'Olivia Martinez', title: 'Dermatologist', text: 'As a professional, I rarely endorse brands. But i&A\'s formulations are science-backed, clean, and genuinely effective.', initial: 'OM' }
  ];
  const grid = document.getElementById('testimonialsGrid');
  grid.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="stars">${'<i class="fas fa-star"></i>'.repeat(5)}</div>
      <blockquote>"${t.text}"</blockquote>
      <div class="author">
        <div class="avatar">${t.initial}</div>
        <div class="info"><h4>${t.name}</h4><p>${t.title}</p></div>
      </div>
    </div>
  `).join('');
}

function createHeroParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'hero-particle animate-float' + (i % 2 === 0 ? '-delayed' : '');
    p.style.left = Math.random() * 100 + '%';
    p.style.top = Math.random() * 100 + '%';
    p.style.width = p.style.height = (2 + Math.random() * 4) + 'px';
    p.style.opacity = 0.15 + Math.random() * 0.25;
    p.style.animationDelay = (Math.random() * 4) + 's';
    p.style.animationDuration = (3 + Math.random() * 4) + 's';
    hero.appendChild(p);
  }
}

function showDemoProducts(targetId) {
  const demos = [
    { _id: 'demo1', name: 'Hydrating Facewash', price: 28.00, originalPrice: 35.00, category: 'Facewash', rating: 4.5, numReviews: 124, image: '' },
    { _id: 'demo2', name: 'Silk Sunblock SPF 50', price: 42.00, category: 'Sunblock', rating: 4.8, numReviews: 89, image: '' },
    { _id: 'demo3', name: 'Vitamin C Bright Serum', price: 68.00, originalPrice: 85.00, category: 'Serums', rating: 4.9, numReviews: 256, image: '' },
    { _id: 'demo4', name: 'Night Renewal Cream', price: 72.00, category: 'Creams', rating: 4.7, numReviews: 198, image: '' },
    { _id: 'demo5', name: 'Gentle Foaming Cleanser', price: 32.00, category: 'Facewash', rating: 4.3, numReviews: 67, image: '' },
    { _id: 'demo6', name: 'Matte Sunblock SPF 30', price: 38.00, category: 'Sunblock', rating: 4.6, numReviews: 112, image: '' },
    { _id: 'demo7', name: 'Hyaluronic Acid Serum', price: 58.00, category: 'Serums', rating: 4.8, numReviews: 341, image: '' },
    { _id: 'demo8', name: 'Rich Moisture Cream', price: 66.00, originalPrice: 78.00, category: 'Creams', rating: 4.4, numReviews: 156, image: '' }
  ];
  const grid = document.getElementById(targetId);
  if (grid) grid.innerHTML = demos.map(p => createProductCard(p)).join('');
}
