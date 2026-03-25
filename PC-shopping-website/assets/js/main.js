// ===== CART =====
function getCart() { return JSON.parse(sessionStorage.getItem('cart') || '[]'); }
function saveCart(cart) { sessionStorage.setItem('cart', JSON.stringify(cart)); updateCartCount(); }

function addToCart(id, name, price, image) {
  const cart = getCart();
  const existing = cart.find(i => i.id === id);
  if (existing) { existing.qty++; } else { cart.push({ id, name, price, image, qty: 1 }); }
  saveCart(cart);
  alert('Added to cart!');
}

function updateCartCount() {
  const count = getCart().reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById('cart-count');
  if (badge) badge.textContent = count;
}

document.addEventListener('DOMContentLoaded', updateCartCount);
