<?php
/**
 * Akwaba Info - Profiles Endpoint
 */
require_once 'config.php';

$user = requireAuth($pdo);
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $targetUid = $_GET['uid'] ?? $user['id'];
        $stmt = $pdo->prepare("SELECT * FROM profiles WHERE uid = ?");
        $stmt->execute([$targetUid]);
        $profile = $stmt->fetch();
        
        if (!$profile) {
            // Lazy create profile if missing
            $stmt = $pdo->prepare("INSERT INTO profiles (uid, email) VALUES (?, ?)");
            $stmt->execute([$user['id'], $user['email']]);
            $stmt = $pdo->prepare("SELECT * FROM profiles WHERE uid = ?");
            $stmt->execute([$user['id']]);
            $profile = $stmt->fetch();
        }

        // Decode JSON fields
        $jsonFields = [
            'likedarticles', 'bookmarkedarticles', 'followedauthors', 'followedcategories', 
            'votedpolls', 'badges', 'kyc_documents', 'notification_preferences', 
            'privacy_settings', 'blocked_users', 'muted_keywords', 'history', 'interests'
        ];
        foreach ($jsonFields as $field) {
            $profile[$field] = json_decode($profile[$field] ?? ($field === 'kyc_documents' || $field === 'notification_preferences' || $field === 'privacy_settings' ? '{}' : '[]'), true);
        }
        
        sendResponse($profile);
        break;

    case 'PUT':
    case 'POST':
        if ($action === 'bookmark') {
            $articleId = $data['articleid'] ?? null;
            if (!$articleId) sendResponse(["error" => "ID article requis"], 400);
            
            $stmt = $pdo->prepare("SELECT bookmarkedarticles FROM profiles WHERE uid = ?");
            $stmt->execute([$user['id']]);
            $bookmarks = json_decode($stmt->fetchColumn() ?? '[]', true);
            
            if (in_array($articleId, $bookmarks)) {
                $bookmarks = array_values(array_filter($bookmarks, fn($id) => $id != $articleId));
            } else {
                $bookmarks[] = $articleId;
            }
            
            $stmt = $pdo->prepare("UPDATE profiles SET bookmarkedarticles = ? WHERE uid = ?");
            $stmt->execute([json_encode($bookmarks), $user['id']]);
            sendResponse(["success" => true, "bookmarks" => $bookmarks]);
        }

        // Standard update
        $fields = [
            'displayname', 'photourl', 'bio', 'phone', 'city', 'country', 
            'language', 'currency', 'timezone', 'font_size'
        ];
        $updates = [];
        $params = [];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }

        if (isset($data['interests'])) {
            $updates[] = "interests = ?";
            $params[] = json_encode($data['interests']);
        }

        if (empty($updates)) sendResponse(["error" => "Aucune donnée à mettre à jour"], 400);

        $params[] = $user['id'];
        $sql = "UPDATE profiles SET " . implode(", ", $updates) . " WHERE uid = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        // Sync displayname to users table if updated
        if (isset($data['displayname'])) {
            $stmt = $pdo->prepare("UPDATE users SET displayname = ? WHERE id = ?");
            $stmt->execute([$data['displayname'], $user['id']]);
        }

        sendResponse(["success" => true]);
        break;

    default:
        sendResponse(["error" => "Non autorisé"], 405);
}
