<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cart — MSI Store</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<?php require 'php/navbar.php'; ?>

<div class="section cart-summary">
  <h2 style="background:none;color:#fff;font-size:1.4rem;margin-bottom:20px;">🛒 Your Cart</h2>

  <!-- TODO: Loop $_SESSION['cart'] and display items -->
  <div class="cart-row">
    <div>
      <strong>MSI Pro 16</strong><br>
      <small style="color:#888">Unit Price: $499.00</small>
    </div>
    <div style="display:flex;gap:12px;align-items:center;">
      <input type="number" value="1" min="1" style="width:55px;padding:5px;background:#2a2a2a;border:1px solid #444;color:#eee;border-radius:4px;">
      <a href="cart.php?action=update&id=1" class="btn btn-outline" style="padding:5px 12px;">Update</a>
      <a href="cart.php?action=delete&id=1" class="btn" style="padding:5px 12px;background:#7b2a2a;">Remove</a>
    </div>
  </div>

  <div class="cart-total">
    <p>Subtotal: <strong>$499.00</strong></p>
    <div style="margin-top:12px;display:flex;gap:12px;justify-content:flex-end;">
      <a href="cart.php?action=clear" class="btn btn-outline">Clear Cart</a>
      <a href="checkout.php" class="btn">Proceed to Buy</a>
    </div>
  </div>
</div>

<footer>&copy; 2025 MSI Gaming Store</footer>
</body>
</html>
