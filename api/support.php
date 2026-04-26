<?php
/**
 * Akwaba Info - Support Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $user = requireAuth($pdo);
        if ($user['role'] === 'admin') {
            $stmt = $pdo->query("SELECT * FROM support_messages ORDER BY timestamp DESC");
        } else {
            $stmt = $pdo->prepare("SELECT * FROM support_messages WHERE userid = ? ORDER BY timestamp DESC");
            $stmt->execute([$user['id']]);
        }
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        $user = getUserFromToken($pdo);
        $stmt = $pdo->prepare("INSERT INTO support_messages (userid, username, email, message) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $user ? $user['id'] : null,
            $data['username'] ?? ($user ? $user['displayname'] : 'Anonyme'),
            $data['email'] ?? ($user ? $user['email'] : ''),
            $data['message']
        ]);
        sendResponse(["success" => true]);
        break;
}
