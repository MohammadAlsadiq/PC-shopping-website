<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Edit Product — Admin</title>
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="css/admin.css">
</head>
<body>

<?php
require 'php/admin_navbar.php';
// TODO: $id = $_GET['id'];
// $stmt = $conn->prepare("SELECT * FROM product WHERE id = ?");
// $stmt->bind_param("i", $id); $stmt->execute();
// $product = $stmt->get_result()->fetch_assoc();
$product = ['id'=>1,'name'=>'MSI Pro 16','category'=>'Custom Builds','price'=>499,'stock'=>12,'description'=>'Sample desc','image'=>''];
?>

<div class="admin-wrap">
  <div class="sidebar">
    <h3>Admin Menu</h3>
    <a href="dashboard.php">📊 Dashboard</a>
    <a href="products.php" class="active">📦 Products</a>
    <a href="add_product.php">➕ Add Product</a>
    <a href="orders.php">🧾 Orders</a>
    <a href="customers.php">👥 Customers</a>
    <a href="../php/logout.php">🚪 Logout</a>
  </div>

  <div class="admin-content">
    <h1>Edit Product #<?= $product['id'] ?></h1>

    <form action="php/save_product.php" method="POST" enctype="multipart/form-data"
          style="max-width:520px;">
      <input type="hidden" name="id" value="<?= $product['id'] ?>">
      <div class="form-group">
        <label>Product Name</label>
        <input type="text" name="name" value="<?= htmlspecialchars($product['name']) ?>" required>
      </div>
      <div class="form-group">
        <label>Category</label>
        <select name="category">
          <?php foreach (['Custom Builds','Gaming Monitors','Graphic Cards','Accessories'] as $cat): ?>
            <option <?= $product['category']===$cat?'selected':'' ?>><?= $cat ?></option>
          <?php endforeach; ?>
        </select>
      </div>
      <div class="form-group">
        <label>Price ($)</label>
        <input type="number" name="price" step="0.01" value="<?= $product['price'] ?>" required>
      </div>
      <div class="form-group">
        <label>Stock Quantity</label>
        <input type="number" name="stock" value="<?= $product['stock'] ?>" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea name="description" rows="3"
          style="width:100%;padding:9px 12px;background:#2a2a2a;border:1px solid #444;color:#eee;border-radius:4px;"><?= htmlspecialchars($product['description']) ?></textarea>
      </div>
      <div class="form-group">
        <label>Replace Image (optional)</label>
        <?php if ($product['image']): ?>
          <p style="font-size:.8rem;color:#888;margin-bottom:6px;">Current: <?= $product['image'] ?></p>
        <?php endif; ?>
        <input type="file" name="image" accept="image/*"
               style="padding:6px;background:#2a2a2a;border:1px solid #444;color:#eee;border-radius:4px;width:100%;">
      </div>
      <button type="submit" class="btn">Update Product</button>
      <a href="products.php" class="btn btn-outline" style="margin-left:10px;">Cancel</a>
    </form>
  </div>
</div>

<footer>&copy; 2025 MSI Gaming Store — Admin</footer>
</body>
</html>
