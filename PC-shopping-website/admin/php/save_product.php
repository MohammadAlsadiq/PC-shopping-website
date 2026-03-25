<?php
// admin/php/save_product.php — handles both Add and Edit
session_start();
if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
    header("Location: ../../login.php"); exit;
}
require '../../php/db.php';

$id          = intval($_POST['id'] ?? 0);   // 0 = new product
$name        = trim($_POST['name']);
$category    = $_POST['category'];
$price       = floatval($_POST['price']);
$stock       = intval($_POST['stock']);
$description = trim($_POST['description']);

// Handle image upload — store filename only in DB
$image_name = $_POST['existing_image'] ?? '';
if (!empty($_FILES['image']['name'])) {
    $ext        = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
    $image_name = uniqid('prod_') . '.' . $ext;
    $dest       = '../../uploads/products/' . $image_name;
    if (!is_dir('../../uploads/products/')) mkdir('../../uploads/products/', 0755, true);
    move_uploaded_file($_FILES['image']['tmp_name'], $dest);
}

if ($id === 0) {
    // INSERT
    $stmt = $conn->prepare("INSERT INTO product (name, category, price, stock, description, image) VALUES (?,?,?,?,?,?)");
    $stmt->bind_param("ssdiss", $name, $category, $price, $stock, $description, $image_name);
} else {
    // UPDATE
    $stmt = $conn->prepare("UPDATE product SET name=?, category=?, price=?, stock=?, description=?, image=? WHERE id=?");
    $stmt->bind_param("ssdissi", $name, $category, $price, $stock, $description, $image_name, $id);
}

$stmt->execute();
header("Location: ../products.php");
exit;
