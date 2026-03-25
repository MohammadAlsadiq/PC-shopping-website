<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Customers — Admin</title>
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
    <a href="orders.php">🧾 Orders</a>
    <a href="customers.php" class="active">👥 Customers</a>
    <a href="../php/logout.php">🚪 Logout</a>
  </div>

  <div class="admin-content">
    <h1>Customers</h1>
    <table>
      <thead>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Registered</th><th>Orders</th></tr>
      </thead>
      <tbody>
        <!-- TODO: SELECT customer.*, COUNT(orders.id) AS order_count
                   FROM customer LEFT JOIN orders ON orders.customer_id = customer.id
                   GROUP BY customer.id -->
        <tr>
          <td>1</td><td>Jane Doe</td><td>jane@example.com</td><td>2025-04-10</td><td>3</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<footer>&copy; 2025 MSI Gaming Store — Admin</footer>
</body>
</html>
