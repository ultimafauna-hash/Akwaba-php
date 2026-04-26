<?php
/**
 * Akwaba Info - Stories Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM stories ORDER BY created_at DESC");
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        $user = requireAdmin($pdo);
        $story = $data;
        $id = $story['id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("UPDATE stories SET title = ?, type = ?, url = ?, duration = ?, author = ? WHERE id = ?");
            $stmt->execute([$story['title'], $story['type'], $story['url'], $story['duration'], $story['author'], $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO stories (title, type, url, duration, author) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$story['title'], $story['type'], $story['url'], $story['duration'], $story['author']]);
        }
        sendResponse(["success" => true]);
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM stories WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;
}
