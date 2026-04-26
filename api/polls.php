<?php
/**
 * Akwaba Info - Polls Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM polls ORDER BY created_at DESC");
        $polls = $stmt->fetchAll();
        foreach ($polls as &$poll) {
            $poll['options'] = json_decode($poll['options'], true);
        }
        sendResponse($polls);
        break;

    case 'POST':
        if ($action === 'vote') {
            $user = requireAuth($pdo);
            $pollId = $data['pollid'] ?? null;
            $optionId = $data['optionid'] ?? null;
            
            $stmt = $pdo->prepare("SELECT options, totalvotes FROM polls WHERE id = ?");
            $stmt->execute([$pollId]);
            $poll = $stmt->fetch();
            if (!$poll) sendResponse(["error" => "Sondage non trouvé"], 404);
            
            $options = json_decode($poll['options'], true);
            foreach ($options as &$opt) {
                if ($opt['id'] == $optionId) {
                    $opt['votes'] = ($opt['votes'] ?? 0) + 1;
                }
            }
            
            $stmt = $pdo->prepare("UPDATE polls SET options = ?, totalvotes = totalvotes + 1 WHERE id = ?");
            $stmt->execute([json_encode($options), $pollId]);
            
            // Mark as voted in user profile (optional but recommended)
            $stmt = $pdo->prepare("SELECT votedpolls FROM profiles WHERE uid = ?");
            $stmt->execute([$user['id']]);
            $voted = json_decode($stmt->fetchColumn() ?? '[]', true);
            if (!in_array($pollId, $voted)) {
                $voted[] = $pollId;
                $stmt = $pdo->prepare("UPDATE profiles SET votedpolls = ? WHERE uid = ?");
                $stmt->execute([json_encode($voted), $user['id']]);
            }
            
            sendResponse(["success" => true]);
        }

        $user = requireAdmin($pdo);
        $poll = $data;
        $id = $poll['id'] ?? null;
        $options = json_encode($poll['options']);

        if ($id) {
            $stmt = $pdo->prepare("UPDATE polls SET question = ?, options = ?, enddate = ?, status = ? WHERE id = ?");
            $stmt->execute([$poll['question'], $options, $poll['enddate'], $poll['status'], $id]);
            sendResponse(["success" => true]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO polls (question, options, enddate, status) VALUES (?, ?, ?, ?)");
            $stmt->execute([$poll['question'], $options, $poll['enddate'], $poll['status'] ?? 'active']);
            sendResponse(["success" => true, "id" => $pdo->lastInsertId()]);
        }
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM polls WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;
}
