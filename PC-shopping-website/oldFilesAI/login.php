<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Login — MSI Store</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<?php
session_start();
$error = $_SESSION['login_error'] ?? '';
unset($_SESSION['login_error']);
// Redirect if already logged in
if (isset($_SESSION['user'])) {
    $loc = $_SESSION['user']['role'] === 'admin' ? 'admin/dashboard.php' : 'index.php';
    header("Location: $loc"); exit;
}
?>

<div class="form-container">
  <h2>🎮 Sign In</h2>

  <?php if ($error): ?>
    <div class="alert alert-error"><?= htmlspecialchars($error) ?></div>
  <?php endif; ?>

  <form action="php/login_handler.php" method="POST">
    <div class="form-group">
      <label>Email</label>
      <input type="email" name="email" placeholder="you@example.com" required>
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" name="password" placeholder="••••••••" required>
      <span class="hint">Admins and customers use the same login form.</span>
    </div>
    <button type="submit" class="btn" style="width:100%">Login</button>
  </form>

  <p style="text-align:center;margin-top:16px;font-size:.9rem;">
    Don't have an account? <a href="register.php" style="color:#c0392b">Register</a>
  </p>
</div>

</body>
</html>
