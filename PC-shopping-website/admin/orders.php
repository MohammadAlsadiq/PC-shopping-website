<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Orders — Admin</title>
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
    <a href="add_product.php">➕ Add Product</a>
    <a href="orders.php" class="active">🧾 Orders</a>
    <a href="customers.php">👥 Customers</a>
    <a href="../php/logout.php">🚪 Logout</a>
  </div>

  <div class="admin-content">
    <h1>All Orders</h1>
    <table>
      <thead>
        <tr><th>Order #</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr>
      </thead>
      <tbody>
        <!-- TODO: SELECT orders.*, customer.name FROM orders JOIN customer ON orders.customer_id = customer.id ORDER BY orders.created_at DESC -->
        <tr>
          <td>1001</td><td>Jane Doe</td><td>2025-05-01</td>
          <td>MSI Pro 16 x1</td><td>$499.00</td><td>Pending</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<footer>&copy; 2025 MSI Gaming Store — Admin</footer>
</body>
</html>
