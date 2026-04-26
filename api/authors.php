<?php
/**
 * Akwaba Info - Authors Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM authors ORDER BY name ASC");
        $authors = $stmt->fetchAll();
        foreach ($authors as &$author) {
            $author['socials'] = json_decode($author['socials'] ?? '{}', true);
            $author['specialties'] = json_decode($author['specialties'] ?? '[]', true);
        }
        sendResponse($authors);
        break;

    case 'POST':
        $user = requireAdmin($pdo);
        $author = $data;
        $id = $author['id'] ?? null;
        $socials = json_encode($author['socials'] ?? new stdClass());
        $specialties = json_encode($author['specialties'] ?? []);

        // Check if exists
        $stmt = $pdo->prepare("SELECT id FROM authors WHERE id = ?");
        $stmt->execute([$id]);
        if ($stmt->fetch()) {
            $stmt = $pdo->prepare("UPDATE authors SET name = ?, role = ?, bio = ?, image = ?, socials = ?, specialties = ? WHERE id = ?");
            $stmt->execute([$author['name'], $author['role'], $author['bio'], $author['image'], $socials, $specialties, $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO authors (id, name, role, bio, image, socials, specialties) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$id ?? bin2hex(random_bytes(8)), $author['name'], $author['role'], $author['bio'], $author['image'], $socials, $specialties]);
        }
        sendResponse(["success" => true]);
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM authors WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;
}
