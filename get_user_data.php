<?php
// Add this at the very top of your file
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Start output buffering
ob_start();

require_once 'conn.php';
session_start();

// Check if member is logged in
if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    echo json_encode([
        "error" => "Member not logged in",
        "isLoggedIn" => false,
        "memberData" => null
    ]);
    exit;
}

$memberId = $_SESSION["member_id"];
$response = [];

try {
    // Get comprehensive member info
    $query = "SELECT member_id, username, email_address, member_pic, height, weight, 
              fitness_goal, level, age, gender, target_weight, 
              day_streak_starting_date, last_session_date 
              FROM member WHERE member_id = ?";
    $stmt = mysqli_prepare($dbConn, $query);
    mysqli_stmt_bind_param($stmt, "i", $memberId);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($row = mysqli_fetch_assoc($result)) {
        $memberData = [
            "username" => $row["username"],
            "email" => $row["email_address"],
            "profile_pic" => $row["member_pic"],
            "height" => floatval($row["height"] ?: 0),
            "weight" => floatval($row["weight"] ?: 0),
            "target_weight" => floatval($row["target_weight"] ?: 0),
            "fitness_goal" => $row["fitness_goal"] ?: "Maintain",
            "level" => intval($row["level"] ?: 1),
            "age" => intval($row["age"] ?: 0),
            "gender" => $row["gender"] ?: "",
            "day_streak_starting_date" => $row["day_streak_starting_date"] ?: "",
            "last_session_date" => $row["last_session_date"] ?: ""
        ];
        
        // Get latest performance data
        $perfQuery = "SELECT performance_id, weeks_date_mon, current_weight, 
                      workout_history_count, diet_history_count 
                      FROM member_performance WHERE member_id = ? 
                      ORDER BY weeks_date_mon DESC LIMIT 1";
        $perfStmt = mysqli_prepare($dbConn, $perfQuery);
        mysqli_stmt_bind_param($perfStmt, "i", $memberId);
        mysqli_stmt_execute($perfStmt);
        $perfResult = mysqli_stmt_get_result($perfStmt);
        
        if ($perfRow = mysqli_fetch_assoc($perfResult)) {
            $performance = [
                "weeks_date_mon" => $perfRow["weeks_date_mon"],
                "current_weight" => floatval($perfRow["current_weight"]),
                'workout_history_count' => intval($perfRow['workout_history_count']),
                'diet_history_count' => intval($perfRow['diet_history_count'])
            ];
        } else {
            $performance = null;
        }
        
        // Get recent workout history
        $workoutQuery = "SELECT wh.workout_history_id, wh.date, w.workout_id, w.workout_name, 
                        w.duration, w.calories, w.difficulty, w.workout_type, w.description 
                        FROM workout_history wh
                        JOIN workouts w ON wh.workout_id = w.workout_id
                        WHERE wh.member_id = ? 
                        ORDER BY wh.date DESC LIMIT 5";
        $workoutStmt = mysqli_prepare($dbConn, $workoutQuery);
        mysqli_stmt_bind_param($workoutStmt, "i", $memberId);
        mysqli_stmt_execute($workoutStmt);
        $workoutResult = mysqli_stmt_get_result($workoutStmt);
        
        $workoutHistory = [];
        while ($workoutRow = mysqli_fetch_assoc($workoutResult)) {
            $workoutHistory[] = [
                'workout_history_id' => $workoutRow['workout_history_id'],
                'date' => $workoutRow['date'],
                'workout_id' => $workoutRow['workout_id'],
                'workout_name' => $workoutRow['workout_name'],
                'duration' => $workoutRow['duration'],
                'calories' => $workoutRow['calories'],
                'difficulty' => $workoutRow['difficulty'],
                'workout_type' => $workoutRow['workout_type'],
                'description' => $workoutRow['description']
            ];
        }
        
        // Get recent diet history
        $dietQuery = "SELECT dh.diet_history_id, dh.date, d.diet_id, d.diet_name, 
                     d.preparation_min, d.calories, d.diet_type, d.description 
                     FROM diet_history dh
                     JOIN diets d ON dh.diet_id = d.diet_id
                     WHERE dh.member_id = ? 
                     ORDER BY dh.date DESC LIMIT 5";
        $dietStmt = mysqli_prepare($dbConn, $dietQuery);
        mysqli_stmt_bind_param($dietStmt, "i", $memberId);
        mysqli_stmt_execute($dietStmt);
        $dietResult = mysqli_stmt_get_result($dietStmt);
        
        $dietHistory = [];
        while ($dietRow = mysqli_fetch_assoc($dietResult)) {
            $dietHistory[] = [
                'diet_history_id' => $dietRow['diet_history_id'],
                'date' => $dietRow['date'],
                'diet_id' => $dietRow['diet_id'],
                'diet_name' => $dietRow['diet_name'],
                'preparation_min' => $dietRow['preparation_min'],
                'calories' => $dietRow['calories'],
                'diet_type' => $dietRow['diet_type'],
                'description' => $dietRow['description']
            ];
        }
        
        // Get custom diets
        $customDietQuery = "SELECT cd.custom_diet_id, cd.diet_name, cd.preparation_min, 
                           cd.calories, cd.diet_type, cd.description, cd.creation_date
                           FROM custom_diets cd
                           WHERE cd.member_id = ?
                           ORDER BY cd.creation_date DESC LIMIT 5";
        $customDietStmt = mysqli_prepare($dbConn, $customDietQuery);
        mysqli_stmt_bind_param($customDietStmt, "i", $memberId);
        mysqli_stmt_execute($customDietStmt);
        $customDietResult = mysqli_stmt_get_result($customDietStmt);
        
        $customDiets = [];
        while ($customDietRow = mysqli_fetch_assoc($customDietResult)) {
            $customDiets[] = [
                'custom_diet_id' => $customDietRow['custom_diet_id'],
                'diet_name' => $customDietRow['diet_name'],
                'preparation_min' => $customDietRow['preparation_min'],
                'calories' => $customDietRow['calories'],
                'diet_type' => $customDietRow['diet_type'],
                'description' => $customDietRow['description'],
                'creation_date' => $customDietRow['creation_date']
            ];
        }
        
        // Get nutrition data
        $nutritionQuery = "SELECT n.nutrition_id, n.date, n.calories_intake, n.protein, 
                          n.carbs, n.fats, n.water
                          FROM nutrition n
                          WHERE n.member_id = ?
                          ORDER BY n.date DESC LIMIT 7";
        $nutritionStmt = mysqli_prepare($dbConn, $nutritionQuery);
        mysqli_stmt_bind_param($nutritionStmt, "i", $memberId);
        mysqli_stmt_execute($nutritionStmt);
        $nutritionResult = mysqli_stmt_get_result($nutritionStmt);
        
        $nutritionData = [];
        while ($nutritionRow = mysqli_fetch_assoc($nutritionResult)) {
            $nutritionData[] = [
                'nutrition_id' => $nutritionRow['nutrition_id'],
                'date' => $nutritionRow['date'],
                'calories_intake' => $nutritionRow['calories_intake'],
                'protein' => $nutritionRow['protein'],
                'carbs' => $nutritionRow['carbs'],
                'fats' => $nutritionRow['fats'],
                'water' => $nutritionRow['water']
            ];
        }
        
        // Construct final response
        $response = [
            'isLoggedIn' => true,
            'member' => $memberData,
            'performance' => $performance,
            'workout_history' => $workoutHistory,
            'diet_history' => $dietHistory,
            'custom_diets' => $customDiets,
            'nutrition' => $nutritionData
        ];
    } else {
        $response = [
            'error' => 'Member not found',
            'isLoggedIn' => false,
            'memberData' => null
        ];
    }
} catch (Exception $e) {
    $response = [
        'error' => 'Database error: ' . $e->getMessage(),
        'isLoggedIn' => false,
        'memberData' => null
    ];
} finally {
    // Close the database connection
    mysqli_close($dbConn);
}

ob_clean();

// Return the member profile data as JSON
header('Content-Type: application/json');
echo json_encode($response);
?>