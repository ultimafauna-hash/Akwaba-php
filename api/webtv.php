<?php
/**
 * Akwaba Info - WebTV Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM web_tv ORDER BY created_at DESC");
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        if (isset($_GET['action']) && $_GET['action'] === 'view') {
            $id = $data['id'] ?? null;
            $stmt = $pdo->prepare("UPDATE web_tv SET views = views + 1 WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(["success" => true]);
        }

        $user = requireAdmin($pdo);
        $video = $data;
        $id = $video['id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("UPDATE web_tv SET title = ?, description = ?, videourl = ?, thumbnail = ?, category = ?, duration = ? WHERE id = ?");
            $stmt->execute([$video['title'], $video['description'], $video['videourl'], $video['thumbnail'], $video['category'], $video['duration'], $id]);
            sendResponse(["success" => true]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO web_tv (title, description, videourl, thumbnail, category, duration) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$video['title'], $video['description'], $video['videourl'], $video['thumbnail'], $video['category'], $video['duration']]);
            sendResponse(["success" => true, "id" => $pdo->lastInsertId()]);
        }
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM web_tv WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;
}
