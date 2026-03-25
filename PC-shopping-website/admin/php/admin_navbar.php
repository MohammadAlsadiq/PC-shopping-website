<?php
// admin/php/admin_navbar.php
session_start();
// Guard: only admins allowed
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header("Location: ../../login.php"); exit;
}
?>
<nav>
  <a class="logo" href="dashboard.php">⚙️ Admin Panel</a>
  <ul>
    <li><a href="../index.php">← Store</a></li>
  </ul>
  <div class="nav-icons">
    <span style="color:#fff;margin-right:12px;">👤 <?= htmlspecialchars($_SESSION['user']['name']) ?></span>
    <a href="../../php/logout.php">Logout</a>
  </div>
</nav>
