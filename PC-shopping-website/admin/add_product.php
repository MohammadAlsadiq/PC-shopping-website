<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Add Product — Admin</title>
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="css/admin.css">
</head>
<body>

<?php require 'php/admin_navbar.php'; ?>

<div class="admin-wrap">
  <div class="sidebar">
    <h3>Admin Menu</h3>
    <a href="dashboard.php">📊 Dashboard</a>
    <a href="products.php">📦 Products</a>
    <a href="add_product.php" class="active">➕ Add Product</a>
    <a href="orders.php">🧾 Orders</a>
    <a href="customers.php">👥 Customers</a>
    <a href="../php/logout.php">🚪 Logout</a>
  </div>

  <div class="admin-content">
    <h1>Add New Product</h1>

    <!-- enctype required for file upload -->
    <form action="php/save_product.php" method="POST" enctype="multipart/form-data"
          style="max-width:520px;">
      <div class="form-group">
        <label>Product Name</label>
        <input type="text" name="name" required>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select name="category">
          <option>Custom Builds</option>
          <option>Gaming Monitors</option>
          <option>Graphic Cards</option>
          <option>Accessories</option>
        </select>
      </div>
      <div class="form-group">
        <label>Price ($)</label>
        <input type="number" name="price" step="0.01" min="0" required>
      </div>
      <div class="form-group">
        <label>Stock Quantity</label>
        <input type="number" name="stock" min="0" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="description" rows="3"
          style="width:100%;padding:9px 12px;background:#2a2a2a;border:1px solid #444;color:#eee;border-radius:4px;"></textarea>
      </div>
      <div class="form-group">
        <label>Product Image</label>
        <input type="file" name="image" accept="image/*"
               style="padding:6px;background:#2a2a2a;border:1px solid #444;color:#eee;border-radius:4px;width:100%;">
        <span class="hint">Image filename will be stored in DB. Uploads go to /uploads/products/</span>
      </div>
      <button type="submit" class="btn">Save Product</button>
      <a href="products.php" class="btn btn-outline" style="margin-left:10px;">Cancel</a>
    </form>
  </div>
</div>

<footer>&copy; 2025 MSI Gaming Store — Admin</footer>
</body>
</html>
