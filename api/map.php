<?php
/**
 * Akwaba Info - Map Points Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM map_points ORDER BY created_at DESC");
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        $user = requireAdmin($pdo);
        $point = $data;
        $id = $point['id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("UPDATE map_points SET title = ?, description = ?, coordinates = ?, type = ?, image = ? WHERE id = ?");
            $stmt->execute([$point['title'], $point['description'], $point['coordinates'], $point['type'], $point['image'], $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO map_points (title, description, coordinates, type, image) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$point['title'], $point['description'], $point['coordinates'], $point['type'], $point['image']]);
        }
        sendResponse(["success" => true]);
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM map_points WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;
}
