<?php
    include "conn.php";
    session_start();
    $dieterrors = $_SESSION['diet_errors'] ?? [];
    $diet_old_data = $_SESSION['diet_old_data'] ?? [];

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $name = $_POST['diet_name'];
        $type = $_POST['diet_type'];
        $duration = $_POST['preparation_min'];
        $thumbnail = $_POST['picture'];
        $description = $_POST['description'];
        $directions = $_POST['directions'];
        $nutrition_id = $_POST['nutrition_id']; 

        $dieterrors = [];

        // Validate input
        if ($duration <= 0) {
            $dieterrors[] = "Calories must be a positive number.";
        }
        
        $meal_picture = "";

        if (!empty($_FILES["meal_picture"]["name"])) {
            $targetDir = "uploads/"; 
            if (!file_exists($targetDir)) {
                mkdir($targetDir, 0777, true);
            }

            $fileName = basename($_FILES["meal_picture"]["name"]);
            $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            $allowedTypes = ["jpg", "jpeg", "png", "gif"];

            if (!in_array($fileType, $allowedTypes)) {
                $dieterrors[] = "Error: Only JPG, JPEG, PNG, and GIF files are allowed.";
            }

            $newFileName = uniqid("meal_", true) . "." . $fileType;
            $targetFilePath = $targetDir . $newFileName;

            // Move uploaded file
            if (move_uploaded_file($_FILES["meal_picture"]["tmp_name"], $targetFilePath)) {
                $meal_picture = $newFileName;
            } else {
                $dieterrors[] = "Error: Failed to upload image.";
            }
        }

        $checkStmt = $dbConn->prepare("SELECT COUNT(*) FROM diet WHERE diet_name = ?");
        $checkStmt->bind_param("s", $name);
        $checkStmt->execute();
        $checkStmt->bind_result($count);
        $checkStmt->fetch();
        $checkStmt->close();

        if ($count > 0) {
            $dieterrors[] = "Diet name already exists.";
        }

        if (empty($dieterrors)) {
            $directions_array = array_map('trim', explode("\n", $directions));
            $directions_array = array_filter($directions_array, function($step) {
                return !empty($step);
            });
            $directions_str = implode(";", $directions_array);

            $insertStmt = $dbConn->prepare("INSERT INTO diet (diet_name, description, diet_type, preparation_min, picture, directions) VALUES (?, ?, ?, ?, ?, ?)");
            $insertStmt->bind_param("sssiss", $name, $description, $type, $duration, $meal_picture, $directions_str);

            if ($insertStmt->execute()) {
                $diet_id = $insertStmt->insert_id; 
                $insertNutritionStmt = $dbConn->prepare("INSERT INTO diet_nutrition (diet_id, nutrition_id) VALUES (?, ?)");

                foreach ($nutrition_ids as $nutrition_id) {
                    $insertNutritionStmt->bind_param("ii", $diet_id, $nutrition_id);
                    $insertNutritionStmt->execute();
                }
                $_SESSION['success_message'] = "Nutrition data added successfully!";
                unset($_SESSION['diet_errors']);
                unset($_SESSION['diet_old_data']);
                header("Location: admin_diet.php");
                exit();
            } else {
                $errors[] = "Error adding nutrition data: " . $dbConn->error;
            } 
        } 
        if (!empty($nutrierrors)) {
            $_SESSION['diet_errors'] = $nutrierrors;
            $_SESSION['diet_old_data'] = $_POST;
            header("Location: admin_diet.php");
        }

    }
?>