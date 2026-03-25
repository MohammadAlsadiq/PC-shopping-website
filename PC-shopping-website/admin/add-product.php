<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin - Add Product</title>
  <link rel="stylesheet" href="../assets/css/admin.css">
</head>
<body>

<?php include '../includes/admin-sidebar.php'; ?>

<div class="admin-content">
  <h1>Add Product</h1>

  <?php
    // TODO: handle POST, validate, insert into DB, move uploaded image
    // if ($_SERVER['REQUEST_METHOD'] === 'POST') { ... }
  ?>

  <form method="POST" enctype="multipart/form-data" style="max-width:500px;">
    <div class="form-group">
      <label>Product Name</label>
      <input type="text" name="name" required>
    </div>
    <div class="form-group">
      <label>Price ($)</label>
      <input type="number" name="price" step="0.01" required>
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
      <textarea name="description" rows="4"></textarea>
    </div>
    <div class="form-group">
      <label>Product Image</label>
      <input type="file" name="image" accept="image/*">
    </div>
    <button type="submit" class="btn-submit">Add Product</button>
    <a href="dashboard.php" style="margin-left:15px;color:#aaa;">Cancel</a>
  </form>
</div>

</body>
</html>
