<?php
session_start();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    include "conn.php";
    $table = $_POST['table'] ?? null;
    $selectedAdminId = $_POST['selectedAdminId'] ?? null;
    $selectedNutriId = $_POST['selectedNutriId'] ?? null;
    $selectedDietId = $_POST['selectedDietId'] ?? null;

    if ($table === null) {
        echo "table data is missing.";
        exit();
    }

    switch ($table) {
        // --------------------------------------ADMINSTRATOR-----------------------------------------

        case 'administrator':
            $errors = [];
            $username = trim($_POST['eusername']);
            $password = trim($_POST['epassword']);
            $name = trim($_POST['ename']);
            $gender = trim($_POST['egender']);
            $email = trim($_POST['eemail']);
            $phone_num = trim($_POST['ephonenum']);

            // Check if username already exists but exclude the current admin
            $stmt = $dbConn->prepare("SELECT username, email_address, phone_number FROM administrator WHERE admin_id = ?");
            $stmt->bind_param("i", $selectedAdminId);
            $stmt->execute();
            $result = $stmt->get_result();
            $currentAdminData = $result->fetch_assoc();
            $stmt->close();

            if (!$currentAdminData) {
                $_SESSION['admin_errors'][] = "Selected admin does not exist.";
                header("Location: admin_user_page.php");
                exit();
            }

            //detect validation errors
            if (empty($username) || strlen($username) < 3 || strlen($username) > 20) {
                $errors[] = "Username must be between 3 and 20 characters.";
            }
            if (empty($phone_num) || !preg_match('/^\d{10}$/', $phone_num)) {
                $errors[] = "Phone number must be 10 digits.";
            }

            // Check for duplicate values (excluding the current admin)
            $stmt = $dbConn->prepare("SELECT username, email_address, phone_number FROM administrator WHERE (username = ? OR email_address = ? OR phone_number = ?) AND admin_id != ?");
            $stmt->bind_param("sssi", $username, $email, $phone_num, $selectedAdminId);
            $stmt->execute();
            $result = $stmt->get_result();

            while ($row = $result->fetch_assoc()) {
                if ($row['username'] === $username && $username !== $currentAdminData['username']) {
                    $errors[] = "Username already exists.";
                }
                if ($row['email_address'] === $email && $email !== $currentAdminData['email_address']) {
                    $errors[] = "Email already exists.";
                }
                if ($row['phone_number'] === $phone_num && $phone_num !== $currentAdminData['phone_number']) {
                    $errors[] = "Phone number already exists.";
                }
            }
            $stmt->close();

            // Handle errors
            if (!empty($errors)) {
                $_SESSION['admin_errors'] = $errors;
                $_SESSION['old_data'] = $_POST;
                $_SESSION['show_edit_form'] = true;
                header("Location: admin_user_page.php?admin_id=" . urlencode($selectedAdminId));
                exit();
            }

            // If no errors, update the database
            $updateStmt = $dbConn->prepare("UPDATE administrator SET username = ?, password = ?, name = ?, gender = ?, email_address = ?, phone_number = ? WHERE admin_id = ?");
            $updateStmt->bind_param("ssssssi", $username, $password, $name, $gender, $email, $phone_num, $selectedAdminId);

            if ($updateStmt->execute()) {
                $_SESSION['success_message'] = "Admin updated successfully!";
                header("Location: admin_user_page.php");
                exit();
            } else {
                $_SESSION['admin_errors'][] = "Error updating admin: " . $dbConn->error;
                $_SESSION['old_data'] = $_POST;
                $_SESSION['show_edit_form'] = true;
                header("Location: admin_user_page.php?admin_id=" . urlencode($selectedAdminId));
                exit();
            }
            // --------------------------------------NUTRITION-----------------------------------------

        case 'nutrition':

            $nutritionName = $_POST['enutrition-name'];
            $calories = $_POST['ecalories'];
            $fat = $_POST['efat'];
            $protein = $_POST['eprotein'];
            $carb = $_POST['ecarb'];

            // Check if nutrition name already exists (excluding the current record)
            $checkStmt = $dbConn->prepare("SELECT COUNT(*) FROM nutrition WHERE nutrition_name = ? AND nutrition_id != ?");
            $checkStmt->bind_param("si", $nutritionName, $selectedNutriId);
            $checkStmt->execute();
            $checkStmt->bind_result($count);
            $checkStmt->fetch();
            $checkStmt->close();

            $errors = [];

            if ($count > 0) {
                $errors[] = "Nutrition name already exists.";
            }
            if ($calories <= 0) {
                $errors[] = "Calories must be a positive number.";
            }
            if ($fat < 0) {
                $errors[] = "Fat must be a non-negative number.";
            }
            if ($protein < 0) {
                $errors[] = "Protein must be a non-negative number.";
            }
            if ($carbohydrate < 0) {
                $errors[] = "Carbohydrate must be a non-negative number.";
            }

            if (!empty($errors)) {
                $_SESSION['admin_errors'] = $errors;
                $_SESSION['old_data'] = $_POST;
                $_SESSION['show_edit_form'] = true;
                header("Location: admin_diet.php?nutrition_id=" . urlencode($selectedNutriId) . "#editnutrition");
                exit();
            }

            // If no errors, update the database
            $updateStmt = $dbConn->prepare("UPDATE nutrition SET nutrition_name = ?, calories = ?, fat = ?, protein = ?, carbohydrate = ? WHERE nutrition_id = ?");
            $updateStmt->bind_param("sddssi", $nutritionName, $calories, $fat, $protein, $carb, $selectedNutriId);

            if ($updateStmt->execute()) {
                $_SESSION['success_message'] = "Nutrition data updated successfully!";
                header("Location: admin_diet.php");
                exit();
            }

            // --------------------------------------DIET-----------------------------------------
        case 'diet':
            // Retrieve and sanitize form data
            $name = htmlspecialchars(trim($_POST['ediet-name']));
            $type = htmlspecialchars(trim($_POST['ediet-type']));
            $duration = (int)$_POST['epreparation_min'];
            $description = htmlspecialchars(trim($_POST['edesc']));
            $directions = htmlspecialchars(trim($_POST['edirections']));
            $selectedDietId = (int)$_POST['selectedDietId']; // Ensure you have the selected diet ID

            // Fetch the current picture from the database
            $current_picture = ''; // Initialize the variable
            $stmt = $dbConn->prepare("SELECT picture FROM diet WHERE diet_id = ?");
            $stmt->bind_param("i", $selectedDietId);
            $stmt->execute();
            $stmt->bind_result($current_picture);
            $stmt->fetch();
            $stmt->close();

            // Process nutrition IDs
            $nutrition_ids = [];
            if (!empty($_POST['edietnutrition_ids'])) {
                $nutrition_ids = array_map('intval', explode(',', $_POST['edietnutrition_ids']));
            }

            // Handle image upload
            $final_picture = $current_picture; 
            if (!empty($_FILES["emeal_picture"]["name"])) {
                // Check if the old image exists and delete it
                if (!empty($current_picture) && file_exists("./uploads/diet/" . $current_picture)) {
                    if (unlink("./uploads/diet/" . $current_picture)) {
                    }
                }

                $targetDir = "./uploads/diet/";
                if (!file_exists($targetDir)) {
                    mkdir($targetDir, 0777, true);
                }

                $fileName = basename($_FILES["emeal_picture"]["name"]);
                $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));

                $newFileName = uniqid("meal_", true) . "." . $fileType;
                $targetFilePath = $targetDir . $newFileName;

                // Move the uploaded file to the target directory
                if (move_uploaded_file($_FILES["emeal_picture"]["tmp_name"], $targetFilePath)) {
                    $final_picture = $newFileName; // Save the new file name
                }
            }

            // Prepare directions for storage
            $directions_array = array_map('trim', explode("\n", $directions));
            $directions_array = array_filter($directions_array, fn($step) => !empty($step));
            $directions_str = implode(";", $directions_array);

            // Update the diet entry in the database
            $updateStmt = $dbConn->prepare("UPDATE diet SET diet_name = ?, description = ?, diet_type = ?, preparation_min = ?, picture = ?, directions = ? WHERE diet_id = ?");
            $updateStmt->bind_param("sssissi", $name, $description, $type, $duration, $final_picture, $directions_str, $selectedDietId);

            if ($updateStmt->execute()) {
                // Delete existing nutrition IDs
                $deleteNutritionStmt = $dbConn->prepare("DELETE FROM diet_nutrition WHERE diet_id = ?");
                $deleteNutritionStmt->bind_param("i", $selectedDietId);
                $deleteNutritionStmt->execute();
                $deleteNutritionStmt->close();

                // Insert new nutrition IDs
                $insertNutritionStmt = $dbConn->prepare("INSERT INTO diet_nutrition (diet_id, nutrition_id) VALUES (?, ?)");
                foreach ($nutrition_ids as $nutrition_id) {
                    $insertNutritionStmt->bind_param("ii", $selectedDietId, $nutrition_id);
                    $insertNutritionStmt->execute();
                }
                $insertNutritionStmt->close();

                // Redirect after successful update
                header("Location: admin_diet.php");
                exit();
            }
            break;

        // -------------------------------------- WORKOUT -----------------------------------------
        case 'workout':
            // Retrieve and sanitize form data
            $name = htmlspecialchars(trim($_POST['eworkout-name']));
            $type = htmlspecialchars(trim($_POST['eworkout-type']));
            $difficulty = htmlspecialchars(trim($_POST['edifficulty']));
            $calories = (int)$_POST['ecalorie'];
            $duration = (int)$_POST['eminutes'];
            $sets = (int)$_POST['esets'];
            $description = htmlspecialchars(trim($_POST['edescription']));
            $long_description = htmlspecialchars(trim($_POST['elong-description']));

            // Process exercise checklist
            $exercise_ids = [];
            if (isset($_POST['eexercises']) && is_array($_POST['eexercises'])) {
                $exercise_ids = array_map('intval', $_POST['eexercises']);
            }

            $workoutErrors = [];

            // Validation
            if ($calories <= 0) {
                $workoutErrors[] = "Calories must be a positive number.";
            }
            if ($duration <= 0) {
                $workoutErrors[] = "Duration must be a positive number.";
            }
            if ($sets <= 0) {
                $workoutErrors[] = "Sets must be a positive number.";
            }
            if (empty($exercise_ids)) {
                $workoutErrors[] = "At least one exercise must be selected.";
            }

            // Handle image upload
            $final_image = $current_image; // Default to current image
            if (!empty($_FILES["workout_image"]["name"])) {
                $targetDir = "assets/workout_pics/";
                if (!file_exists($targetDir)) {
                    mkdir($targetDir, 0777, true);
                }

                $fileName = basename($_FILES["workout_image"]["name"]);
                $fileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
                $allowedTypes = ["jpg", "jpeg", "png", "gif"];

                if (!in_array($fileType, $allowedTypes)) {
                    $workoutErrors[] = "Error: Only JPG, JPEG, PNG, and GIF files are allowed.";
                } else {
                    $newFileName = strtolower(str_replace(' ', '_', $name)) . "." . $fileType;
                    $targetFilePath = $targetDir . $newFileName;

                    if (move_uploaded_file($_FILES["workout_image"]["tmp_name"], $targetFilePath)) {
                        $final_image = $targetFilePath; // Save the new file path
                    } else {
                        $workoutErrors[] = "Error: Failed to upload image.";
                    }
                }
            } elseif (isset($_POST['remove_image']) && $_POST['remove_image'] == 1) {
                // If the image is removed, set final_image to null
                $final_image = null;
            }

            // Check if workout name already exists
            $checkStmt = $dbConn->prepare("SELECT COUNT(*) FROM workout WHERE workout_name = ? AND workout_id != ?");
            $checkStmt->bind_param("si", $name, $selectedWorkoutId);
            $checkStmt->execute();
            $checkStmt->bind_result($count);
            $checkStmt->fetch();
            $checkStmt->close();

            if ($count > 0) {
                $workoutErrors[] = "Workout name already exists.";
            }

            // Process if no errors
            if (empty($workoutErrors)) {
                // Format the exercise checklist as array notation
                $formatted_exercise_list = "[" . implode(", ", $exercise_ids) . "]";

                // Update the workout entry in the database
                $updateStmt = $dbConn->prepare("UPDATE workout SET workout_name = ?, workout_type = ?, difficulty = ?, calories = ?, duration = ?, image = ?, description = ?, long_description = ?, sets = ?, exercise_checklist = ? WHERE workout_id = ?");
                $updateStmt->bind_param("sssiisssiisi", $name, $type, $difficulty, $calories, $duration, $final_image, $description, $long_description, $sets, $formatted_exercise_list, $selectedWorkoutId);

                if ($updateStmt->execute()) {
                    // Clear session data
                    unset($_SESSION['e_workout_errors']);
                    unset($_SESSION['e_workout_old_data']);

                    $_SESSION['workout_success_message'] = "Workout updated successfully!";
                    header("Location: admin_workout.php");
                    exit();
                } else {
                    $workoutErrors[] = "Error updating workout: " . $dbConn->error;
                }
            } else {
                // Handle errors
                $_SESSION['e_workout_errors'] = $workoutErrors;
                $_SESSION['e_workout_old_data'] = $_POST; // Store old data for repopulation
                header("Location: admin_workout.php?id=" . $selectedWorkoutId . "#workout");
                exit();
            }
    }
}
