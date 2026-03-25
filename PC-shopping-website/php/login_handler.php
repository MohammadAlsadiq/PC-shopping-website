<?php
// php/login_handler.php
session_start();
require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email    = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    // Check admin table first
    $stmt = $conn->prepare("SELECT id, name, password FROM admin WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    if ($result && password_verify($password, $result['password'])) {
        $_SESSION['user'] = ['id' => $result['id'], 'name' => $result['name'], 'role' => 'admin'];
        header("Location: ../admin/dashboard.php");
        exit;
    }

    // Check customer table
    $stmt = $conn->prepare("SELECT id, name, password FROM customer WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    if ($result && password_verify($password, $result['password'])) {
        $_SESSION['user'] = ['id' => $result['id'], 'name' => $result['name'], 'role' => 'customer'];
        header("Location: ../index.php");
        exit;
    }

    $_SESSION['login_error'] = "Invalid email or password.";
    header("Location: ../login.php");
    exit;
}
