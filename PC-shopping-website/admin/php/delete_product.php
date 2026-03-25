<?php
// admin/php/delete_product.php
session_start();
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header("Location: ../../login.php"); exit;
}
require '../../php/db.php';

$id = intval($_GET['id'] ?? 0);
if ($id > 0) {
    $stmt = $conn->prepare("DELETE FROM product WHERE id = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
}
header("Location: ../products.php");
exit;
