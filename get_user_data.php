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
    
    // Get all workout data (accessible to all users)
    $stmt_workouts = $conn->prepare("SELECT workout_id, workout_name, workout_type, difficulty, calories, duration, description FROM workout");
    $stmt_workouts->execute();
    $workouts = $stmt_workouts->fetchAll(PDO::FETCH_ASSOC);
    
    // Get all diet data (accessible to all users)
    $stmt_diets = $conn->prepare("SELECT d.diet_id, d.diet_name, d.description, d.diet_type, d.difficulty, d.preparation_min, n.calories 
                                FROM diet d 
                                JOIN nutrition n ON d.nutrition_id = n.nutrition_id");
    $stmt_diets->execute();
    $diets = $stmt_diets->fetchAll(PDO::FETCH_ASSOC);
    
    // Get user's workout history (only for logged-in user)
    $stmt_workout_history = $conn->prepare("SELECT wh.date, w.workout_name, w.calories, w.duration 
                                          FROM workout_history wh 
                                          JOIN workout w ON wh.workout_id = w.workout_id 
                                          WHERE wh.member_id = :member_id 
                                          ORDER BY wh.date DESC");
    $stmt_workout_history->bindParam(':member_id', $member_id);
    $stmt_workout_history->execute();
    $workout_history = $stmt_workout_history->fetchAll(PDO::FETCH_ASSOC);
    
    // Get user's diet history (only for logged-in user)
    $stmt_diet_history = $conn->prepare("SELECT dh.date, d.diet_name, n.calories 
                                       FROM diet_history dh 
                                       JOIN diet d ON dh.diet_id = d.diet_id 
                                       JOIN nutrition n ON d.nutrition_id = n.nutrition_id 
                                       WHERE dh.member_id = :member_id 
                                       ORDER BY dh.date DESC");
    $stmt_diet_history->bindParam(':member_id', $member_id);
    $stmt_diet_history->execute();
    $diet_history = $stmt_diet_history->fetchAll(PDO::FETCH_ASSOC);
    
    // Get user's custom diets (only for logged-in user)
    $stmt_custom_diets = $conn->prepare("SELECT date, custom_diet_name, calories 
                                       FROM custom_diet 
                                       WHERE member_id = :member_id 
                                       ORDER BY date DESC");
    $stmt_custom_diets->bindParam(':member_id', $member_id);
    $stmt_custom_diets->execute();
    $custom_diets = $stmt_custom_diets->fetchAll(PDO::FETCH_ASSOC);
    
    // Combine all data
    $response = [
        "workouts" => $workouts,
        "diets" => $diets,
        "user_workout_history" => $workout_history,
        "user_diet_history" => $diet_history,
        "user_custom_diets" => $custom_diets
    ];
    
    echo json_encode($response);
    
} catch(PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}

$conn = null;
?>