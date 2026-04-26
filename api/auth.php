<?php
/**
 * Akwaba Info - Auth Endpoint
 */
require_once 'config.php';

$action = $_GET['action'] ?? '';
$data = getJSONInput();

switch ($action) {
    case 'register':
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $displayName = $data['displayname'] ?? '';

        if (!$email || !$password) sendResponse(["error" => "Email et mot de passe requis"], 400);

        // Check user existence
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) sendResponse(["error" => "Cet email est déjà utilisé"], 409);

        // Create user
        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
        $token = bin2hex(random_bytes(32));
        
        $pdo->beginTransaction();
        try {
            $stmt = $pdo->prepare("INSERT INTO users (email, password, displayname, token) VALUES (?, ?, ?, ?)");
            $stmt->execute([$email, $hashedPassword, $displayName, $token]);
            $userId = $pdo->lastInsertId();

            // Create profile
            $stmt = $pdo->prepare("INSERT INTO profiles (uid, email, displayname) VALUES (?, ?, ?)");
            $stmt->execute([$userId, $email, $displayName]);

            $pdo->commit();
            sendResponse(["token" => $token, "user" => ["id" => $userId, "email" => $email, "displayname" => $displayName, "role" => "user"]]);
        } catch (Exception $e) {
            $pdo->rollBack();
            sendResponse(["error" => "Erreur lors de la création du compte: " . $e->getMessage()], 500);
        }
        break;

    case 'admin-login':
        $login = $data['login'] ?? '';
        $password = $data['password'] ?? '';

        if ($login === "Admin" && $password === "Akwaba") {
            $stmt = $pdo->prepare("SELECT * FROM users WHERE role = 'admin' OR id = 'admin-user' LIMIT 1");
            $stmt->execute();
            $user = $stmt->fetch();

            if ($user) {
                $token = bin2hex(random_bytes(32));
                $stmt = $pdo->prepare("UPDATE users SET token = ? WHERE id = ?");
                $stmt->execute([$token, $user['id']]);

                sendResponse([
                    "token" => $token, 
                    "user" => [
                        "id" => $user['id'], 
                        "email" => $user['email'], 
                        "displayname" => $user['displayname'], 
                        "role" => $user['role']
                    ]
                ]);
            }
        }
        sendResponse(["error" => "Identifiants administrateur invalides"], 401);
        break;

    case 'login':
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            sendResponse(["error" => "Identifiants invalides"], 401);
        }

        if ($user['is_blocked']) sendResponse(["error" => "Ce compte est bloqué"], 403);

        $token = bin2hex(random_bytes(32));
        $stmt = $pdo->prepare("UPDATE users SET token = ? WHERE id = ?");
        $stmt->execute([$token, $user['id']]);

        sendResponse([
            "token" => $token, 
            "user" => [
                "id" => $user['id'], 
                "email" => $user['email'], 
                "displayname" => $user['displayname'], 
                "role" => $user['role']
            ]
        ]);
        break;

    case 'me':
        $user = requireAuth($pdo);
        sendResponse([
            "id" => $user['id'], 
            "email" => $user['email'], 
            "displayname" => $user['displayname'], 
            "role" => $user['role']
        ]);
        break;

    case 'logout':
        $user = getUserFromToken($pdo);
        if ($user) {
            $stmt = $pdo->prepare("UPDATE users SET token = NULL WHERE id = ?");
            $stmt->execute([$user['id']]);
        }
        sendResponse(["success" => true]);
        break;

    default:
        sendResponse(["error" => "Action inconnue"], 404);
}
