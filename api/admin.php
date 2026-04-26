<?php
/**
 * Akwaba Info - Admin Endpoint
 */
require_once 'config.php';

$user = requireAdmin($pdo);
$action = $_GET['action'] ?? '';
$data = getJSONInput();

switch ($action) {
    case 'stats':
        $stats = [
            "users" => $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn(),
            "articles" => $pdo->query("SELECT COUNT(*) FROM articles")->fetchColumn(),
            "views" => $pdo->query("SELECT SUM(views) FROM articles")->fetchColumn(),
            "revenue" => $pdo->query("SELECT SUM(amount) FROM transactions WHERE status = 'completed'")->fetchColumn()
        ];
        sendResponse($stats);
        break;

    case 'users':
        $stmt = $pdo->query("SELECT u.id, u.email, u.displayname, u.role, u.is_blocked, p.ispremium FROM users u JOIN profiles p ON u.id = p.uid");
        sendResponse($stmt->fetchAll());
        break;

    case 'block':
        $id = $data['id'] ?? null;
        $stmt = $pdo->prepare("UPDATE users SET is_blocked = 1 WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;

    case 'unblock':
        $id = $data['id'] ?? null;
        $stmt = $pdo->prepare("UPDATE users SET is_blocked = 0 WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;

    case 'isBlocked':
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("SELECT is_blocked FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $res = $stmt->fetchColumn();
        sendResponse(["is_blocked" => (bool)$res]);
        break;

    case 'logs':
        $stmt = $pdo->query("SELECT * FROM admin_activity_log ORDER BY timestamp DESC LIMIT 100");
        sendResponse($stmt->fetchAll());
        break;
        
    case 'kyc':
        $stmt = $pdo->query("SELECT u.email, p.* FROM profiles p JOIN users u ON p.uid = u.id WHERE p.kyc_status != 'none'");
        sendResponse($stmt->fetchAll());
        break;

    default:
        sendResponse(["error" => "Action admin inconnue"], 404);
}
