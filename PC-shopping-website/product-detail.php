<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GameStore - Product Detail</title>
  <link rel="stylesheet" href="assets/css/style.css">
  <style>
    .detail-wrap { display:flex; gap:30px; padding:30px; }
    .detail-wrap img { width:300px; height:250px; object-fit:cover; background:#222; }
    .detail-info h2 { color:#fff; margin-bottom:10px; }
    .detail-info .price { color:#cc0000; font-size:1.5rem; margin:10px 0; }
    .quantity-wrap { display:flex; align-items:center; gap:10px; margin:15px 0; }
    .quantity-wrap input { width:60px; padding:5px; background:#222; border:1px solid #444; color:#fff; }
  </style>
</head>
<body>

<?php include 'includes/navbar.php'; ?>

<?php
  // TODO: get product ID and fetch from DB
  // $id = $_GET['id'] ?? 0;
  // include 'includes/config.php'; $db = getDB();
  // $result = $db->query("SELECT * FROM product WHERE id = $id");
?>

<div class="detail-wrap">
  <img src="" alt="Product Image">
  <div class="detail-info">
    <h2>Product Name</h2>
    <div class="price">$499.00</div>
    <p>Product description will display here.</p>
    <div class="quantity-wrap">
      <label>Qty:</label>
      <input type="number" value="1" min="1">
    </div>
    <button class="btn-primary" onclick="addToCart(1,'Product Name',499,'img.jpg')">Add to Cart</button>
    <a href="cart.php" class="btn-secondary" style="margin-left:10px;">View Cart</a>
  </div>
</div>

<footer><p>&copy; <?= date('Y') ?> GameStore. All rights reserved.</p></footer>
<script src="assets/js/main.js"></script>
</body>
</html>
