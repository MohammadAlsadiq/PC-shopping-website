<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Dashboard — MSI Store</title>
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="css/admin.css">
</head>
<body>

<?php require 'php/admin_navbar.php'; ?>

<div class="admin-wrap">
  <div class="sidebar">
    <h3>Admin Menu</h3>
    <a href="dashboard.php" class="active">📊 Dashboard</a>
    <a href="products.php">📦 Products</a>
    <a href="add_product.php">➕ Add Product</a>
    <a href="orders.php">🧾 Orders</a>
    <a href="customers.php">👥 Customers</a>
    <a href="../php/logout.php">🚪 Logout</a>
  </div>

  <div class="admin-content">
    <h1>Dashboard</h1>

    <div class="stat-cards">
      <!-- TODO: Pull counts from DB -->
      <div class="stat-card"><div class="num">24</div><div class="label">Products</div></div>
      <div class="stat-card"><div class="num">8</div><div class="label">Orders Today</div></div>
      <div class="stat-card"><div class="num">142</div><div class="label">Customers</div></div>
      <div class="stat-card"><div class="num">$3,920</div><div class="label">Revenue</div></div>
    </div>

    <h2 style="font-size:1.1rem;margin-bottom:12px;">Recent Orders</h2>
    <table>
      <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        <!-- TODO: SELECT * FROM orders ORDER BY created_at DESC LIMIT 5 -->
        <tr>
          <td>1001</td><td>Jane Doe</td><td>$499.00</td><td>Pending</td>
          <td><a href="orders.php?id=1001" class="btn" style="padding:4px 10px;font-size:.8rem;">View</a></td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<footer>&copy; 2025 MSI Gaming Store — Admin</footer>
</body>
</html>
