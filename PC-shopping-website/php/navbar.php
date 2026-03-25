<?php
// php/navbar.php — included by every page
session_start();
$cart_count = isset($_SESSION['cart']) ? count($_SESSION['cart']) : 0;
?>
<nav>
  <a class="logo" href="../index.php">🎮 MSI Store</a>
  <ul>
    <li><a href="../index.php">Home</a></li>
    <li><a href="../products.php">Our Products</a></li>
    <li><a href="../about.php">About Us</a></li>
    <li><a href="../orders.php">Orders</a></li>
    <li><a href="../contact.php">Contact Us</a></li>
  </ul>
  <div class="nav-icons">
    <a href="../cart.php">🛒 (<?= $cart_count ?>)</a>
    <?php if (isset($_SESSION['user'])): ?>
      <a href="../php/logout.php">Logout</a>
    <?php else: ?>
      <a href="../login.php">Login</a>
    <?php endif; ?>
  </div>
</nav>
