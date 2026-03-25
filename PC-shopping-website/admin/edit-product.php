<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin - Edit Product</title>
  <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body>

<?php include '../includes/admin-sidebar.php'; ?>

<div class="admin-content">
  <h1>Edit Product</h1>

  <?php
    // TODO: get ID, fetch product from DB, handle POST to update
    // $id = $_GET['id'] ?? 0;
    // if ($_SERVER['REQUEST_METHOD'] === 'POST') { ... update ... }
    // $product = $db->query("SELECT * FROM product WHERE id = $id")->fetch_assoc();
  ?>

  <form method="POST" enctype="multipart/form-data" style="max-width:500px;">
    <div class="form-group">
      <label>Product Name</label>
      <input type="text" name="name" value="<?= $product['name'] ?? '' ?>" required>
    </div>
    <div class="form-group">
      <label>Price ($)</label>
      <input type="number" name="price" step="0.01" value="<?= $product['price'] ?? '' ?>" required>
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
      <label>Description</label>
      <textarea name="description" rows="4"><?= $product['description'] ?? '' ?></textarea>
    </div>
    <div class="form-group">
      <label>Replace Image (optional)</label>
      <input type="file" name="image" accept="image/*">
    </div>
    <button type="submit" class="btn-submit">Save Changes</button>
    <a href="dashboard.php" style="margin-left:15px;color:#aaa;">Cancel</a>
  </form>
</div>

</body>
</html>
