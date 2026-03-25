<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Register — MSI Store</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<?php session_start(); ?>

<div class="form-container">
  <h2>Create Account</h2>

  <form action="php/register_handler.php" method="POST">
    <div class="form-group">
      <label>Full Name</label>
      <input type="text" name="name" required>
    </div>
    <div class="form-group">
      <label>Email</label>
      <input type="email" name="email" required>
    </div>
    <div class="form-group">
      <label>Password</label>
      <input type="password" name="password" required>
    </div>
    <div class="form-group">
      <label>Confirm Password</label>
      <input type="password" name="confirm_password" required>
    </div>
    <button type="submit" class="btn" style="width:100%">Register</button>
  </form>

  <p style="text-align:center;margin-top:16px;font-size:.9rem;">
    Already have an account? <a href="login.php" style="color:#c0392b">Login</a>
  </p>
</div>

</body>
</html>
