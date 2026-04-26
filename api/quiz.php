<?php
/**
 * Akwaba Info - Quizzes Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = getJSONInput();

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM quizzes ORDER BY created_at DESC");
        $quizzes = $stmt->fetchAll();
        foreach ($quizzes as &$quiz) {
            $quiz['questions'] = json_decode($quiz['questions'], true);
        }
        sendResponse($quizzes);
        break;

    case 'POST':
        $user = requireAdmin($pdo);
        $quiz = $data;
        $id = $quiz['id'] ?? null;
        $questions = json_encode($quiz['questions'] ?? []);

        if ($id) {
            $stmt = $pdo->prepare("UPDATE quizzes SET title = ?, description = ?, image = ?, questions = ?, difficulty = ?, category = ? WHERE id = ?");
            $stmt->execute([$quiz['title'], $quiz['description'], $quiz['image'], $questions, $quiz['difficulty'], $quiz['category'], $id]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO quizzes (title, description, image, questions, difficulty, category) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([$quiz['title'], $quiz['description'], $quiz['image'], $questions, $quiz['difficulty'], $quiz['category']]);
        }
        sendResponse(["success" => true]);
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        $stmt = $pdo->prepare("DELETE FROM quizzes WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;
}
