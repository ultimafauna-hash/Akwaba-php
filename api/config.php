<?php
/**
 * Akwaba Info - Configuration & Utils
 */

// Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS requests for CORS pre-flight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
// Modify these with your real hosting credentials
$db_host = 'localhost';
$db_name = 'akwaba_info';
$db_user = 'root';
$db_pass = '';

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    
    // Create admin user if not exists
    try {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE role = 'admin' OR id = 'admin-user' LIMIT 1");
        $stmt->execute();
        if (!$stmt->fetch()) {
            $admin_id = 'admin-user';
            $admin_email = 'admin@akwabainfo.com';
            $admin_password = password_hash('Akwaba', PASSWORD_BCRYPT);
            $admin_role = 'admin';
            $admin_displayname = 'Administrateur';
            
            $stmt = $pdo->prepare("INSERT INTO users (id, email, password, role, displayname) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$admin_id, $admin_email, $admin_password, $admin_role, $admin_displayname]);
            
            // Also create the profile if it doesn't exist
            $stmt = $pdo->prepare("INSERT IGNORE INTO profiles (uid, email, displayname) VALUES (?, ?, ?)");
            $stmt->execute([$admin_id, $admin_email, $admin_displayname]);
        }
    } catch (PDOException $e) {
        // Table might not exist yet during migration
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Connection failed: " . $e->getMessage()]);
    exit();
}

/**
 * Utility: Get JSON input
 */
function getJSONInput() {
    return json_decode(file_get_contents('php://input'), true) ?? [];
}

/**
 * Utility: Get User from Bearer Token
 */
function getUserFromToken($pdo) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        $stmt = $pdo->prepare("SELECT * FROM users WHERE token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if ($user && !$user['is_blocked']) {
            return $user;
        }
    }
    return null;
}

/**
 * Utility: Require Auth
 */
function requireAuth($pdo) {
    $user = getUserFromToken($pdo);
    if (!$user) {
        http_response_code(401);
        echo json_encode(["error" => "Unauthorized"]);
        exit();
    }
    return $user;
}

/**
 * Utility: Require Admin
 */
function requireAdmin($pdo) {
    $user = requireAuth($pdo);
    if ($user['role'] !== 'admin' && $user['role'] !== 'superadmin') {
        http_response_code(403);
        echo json_encode(["error" => "Forbidden: Admin access required"]);
        exit();
    }
    return $user;
}

/**
 * Utility: Response helper
 */
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode($data);
    exit();
}
