<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Admin Login</title>
  <link rel="stylesheet" href="../assets/css/style.css">
  <style>
    body { display:flex; justify-content:center; align-items:center; min-height:100vh; }
    .login-box { background:#1a1a1a; padding:40px; width:320px; }
    .login-box h2 { color:#cc0000; margin-bottom:20px; text-align:center; }
    .login-box input { width:100%; padding:10px; margin-bottom:12px; background:#222; border:1px solid #444; color:#fff; }
    .login-box button { width:100%; padding:10px; background:#cc0000; color:#fff; border:none; cursor:pointer; }
    .error { color:#ff6666; font-size:13px; margin-bottom:10px; }
  </style>
</head>
<body>
<div class="login-box">
  <h2>Admin Login</h2>
  <?php
    // TODO: handle login form POST
    // if ($_SERVER['REQUEST_METHOD'] === 'POST') { ... }
    // if ($loginFailed) echo '<p class="error">Invalid credentials.</p>';
  ?>
  <form method="POST">
    <input type="text" name="username" placeholder="Username" required>
    <input type="password" name="password" placeholder="Password" required>
    <button type="submit">Login</button>
  </form>
</div>
</body>
</html>
