<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>MSI Gaming Store</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<?php require 'php/navbar.php'; ?>

<!-- Hero Banner -->
<div class="hero">
  <h1>Score a Bonus Gaming Monitor</h1>
  <p>When you buy any selected MSI Gaming Desktop</p>
  <a href="products.php" class="btn">Shop Now</a>
</div>

<!-- New Products Section -->
<div class="section">
  <h2>New Products</h2>
  <div class="product-grid">
    <!-- TODO: Loop from DB — SELECT * FROM product ORDER BY created_at DESC LIMIT 6 -->
    <div class="product-card">
      <img src="" alt="Product Image">
      <h4>MSI Pro 16</h4>
      <div class="price">$499.00</div>
      <a href="product_detail.php?id=1" class="btn">View</a>
    </div>
  </div>
</div>

<!-- Category Sections -->
<?php
$categories = ['Custom Builds', 'Gaming Monitors', 'Graphic Cards', 'Accessories'];
foreach ($categories as $cat): ?>
<div class="section">
  <h2><?= $cat ?></h2>
  <div class="product-grid">
    <!-- TODO: SELECT * FROM product WHERE category = '<?= $cat ?>' LIMIT 6 -->
    <div class="product-card">
      <img src="" alt="<?= $cat ?>">
      <h4>Sample <?= $cat ?> Item</h4>
      <div class="price">$499.00</div>
      <a href="product_detail.php?id=1" class="btn">View</a>
    </div>
  </div>
</div>
<?php endforeach; ?>

<footer>&copy; 2025 MSI Gaming Store. All rights reserved.</footer>
</body>
</html>
