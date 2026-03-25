<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Manage Products — Admin</title>
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="css/admin.css">
</head>
<body>

<?php require 'php/admin_navbar.php'; ?>

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
    <h1>Products</h1>

    <!-- Search -->
    <form method="GET" style="display:flex;gap:10px;margin-bottom:20px;">
      <input type="text" name="search" placeholder="Search by name or category..."
        value="<?= htmlspecialchars($_GET['search'] ?? '') ?>"
        style="flex:1;padding:8px 12px;background:#2a2a2a;border:1px solid #444;color:#eee;border-radius:4px;">
      <button type="submit" class="btn">Search</button>
      <a href="add_product.php" class="btn" style="background:#27ae60;">+ Add New</a>
    </form>

    <table>
      <thead>
        <tr><th>ID</th><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr>
      </thead>
      <tbody>
        <!-- TODO: $search = $_GET['search'] ?? '';
             SELECT * FROM product WHERE name LIKE "%$search%" OR category LIKE "%$search%" -->
        <tr>
          <td>1</td>
          <td><img src="" alt="" style="width:50px;height:40px;object-fit:cover;background:#333;border-radius:3px;"></td>
          <td>MSI Pro 16</td>
          <td>Custom Builds</td>
          <td>$499.00</td>
          <td>12</td>
          <td>
            <a href="edit_product.php?id=1" class="btn btn-outline" style="padding:4px 10px;font-size:.8rem;">Edit</a>
            <a href="php/delete_product.php?id=1"
               onclick="return confirm('Delete this product?')"
               class="btn" style="padding:4px 10px;font-size:.8rem;background:#7b2a2a;margin-left:6px;">Delete</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<footer>&copy; 2025 MSI Gaming Store — Admin</footer>
</body>
</html>
