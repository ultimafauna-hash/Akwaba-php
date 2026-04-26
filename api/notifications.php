<?php
/**
 * Akwaba Info - Notifications Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $user = requireAuth($pdo);
        $stmt = $pdo->prepare("SELECT * FROM notifications WHERE userid = ? ORDER BY created_at DESC");
        $stmt->execute([$user['id']]);
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        $user = requireAdmin($pdo);
        $stmt = $pdo->prepare("INSERT INTO notifications (userid, title, message, type) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['userid'], $data['title'], $data['message'], $data['type'] ?? 'info']);
        sendResponse(["success" => true]);
        break;

    case 'PUT':
        $user = requireAuth($pdo);
        $id = $data['id'] ?? null;
        if ($id) {
            $stmt = $pdo->prepare("UPDATE notifications SET `read` = 1 WHERE id = ? AND userid = ?");
            $stmt->execute([$id, $user['id']]);
        } else {
            $stmt = $pdo->prepare("UPDATE notifications SET `read` = 1 WHERE userid = ?");
            $stmt->execute([$user['id']]);
        }
        sendResponse(["success" => true]);
        break;
}
