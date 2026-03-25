<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact Us — MSI Store</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

<?php require 'php/navbar.php'; ?>

<div class="section" style="max-width:800px;margin:0 auto;">
  <h2 style="background:none;color:#fff;font-size:1.6rem;margin-bottom:20px;">Contact Us</h2>

  <div style="display:flex;gap:30px;flex-wrap:wrap;">
    <!-- Contact Form -->
    <div class="form-container" style="flex:1;margin:0;min-width:260px;">
      <h2 style="font-size:1.1rem;margin-bottom:16px;">Send a Message</h2>
      <form action="php/contact_handler.php" method="POST">
        <div class="form-group">
          <label>Name</label>
          <input type="text" name="name" required>
        </div>
        <div class="form-group">
          <label>Email</label>
          <input type="email" name="email" required>
        </div>
        <div class="form-group">
          <label>Message</label>
          <textarea name="message" rows="4" style="width:100%;padding:9px 12px;background:#2a2a2a;border:1px solid #444;color:#eee;border-radius:4px;" required></textarea>
        </div>
        <button type="submit" class="btn" style="width:100%">Send</button>
      </form>
    </div>

    <!-- Map + Location -->
    <div style="flex:1;min-width:260px;">
      <p style="color:#aaa;margin-bottom:12px;">📍 123 Gaming St, Sydney NSW 2000, Australia</p>
      <p style="color:#aaa;margin-bottom:20px;">📞 +61 2 1234 5678 | ✉️ support@msistore.com.au</p>
      <!-- TODO: Replace src with real Google Maps embed URL -->
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3312.0!2d151.2093!3d-33.8688!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzPCsDUyJzA0LjgiUyAxNTHCsDEyJzMzLjUiRQ!5e0!3m2!1sen!2sau!4v1234567890"
        width="100%" height="220" style="border:0;border-radius:6px;" allowfullscreen loading="lazy">
      </iframe>
    </div>
  </div>
</div>

<footer>&copy; 2025 MSI Gaming Store</footer>
</body>
</html>
