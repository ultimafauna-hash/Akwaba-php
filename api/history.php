<?php
/**
 * Akwaba Info - History Events Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $query = "SELECT * FROM history_events";
        $params = [];
        if (isset($_GET['date'])) {
            $query .= " WHERE date LIKE ?";
            $params[] = "%" . $_GET['date'] . "%";
        }
        $query .= " ORDER BY year ASC, created_at DESC";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        $user = requireAdmin($pdo);
        $event = $data;
        $id = $event['id'] ?? null;

        if ($id) {
            $stmt = $pdo->prepare("UPDATE history_events SET title = ?, content = ?, date = ?, image = ?, year = ?, category = ? WHERE id = ?");
            $stmt->execute([$event['title'], $event['content'], $event['date'], $event['image'], $event['year'], $event['category'], $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO history_events (title, content, date, image, year, category) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$event['title'], $event['content'], $event['date'], $event['image'], $event['year'], $event['category']]);
        }
        sendResponse(["success" => true]);
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM history_events WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;
}
