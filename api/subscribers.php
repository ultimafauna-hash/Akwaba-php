<?php
/**
 * Akwaba Info - Subscribers Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        requireAdmin($pdo);
        $stmt = $pdo->query("SELECT * FROM subscribers ORDER BY created_at DESC");
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        $email = $data['email'] ?? null;
        if (!$email) sendResponse(["error" => "Email requis"], 400);
        
        $stmt = $pdo->prepare("INSERT IGNORE INTO subscribers (email) VALUES (?)");
        $stmt->execute([$email]);
        sendResponse(["success" => true]);
        break;

    case 'DELETE':
        requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        if (!$id) sendResponse(["error" => "ID requis"], 400);
        $stmt = $pdo->prepare("DELETE FROM subscribers WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;
}
