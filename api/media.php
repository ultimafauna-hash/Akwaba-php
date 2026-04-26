<?php
/**
 * Akwaba Info - Media Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $user = requireAdmin($pdo);
        $stmt = $pdo->query("SELECT * FROM media ORDER BY created_at DESC");
        sendResponse($stmt->fetchAll());
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        if (!$id) sendResponse(["error" => "ID requis"], 400);
        
        // Find file
        $stmt = $pdo->prepare("SELECT url FROM media WHERE id = ?");
        $stmt->execute([$id]);
        $url = $stmt->fetchColumn();
        
        if ($url) {
            $path = '..' . $url;
            if (file_exists($path)) {
                unlink($path);
            }
            $stmt = $pdo->prepare("DELETE FROM media WHERE id = ?");
            $stmt->execute([$id]);
        }
        sendResponse(["success" => true]);
        break;
}
