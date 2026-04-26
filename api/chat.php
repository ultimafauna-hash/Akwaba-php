<?php
/**
 * Akwaba Info - Chat Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $articleId = $_GET['articleid'] ?? null;
        if (!$articleId) sendResponse(["error" => "Article ID requis"], 400);
        $stmt = $pdo->prepare("SELECT * FROM chats WHERE articleid = ? ORDER BY timestamp ASC LIMIT 100");
        $stmt->execute([$articleId]);
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        $user = requireAuth($pdo);
        if (!$data['articleid'] || !$data['content']) sendResponse(["error" => "Champs manquants"], 400);
        
        $stmt = $pdo->prepare("INSERT INTO chats (articleid, userid, username, content) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['articleid'], $user['id'], $user['displayname'] ?? 'Anonyme', $data['content']
        ]);
        sendResponse(["success" => true, "id" => $pdo->lastInsertId()]);
        break;
}
