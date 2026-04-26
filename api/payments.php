<?php
/**
 * Akwaba Info - Payments Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        $user = requireAuth($pdo);
        if ($user['role'] === 'admin') {
            $stmt = $pdo->query("SELECT t.*, u.email FROM transactions t JOIN users u ON t.userid = u.id ORDER BY t.created_at DESC");
            sendResponse($stmt->fetchAll());
        } else {
            $stmt = $pdo->prepare("SELECT * FROM transactions WHERE userid = ? ORDER BY created_at DESC");
            $stmt->execute([$user['id']]);
            sendResponse($stmt->fetchAll());
        }
        break;

    case 'POST':
        $user = requireAuth($pdo);
        if ($action === 'validate') {
            requireAdmin($pdo);
            $id = $data['id'] ?? null;
            $status = $data['status'] ?? 'completed';
            
            $stmt = $pdo->prepare("UPDATE transactions SET status = ? WHERE id = ?");
            $stmt->execute([$status, $id]);
            
            if ($status === 'completed') {
                $stmt = $pdo->prepare("SELECT userid, type FROM transactions WHERE id = ?");
                $stmt->execute([$id]);
                $t = $stmt->fetch();
                if ($t && $t['type'] === 'subscription') {
                    // Update premium status
                    $until = date('Y-m-d H:i:s', strtotime('+1 month'));
                    $stmt = $pdo->prepare("UPDATE profiles SET ispremium = 1, premiumuntil = ? WHERE uid = ?");
                    $stmt->execute([$until, $t['userid']]);
                }
            }
            sendResponse(["success" => true]);
        }

        // Record transaction
        $stmt = $pdo->prepare("INSERT INTO transactions (userid, amount, currency, method, status, type, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user['id'], $data['amount'], $data['currency'] ?? 'XOF', $data['method'], 
            'pending', $data['type'] ?? 'subscription', $data['transaction_id'] ?? ''
        ]);
        sendResponse(["success" => true, "id" => $pdo->lastInsertId()]);
        break;
}
