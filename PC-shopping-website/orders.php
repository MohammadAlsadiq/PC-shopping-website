<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Orders — MSI Store</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<?php require 'php/navbar.php'; ?>

<div class="section" style="max-width:700px;margin:0 auto;">
  <h2 style="background:none;color:#fff;font-size:1.4rem;margin-bottom:20px;">My Orders</h2>

  <!-- TODO: SELECT * FROM orders WHERE customer_id = $_SESSION['user']['id'] -->
  <table>
    <thead>
      <tr><th>#</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>1001</td>
        <td>2025-05-01</td>
        <td>MSI Pro 16 x1</td>
        <td>$499.00</td>
        <td>Delivered</td>
      </tr>
    </tbody>
  </table>
</div>

<footer>&copy; 2025 MSI Gaming Store</footer>
</body>
</html>
