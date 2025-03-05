
<?php
session_start();
include "conn.php";

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get form data
    $name = trim($_POST['diet-name']);
    $type = $_POST['diet-type'];
    $duration = (int)$_POST['preparation_min'];
    $description = trim($_POST['desc']);
    $directions = trim($_POST['directions']);
    
    // Parse nutrition IDs from the hidden input
    $nutrition_ids = [];
    if (!empty($_POST['nutrition_ids'])) {
        $nutrition_ids = explode(',', $_POST['nutrition_ids']);
        $nutrition_ids = array_map('intval', $nutrition_ids);
    }

    $dieterrors = [];

    // Validate input
    
    if ($duration <= 0) {
        $dieterrors[] = "Preparation time must be a positive number.";
    }
    
    if (empty($nutrition_ids)) {
        $dieterrors[] = "At least one ingredient must be selected.";
    }
    
    // Handle image upload
    if (!empty($_FILES["meal_picture"]["name"])) {
        $targetDir = "./uploads/"; 
        if (!file_exists($targetDir)) {
            mkdir($targetDir, 0777, true);
        }

        $fileName = basename($_FILES["meal_picture"]["name"]);
        $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedTypes = ["jpg", "jpeg", "png"];

        if (!in_array($fileType, $allowedTypes)) {
            $dieterrors[] = "Error: Only JPG, JPEG, PNG files are allowed.";
        } else {
            $newFileName = uniqid("meal_", true) . "." . $fileType;
            $targetFilePath = $targetDir . $newFileName;

            // Move uploaded file
            if (move_uploaded_file($_FILES["meal_picture"]["tmp_name"], $targetFilePath)) {
                $meal_picture = $newFileName;
            } else {
                $dieterrors[] = "Error: Failed to upload image.";
            }
        }
    }

    // Check if meal name already exists
    $checkStmt = $dbConn->prepare("SELECT COUNT(*) FROM diet WHERE diet_name = ?");
    $checkStmt->bind_param("s", $name);
    $checkStmt->execute();
    $checkStmt->bind_result($count);
    $checkStmt->fetch();
    $checkStmt->close();

    if ($count > 0) {
        $dieterrors[] = "Meal name already exists.";
    }

    // Process if no errors
    if (empty($dieterrors)) {
        // Format directions as a string
        $directions_array = array_map('trim', explode("\n", $directions));
        $directions_array = array_filter($directions_array, fn($step) => !empty($step));
        $directions_str = implode(";", $directions_array);

        // Insert data into the `diet` table
        $insertStmt = $dbConn->prepare("INSERT INTO diet (diet_name, description, diet_type, preparation_min, picture, directions) VALUES (?, ?, ?, ?, ?, ?, CURDATE()))");
        $insertStmt->bind_param("sssiss", $name, $description, $type, $duration, $meal_picture, $directions_str);

        if ($insertStmt->execute()) {
            $diet_id = $insertStmt->insert_id; // Get the last inserted diet ID

            $insertNutritionStmt = $dbConn->prepare("INSERT INTO diet_nutrition (diet_id, nutrition_id) VALUES (?, ?)");

            foreach ($nutrition_ids as $nutrition_id) {
                $insertNutritionStmt->bind_param("ii", $diet_id, $nutrition_id);
                $insertNutritionStmt->execute();
            }

            $insertNutritionStmt->close();
            unset($_SESSION['diet_errors']);
            unset($_SESSION['diet_old_data']);
            
            $_SESSION['diet_success_message'] = "Meal added successfully!";
            header("Location: admin_diet.php");
            exit();
        } else {
            $dieterrors[] = "Error adding meal: " . $dbConn->error;
        }

        $insertStmt->close();
    }
    
    if (!empty($dieterrors)) {
        $_SESSION['diet_errors'] = $dieterrors;
        $_SESSION['diet_old_data'] = $_POST;
        header("Location: admin_diet.php");
    }
}
?>
<script src="js/admin_diet.js"></script>

