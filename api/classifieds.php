<?php
/**
 * Akwaba Info - Classifieds Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT c.*, u.displayname as user_name FROM classifieds c LEFT JOIN users u ON c.userid = u.id WHERE c.status = 'active' ORDER BY c.created_at DESC");
        $items = $stmt->fetchAll();
        foreach ($items as &$item) {
            $item['images'] = json_decode($item['images'] ?? '[]', true);
        }
        sendResponse($items);
        break;

    case 'POST':
        $user = requireAuth($pdo);
        $item = $data;
        $id = $item['id'] ?? null;
        $images = json_encode($item['images'] ?? []);

        if ($id) {
            // Check ownership or admin
            $stmt = $pdo->prepare("SELECT userid FROM classifieds WHERE id = ?");
            $stmt->execute([$id]);
            $ownerId = $stmt->fetchColumn();
            if ($ownerId != $user['id'] && $user['role'] !== 'admin') sendResponse(["error" => "Non autorisé"], 403);

            $stmt = $pdo->prepare("UPDATE classifieds SET title = ?, description = ?, price = ?, contact = ?, category = ?, images = ?, status = ? WHERE id = ?");
            $stmt->execute([$item['title'], $item['description'], $item['price'], $item['contact'], $item['category'], $images, $item['status'], $id]);
            sendResponse(["success" => true]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO classifieds (title, description, price, contact, category, images, status, userid) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$item['title'], $item['description'], $item['price'], $item['contact'], $item['category'], $images, $item['status'] ?? 'active', $user['id']]);
            sendResponse(["success" => true, "id" => $pdo->lastInsertId()]);
        }
        break;

    case 'DELETE':
        $user = requireAuth($pdo);
        $id = $_GET['id'] ?? null;
        // Ownership check
        $stmt = $pdo->prepare("SELECT userid FROM classifieds WHERE id = ?");
        $stmt->execute([$id]);
        $ownerId = $stmt->fetchColumn();
        if ($ownerId != $user['id'] && $user['role'] !== 'admin') sendResponse(["error" => "Non autorisé"], 403);

        $stmt = $pdo->prepare("DELETE FROM classifieds WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;
}
