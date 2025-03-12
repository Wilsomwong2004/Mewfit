<?php
// Enable CORS for local development
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
session_start();

include 'conn.php';

// Check if user is logged in
if (!isset($_SESSION['member_id'])) {
    echo json_encode(["error" => "User not logged in"]);
    exit;
}

$member_id = $_SESSION['member_id'];

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Get user data
    $stmt = $conn->prepare("SELECT * FROM member WHERE member_id = :member_id");
    $stmt->bindParam(':member_id', $member_id);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        // Get performance data
        $stmt2 = $conn->prepare("SELECT * FROM member_performance WHERE member_id = :member_id ORDER BY weeks_date_mon DESC LIMIT 1");
        $stmt2->bindParam(':member_id', $member_id);
        $stmt2->execute();
        
        $performance = $stmt2->fetch(PDO::FETCH_ASSOC);
        
        // Combine data
        $response = [
            "user" => $user,
            "performance" => $performance
        ];
        
        echo json_encode($response);
    } else {
        echo json_encode(["error" => "User not found"]);
    }
} catch(PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}

$conn = null;
?>