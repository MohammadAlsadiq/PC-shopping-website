<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Products — MSI Store</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<?php require 'php/navbar.php'; ?>

<div class="section">
  <h2>Our Products</h2>

  <!-- Search Bar -->
  <form method="GET" style="margin-bottom:20px;display:flex;gap:10px;">
    <input type="text" name="search" placeholder="Search products..." value="<?= htmlspecialchars($_GET['search'] ?? '') ?>" style="padding:8px 12px;background:#2a2a2a;border:1px solid #444;color:#eee;border-radius:4px;flex:1;">
    <button type="submit" class="btn">Search</button>
  </form>

  <div class="product-grid">
    <!-- TODO: Query DB
      $search = $_GET['search'] ?? '';
      SELECT * FROM product WHERE name LIKE "%$search%" OR category LIKE "%$search%"
    -->
    <div class="product-card">
      <img src="" alt="Product">
      <h4>MSI Pro 16</h4>
      <div class="price">$499.00</div>
      <a href="product_detail.php?id=1" class="btn">View</a>
    </div>
  </div>
</div>

<footer>&copy; 2025 MSI Gaming Store</footer>
</body>
</html>
