<?php

require_once 'conn.php';
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'error' => 'User not logged in',
        'isLoggedIn' => false,
        'userData' => null
    ]);
    exit;
}

$userId = $_SESSION['user_id'];
$response = [];

try {
    // Get comprehensive user info
    $query = "SELECT username, email, profile_pic, height, weight, 
              fitness_goal, fitness_level, age, gender 
              FROM users WHERE id = ?";
    $stmt = mysqli_prepare($dbConn, $query);
    mysqli_stmt_bind_param($stmt, "i", $userId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        $userData = [
            'name' => $row['username'],
            'email' => $row['email'],
            'profilePic' => $row['profile_pic'],
            'height' => floatval($row['height'] ?: 0),
            'weight' => floatval($row['weight'] ?: 0),
            'goal' => $row['fitness_goal'] ?: 'maintain',
            'fitnessLevel' => $row['fitness_level'] ?: 'beginner',
            'age' => intval($row['age'] ?: 0),
            'gender' => $row['gender'] ?: '',
            'preferences' => [],
            'completedWorkouts' => [],
            'healthConditions' => []
        ];
        
        // Get user workout preferences
        $prefQuery = "SELECT workout_type FROM user_preferences WHERE user_id = ?";
        $prefStmt = mysqli_prepare($dbConn, $prefQuery);
        mysqli_stmt_bind_param($prefStmt, "i", $userId);
        mysqli_stmt_execute($prefStmt);
        $prefResult = mysqli_stmt_get_result($prefStmt);
        
        while ($prefRow = mysqli_fetch_assoc($prefResult)) {
            $userData['preferences'][] = $prefRow['workout_type'];
        }
        
        // Get recently completed workouts (last 7 days)
        $historyQuery = "SELECT workout_id FROM workout_history 
                        WHERE user_id = ? AND completion_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
        $historyStmt = mysqli_prepare($dbConn, $historyQuery);
        mysqli_stmt_bind_param($historyStmt, "i", $userId);
        mysqli_stmt_execute($historyStmt);
        $historyResult = mysqli_stmt_get_result($historyStmt);
        
        while ($historyRow = mysqli_fetch_assoc($historyResult)) {
            $userData['completedWorkouts'][] = $historyRow['workout_id'];
        }
        
        // Get user health conditions
        $healthQuery = "SELECT condition_name FROM user_health_conditions WHERE user_id = ?";
        $healthStmt = mysqli_prepare($dbConn, $healthQuery);
        mysqli_stmt_bind_param($healthStmt, "i", $userId);
        mysqli_stmt_execute($healthStmt);
        $healthResult = mysqli_stmt_get_result($healthStmt);
        
        while ($healthRow = mysqli_fetch_assoc($healthResult)) {
            $userData['healthConditions'][] = $healthRow['condition_name'];
        }
        
        // Construct final response
        $response = [
            'isLoggedIn' => true,
            'userData' => $userData
        ];
    } else {
        $response = [
            'error' => 'User not found',
            'isLoggedIn' => false,
            'userData' => null
        ];
    }
} catch (Exception $e) {
    $response = [
        'error' => 'Database error: ' . $e->getMessage(),
        'isLoggedIn' => false,
        'userData' => null
    ];
} finally {
    // Close the database connection
    mysqli_close($dbConn);
}

// Return the user profile data as JSON
header('Content-Type: application/json');
echo json_encode($response);
?>