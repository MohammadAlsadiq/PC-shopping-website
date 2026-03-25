<?php
// php/register_handler.php
session_start();
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name     = trim($_POST['name'] ?? '');
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm  = $_POST['confirm_password'] ?? '';

    if ($password !== $confirm) {
        $_SESSION['login_error'] = "Passwords do not match.";
        header("Location: ../register.php"); exit;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("INSERT INTO customer (name, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $name, $email, $hashed);

    if ($stmt->execute()) {
        $_SESSION['user'] = ['id' => $conn->insert_id, 'name' => $name, 'role' => 'customer'];
        header("Location: ../index.php"); exit;
    } else {
        $_SESSION['login_error'] = "Email already in use.";
        header("Location: ../register.php"); exit;
    }
}
