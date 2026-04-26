<?php
/**
 * Akwaba Info - Settings Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM settings WHERE id = 1");
        $settings = $stmt->fetch();
        if ($settings) {
            $settings['sociallinks'] = json_decode($settings['sociallinks'] ?? '{}', true);
            $settings['paymentlinks'] = json_decode($settings['paymentlinks'] ?? '{}', true);
            sendResponse($settings);
        }
        // Return defaults if none found
        sendResponse([
            "sitename" => "Akwaba Info",
            "sociallinks" => new stdClass(),
            "paymentlinks" => new stdClass()
        ]);
        break;

    case 'PUT':
    case 'POST':
        $user = requireAdmin($pdo);
        
        $fields = [
            'sitename', 'description', 'urgentbannertext', 'adminemail', 
            'contactemail', 'whatsappnumber', 'maintenance_mode'
        ];
        $updates = [];
        $params = [];
        
        foreach ($fields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        
        if (isset($data['sociallinks'])) {
            $updates[] = "sociallinks = ?";
            $params[] = json_encode($data['sociallinks']);
        }
        
        if (isset($data['paymentlinks'])) {
            $updates[] = "paymentlinks = ?";
            $params[] = json_encode($data['paymentlinks']);
        }
        
        if (empty($updates)) sendResponse(["error" => "No data provided"], 400);
        
        // Upsert logic for single settings row
        $stmt = $pdo->query("SELECT id FROM settings WHERE id = 1");
        if ($stmt->fetch()) {
            $sql = "UPDATE settings SET " . implode(", ", $updates) . " WHERE id = 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        } else {
            // Very simplified insert for the first time
            $pdo->query("INSERT INTO settings (id) VALUES (1)");
            $sql = "UPDATE settings SET " . implode(", ", $updates) . " WHERE id = 1";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
        }
        
        sendResponse(["success" => true]);
        break;
}
