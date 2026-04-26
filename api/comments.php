<?php
/**
 * Akwaba Info - Comments Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $articleId = $_GET['articleid'] ?? null;
        if ($articleId) {
            $stmt = $pdo->prepare("SELECT * FROM comments WHERE articleid = ? AND status = 'approved' ORDER BY date DESC");
            $stmt->execute([$articleId]);
            sendResponse($stmt->fetchAll());
        }
        
        // Admin: Get all comments
        requireAdmin($pdo);
        $stmt = $pdo->query("SELECT * FROM comments ORDER BY date DESC");
        sendResponse($stmt->fetchAll());
        break;

    case 'POST':
        $user = requireAuth($pdo);
        if ($action === 'like') {
            $id = $data['id'] ?? null;
            $stmt = $pdo->prepare("UPDATE comments SET likes = likes + 1 WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(["success" => true]);
        }
        
        if ($action === 'report') {
            $id = $data['id'] ?? null;
            $stmt = $pdo->prepare("UPDATE comments SET reports = reports + 1 WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(["success" => true]);
        }

        // Create comment
        if (!$data['articleid'] || !$data['content']) sendResponse(["error" => "Champs manquants"], 400);
        
        $stmt = $pdo->prepare("INSERT INTO comments (articleid, userid, author_name, author_image, content, isadmin) VALUES (?, ?, ?, ?, ?, ?)");
        $isAdmin = ($user['role'] === 'admin' || $user['role'] === 'superadmin') ? 1 : 0;
        $stmt->execute([
            $data['articleid'], $user['id'], $data['author_name'] ?? $user['displayname'], 
            $data['author_image'] ?? '', $data['content'], $isAdmin
        ]);

        // Update article comment count
        $stmt = $pdo->prepare("UPDATE articles SET commentscount = commentscount + 1 WHERE id = ?");
        $stmt->execute([$data['articleid']]);

        sendResponse(["success" => true, "id" => $pdo->lastInsertId()]);
        break;

    case 'DELETE':
        $user = requireAuth($pdo);
        $id = $_GET['id'] ?? null;
        
        // Only owner or admin can delete
        $stmt = $pdo->prepare("SELECT userid, articleid FROM comments WHERE id = ?");
        $stmt->execute([$id]);
        $comment = $stmt->fetch();
        
        if ($comment && ($comment['userid'] == $user['id'] || $user['role'] === 'admin')) {
            $stmt = $pdo->prepare("DELETE FROM comments WHERE id = ?");
            $stmt->execute([$id]);
            
            // Decrease article comment count
            $stmt = $pdo->prepare("UPDATE articles SET commentscount = GREATEST(0, commentscount - 1) WHERE id = ?");
            $stmt->execute([$comment['articleid']]);
            
            sendResponse(["success" => true]);
        }
        sendResponse(["error" => "Action non autorisée"], 403);
        break;

    default:
        sendResponse(["error" => "Méthode non autorisée"], 405);
}
