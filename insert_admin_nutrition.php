<?php 
    include "conn.php";
    session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['nutrition-name'] ?? '';
    $calories = $_POST['calories'] ?? 0;
    $fat = $_POST['fat'] ?? 0;
    $protein = $_POST['protein'] ?? 0;
    $carbohydrate = $_POST['carb'] ?? 0;

    $nutrierrors = [];

    // Validate input
    if ($calories <= 0) {
        $nutrierrors[] = "Calories must be a positive number.";
    }
    if ($fat < 0) {
        $nutrierrors[] = "Fat must be a non-negative number.";
    }
    if ($protein < 0) {
        $nutrierrors[] = "Protein must be a non-negative number.";
    }
    if ($carbohydrate < 0) {
        $nutrierrors[] = "Carbohydrate must be a non-negative number.";
    }

    // Check if nutrition name already exists
    $checkStmt = $dbConn->prepare("SELECT COUNT(*) FROM nutrition WHERE nutrition_name = ?");
    $checkStmt->bind_param("s", $name);
    $checkStmt->execute();
    $checkStmt->bind_result($count);
    $checkStmt->fetch();
    $checkStmt->close();

    if ($count > 0) {
        $nutrierrors[] = "Nutrition name already exists.";
    }

    if (empty($nutrierrors)) {
        $insertStmt = $dbConn->prepare("INSERT INTO nutrition (nutrition_name, calories, fat, protein, carbohydrate) VALUES (?, ?, ?, ?, ?)");
        $insertStmt->bind_param("sdddd", $name, $calories, $fat, $protein, $carbohydrate);

        if ($insertStmt->execute()) {
            $_SESSION['success_message'] = "Nutrition data added successfully!";
            unset($_SESSION['nutri_errors']);
            unset($_SESSION['nutri_old_data']);
            header("Location: admin_diet.php#nutrition");
            exit();
        } else {
            $errors[] = "Error adding nutrition data: " . $dbConn->error;
        } 
    } 
    if (!empty($nutrierrors)) {
        $_SESSION['nutri_errors'] = $nutrierrors;
        $_SESSION['nutri_old_data'] = $_POST;
        header("Location: admin_diet.php#nutrition");
    }
}
?>