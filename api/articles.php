<?php
/**
 * Akwaba Info - Articles Endpoint
 */
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';
$data = getJSONInput();

switch ($method) {
    case 'GET':
        if (isset($_GET['slug'])) {
            $stmt = $pdo->prepare("SELECT * FROM articles WHERE slug = ?");
            $stmt->execute([$_GET['slug']]);
            $article = $stmt->fetch();
            if ($article) {
                // Decode JSON fields
                $article['gallery'] = json_decode($article['gallery'] ?? '[]', true);
                $article['reactions'] = json_decode($article['reactions'] ?? '{}', true);
                $article['tags'] = json_decode($article['tags'] ?? '[]', true);
                sendResponse($article);
            }
            sendResponse(["error" => "Article non trouvé"], 404);
        }

        $query = "SELECT * FROM articles WHERE status = 'published'";
        $params = [];

        if (isset($_GET['category']) && $_GET['category'] !== 'Tout') {
            $query .= " AND category = ?";
            $params[] = $_GET['category'];
        }

        if (isset($_GET['search'])) {
            $query .= " AND (title LIKE ? OR content LIKE ?)";
            $searchTerm = "%" . $_GET['search'] . "%";
            $params[] = $searchTerm;
            $params[] = $searchTerm;
        }

        $query .= " ORDER BY date DESC, created_at DESC";
        
        if (isset($_GET['limit'])) {
            $query .= " LIMIT " . intval($_GET['limit']);
        }

        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        $articles = $stmt->fetchAll();

        // Process JSON fields
        foreach ($articles as &$art) {
            $art['gallery'] = json_decode($art['gallery'] ?? '[]', true);
            $art['reactions'] = json_decode($art['reactions'] ?? '{}', true);
            $art['tags'] = json_decode($art['tags'] ?? '[]', true);
        }

        sendResponse($articles);
        break;

    case 'POST':
        if ($action === 'like') {
            $user = requireAuth($pdo);
            $id = $data['id'] ?? null;
            if (!$id) sendResponse(["error" => "ID requis"], 400);
            
            $stmt = $pdo->prepare("UPDATE articles SET likes = likes + 1 WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(["success" => true]);
        }

        if ($action === 'view') {
            $id = $data['id'] ?? null;
            if (!$id) sendResponse(["error" => "ID requis"], 400);
            $stmt = $pdo->prepare("UPDATE articles SET views = views + 1 WHERE id = ?");
            $stmt->execute([$id]);
            sendResponse(["success" => true]);
        }

        // Save article (Create/Update by Admin)
        $user = requireAdmin($pdo);
        $article = $data;
        $id = $article['id'] ?? null;

        // Prepare JSON fields
        $gallery = json_encode($article['gallery'] ?? []);
        $reactions = json_encode($article['reactions'] ?? new stdClass());
        $tags = json_encode($article['tags'] ?? []);

        if ($id) {
            // Update
            $sql = "UPDATE articles SET 
                slug = ?, title = ?, content = ?, date = ?, category = ?, 
                image = ?, video = ?, audiourl = ?, gallery = ?, author = ?, 
                authorrole = ?, excerpt = ?, readingtime = ?, imagecredit = ?, source = ?, 
                tags = ?, status = ?, ispremium = ?, seotitle = ?, seodescription = ?, socialimage = ?
                WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $article['slug'], $article['title'], $article['content'], $article['date'], $article['category'],
                $article['image'], $article['video'], $article['audiourl'], $gallery, $article['author'],
                $article['authorrole'], $article['excerpt'], $article['readingtime'], $article['imagecredit'], $article['source'],
                $tags, $article['status'], $article['ispremium'] ? 1 : 0, $article['seotitle'], $article['seodescription'], $article['socialimage'],
                $id
            ]);
            sendResponse(["success" => true, "id" => $id]);
        } else {
            // Create
            $sql = "INSERT INTO articles (
                slug, title, content, date, category, image, video, audiourl, gallery, author, 
                authorrole, excerpt, readingtime, imagecredit, source, tags, status, ispremium, 
                seotitle, seodescription, socialimage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                $article['slug'], $article['title'], $article['content'], $article['date'], $article['category'],
                $article['image'], $article['video'], $article['audiourl'], $gallery, $article['author'],
                $article['authorrole'], $article['excerpt'], $article['readingtime'], $article['imagecredit'], $article['source'],
                $tags, $article['status'] ?? 'published', $article['ispremium'] ? 1 : 0, $article['seotitle'], $article['seodescription'], $article['socialimage']
            ]);
            sendResponse(["success" => true, "id" => $pdo->lastInsertId()]);
        }
        break;

    case 'DELETE':
        $user = requireAdmin($pdo);
        $id = $_GET['id'] ?? null;
        if (!$id) sendResponse(["error" => "ID requis"], 400);
        $stmt = $pdo->prepare("DELETE FROM articles WHERE id = ?");
        $stmt->execute([$id]);
        sendResponse(["success" => true]);
        break;

    default:
        sendResponse(["error" => "Méthode non autorisée"], 405);
}
