<?php // includes/admin-sidebar.php — session check goes here ?>
<div class="sidebar">
  <h2>🎮 Admin</h2>
  <ul>
    <li><a href="dashboard.php" class="<?= basename($_SERVER['PHP_SELF']) === 'dashboard.php' ? 'active' : '' ?>">📦 Products</a></li>
    <li><a href="add-product.php" class="<?= basename($_SERVER['PHP_SELF']) === 'add-product.php' ? 'active' : '' ?>">➕ Add Product</a></li>
    <li><a href="../index.php">🏠 View Site</a></li>
    <li><a href="logout.php">🚪 Logout</a></li>
  </ul>
</div>
