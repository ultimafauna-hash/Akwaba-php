<?php
/**
 * Akwaba Info - Culture Posts Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM culture_posts ORDER BY created_at DESC");
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        $user = requireAdmin($pdo);
        $post = $data;
        $id = $post['id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("UPDATE culture_posts SET title = ?, content = ?, image = ?, video = ?, category = ?, author = ? WHERE id = ?");
            $stmt->execute([$post['title'], $post['content'], $post['image'], $post['video'], $post['category'], $post['author'], $id]);
            sendResponse(["success" => true]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO culture_posts (title, content, image, video, category, author) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$post['title'], $post['content'], $post['image'], $post['video'], $post['category'], $post['author']]);
            sendResponse(["success" => true, "id" => $pdo->lastInsertId()]);
        }
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM culture_posts WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;
}
