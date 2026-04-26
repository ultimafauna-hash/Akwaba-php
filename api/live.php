<?php
/**
 * Akwaba Info - Live Blogs Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM live_blogs ORDER BY created_at DESC");
        $blogs = $stmt->fetchAll();
        foreach ($blogs as &$blog) {
            $blog['updates'] = json_decode($blog['updates'] ?? '[]', true);
        }
        sendResponse($blogs);
        break;

    case 'POST':
        $user = requireAdmin($pdo);
        $blog = $data;
        $id = $blog['id'] ?? null;
        $updates = json_encode($blog['updates'] ?? []);

        if ($id) {
            $stmt = $pdo->prepare("UPDATE live_blogs SET title = ?, description = ?, image = ?, status = ?, updates = ? WHERE id = ?");
            $stmt->execute([$blog['title'], $blog['description'], $blog['image'], $blog['status'], $updates, $id]);
            sendResponse(["success" => true]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO live_blogs (title, description, image, status, updates) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$blog['title'], $blog['description'], $blog['image'], $blog['status'] ?? 'active', $updates]);
            sendResponse(["success" => true, "id" => $pdo->lastInsertId()]);
        }
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM live_blogs WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;
}
