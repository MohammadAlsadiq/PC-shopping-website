<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Product Detail — MSI Store</title>
  <link rel="stylesheet" href="css/style.css">
  <style>
    .detail-wrap { max-width:800px; margin:40px auto; display:flex; gap:30px; }
    .detail-wrap img { width:300px; height:280px; object-fit:cover; background:#333; border-radius:6px; }
    .detail-info h2 { margin-bottom:10px; }
    .detail-info .price { font-size:1.5rem; color:#c0392b; margin:12px 0; }
    .detail-info p { color:#aaa; font-size:.9rem; margin-bottom:16px; }
    .qty-wrap { display:flex; gap:10px; align-items:center; margin-bottom:16px; }
    .qty-wrap input { width:60px; padding:6px; background:#2a2a2a; border:1px solid #444; color:#eee; border-radius:4px; }
  </style>
</head>
<body>

<?php require 'php/navbar.php'; ?>

<div class="detail-wrap">
  <!-- TODO: $id = $_GET['id']; SELECT * FROM product WHERE id = $id -->
  <img src="" alt="Product Image">
  <div class="detail-info">
    <h2>MSI Pro 16 — EX DISPLAY</h2>
    <div class="price">$499.00</div>
    <p>Category: Custom Builds</p>
    <p>Stock: 12 units available</p>
    <p>Full product description goes here. Provide specs, features, and any important notes about this item.</p>
    <div class="qty-wrap">
      <label>Qty:</label>
      <input type="number" value="1" min="1" max="99">
    </div>
    <a href="cart.php?action=add&id=1" class="btn">Add to Cart</a>
    <a href="cart.php" class="btn btn-outline" style="margin-left:10px">View Cart</a>
  </div>
</div>

<footer>&copy; 2025 MSI Gaming Store</footer>
</body>
</html>
