<?php
// php/contact_handler.php — stub
session_start();
// TODO: Validate input, send email via mail() or PHPMailer
// $name    = trim($_POST['name']);
// $email   = trim($_POST['email']);
// $message = trim($_POST['message']);
// mail('support@msistore.com', "Contact from $name", $message, "Reply-To: $email");
header("Location: ../contact.php?sent=1");
exit;
