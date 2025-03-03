<?php
session_start(); 
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    include "conn.php";
    $table = $_POST['table'] ?? null; 
    $selectedAdminId = $_POST['selectedAdminId'] ?? null;
    $selectedNutriId = $_POST['selectedNutriId']?? null;

    if ($table === null) {
        echo "table data is missing.";
        exit();
    }

    switch ($table) {
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
        case 'nutrition':
            $selectedNutriId = $_POST['selectedNutriId'] ?? null;
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
        case 'diet':
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
                $insertStmt = $dbConn->prepare("INSERT INTO diet (diet_name, description, diet_type, preparation_min, picture, directions) VALUES (?, ?, ?, ?, ?, ?)");
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
            
            // if (empty($errors)) {
            //     if ($dbConn->query("UPDATE administrator SET username = '$username', password ='$password', name = '$name', gender ='$gender', email_address ='$email', phone_number = '$phone_num' WHERE admin_id = '$selectedAdminId';") === TRUE) {
            //         echo "Admin data updated successfully!";
            //         header("location: admin_user_page.php");
            //     } else {
            //         echo "Error updating admin: " . $dbConn->error;
            //     }
            // } else {
            //     foreach ($errors as $error) {
            //         echo "<script>alert('$error');</script>";
            //     } 
            // }
            // $_SESSION['admin_errors'] = $errors;
            // header("Location: admin_user_page.php?admin_id=$selectedAdminId");
            
            // break;
        // case 'arator':
        //     include "laptopEdit.html";
        //     echo "<script>
        //         updateForm.id.value = $id;";

        //     function loadData($listID,$db,$query) {
        //         echo "var list = document.getElementById('$listID');";
        //         if ($result = $db->query($query)) {
        //             while ($row = $result->fetch_row()) {
        //                 echo "var option = document.createElement('option');
        //                     option.value = '$row[0]';
        //                     list.appendChild(option);
        //                 ";
        //             }
        //         }
        //     }

        //     loadData("cpuManufacturerList",$dbConn,"SELECT CPUManufacturer from Laptop GROUP BY CPUManufacturer;");
        //     loadData("cpuList",$dbConn,"SELECT CPUName from Laptop GROUP BY CPUName;");
        //     loadData("gpuManufacturerList",$dbConn,"SELECT GPUManufacturer from Laptop GROUP BY GPUManufacturer;");
        //     loadData("gpuList",$dbConn,"SELECT GPUName from Laptop GROUP BY GPUName;");

        //     $idValue = json_decode($id);
        //     if (isset($idValue)) {
        //         if ($result = $dbConn -> query("SELECT Name,Description,ImageAddress,CPUName,CPUManufacturer,CPUScore,GPUName,GPUManufacturer,GPUScore,RAM,MaxRAM,Storage,StorageType,MaxStorage,MaxStorageType,ScreenResolutionWidth,ScreenResolutionHeight,ScreenResolutionUpgradeWidth,ScreenResolutionUpgradeHeight,refreshRate,ColorAccuracy,ForGaming,ForBusiness,ForArt FROM Laptop WHERE ID = '$id' LIMIT 1;")) {
        //             $row = $result -> fetch_row();
        //             $ram = $row[9];
        //             $maxRam = $row[10];
        //             $storage = $row[11];
        //             $maxStorage = $row[13];
        //             echo "const imagePreview = document.getElementById('imagePreview_deviceForm');
        //                 imagePreview.src = ".json_encode("../../image/Laptop Images/$row[2]").";
        //                 imagePreview.style.display = 'block';
        //                 fetch(".json_encode("../../image/Laptop Images/$row[2]").")
        //                 .then(res => res.blob())
        //                 .then(blob => {
        //                     const file = new File([blob], ".json_encode($row[2]).", blob);
        //                     const dataTransfer = new DataTransfer();
        //                     dataTransfer.items.add(file);
        //                     document.getElementById('image').files = dataTransfer.files;
        //                 });
        //                 updateForm.deviceName.value = '$row[0]';
        //                 updateForm.description.value = ".json_encode($row[1]).";
        //                 updateForm.cpu.value = '$row[3]';
        //                 updateForm.cpuManufacturer.value = '$row[4]';
        //                 updateForm.cpuBenchmark.value = '$row[5]';
        //                 updateForm.gpu.value = '$row[6]';
        //                 updateForm.gpuManufacturer.value = '$row[7]';
        //                 updateForm.gpuBenchmark.value = $row[8];
        //                 updateForm.ramUnit.value = '".compressValue($ram)."';
        //                 updateForm.ram.value = $ram;
        //                 updateForm.maxRamUnit.value = '".compressValue($maxRam)."';
        //                 updateForm.maxRam.value = ".json_encode($maxRam).";
        //                 updateForm.storageUnit.value = '".compressValue($storage)."';
        //                 updateForm.storage.value = $storage;
        //                 updateForm.storageType.value = ".json_encode($row[12]).";
        //                 updateForm.maxStorageUnit.value = '".compressValue($maxStorage)."';
        //                 updateForm.maxStorage.value = ".json_encode($maxStorage).";
        //                 updateForm.maxStorageType.value = ".json_encode($row[14]).";
        //                 updateForm.resolutionWidth.value = $row[15];
        //                 updateForm.resolutionHeight.value = $row[16];
        //                 updateForm.resolutionUpgradeWidth.value = ".json_encode($row[17]).";
        //                 updateForm.resolutionUpgradeHeight.value = ".json_encode($row[18]).";
        //                 updateForm.refreshRate.value = ".json_encode($row[19]).";
        //                 updateForm.colorAccuracy.value = ".json_encode($row[20]).";
        //                 updateForm.forGaming.checked = $row[21];
        //                 updateForm.forBusiness.checked = $row[22];
        //                 updateForm.forArt.checked = $row[23];";
        //         }
        //     } else {
        //         echo "updateForm.deviceName.setCustomValidity('Device name cannot be empty.');
        //             updateForm.description.setCustomValidity('Description cannot be empty.');
        //             updateForm.cpuManufacturer.setCustomValidity('Manufacturer name cannot be empty.');
        //             updateForm.cpu.setCustomValidity('CPU name cannot be empty.');
        //             updateForm.cpuBenchmark.setCustomValidity('CPU benchmark cannot be empty.');
        //             updateForm.gpuManufacturer.setCustomValidity('Manufacturer name cannot be empty.');
        //             updateForm.gpu.setCustomValidity('GPU name cannot be empty.');
        //             updateForm.gpuBenchmark.setCustomValidity('GPU benchmark cannot be empty.');
        //             updateForm.ram.setCustomValidity('RAM capacity cannot be empty.');
        //             updateForm.storage.setCustomValidity('Storage capacity cannot be empty.');
        //             updateForm.resolutionWidth.setCustomValidity('Screen resolution width cannot be empty.');
        //             updateForm.resolutionHeight.setCustomValidity('Screen resolution height cannot be empty.');";
        //     }
        //     echo "</script>";
        //     break;
        // case 'feedback':
        //     if ($result = $dbConn -> query("SELECT Status FROM Feedback WHERE ID = '$id' LIMIT 1;")) {
        //         $status = ($result -> fetch_row())[0];
        //         switch ($status) {
        //             case "Pending":
        //                 $status = "Resolved";
        //                 break;
        //             case "Resolved":
        //                 $status = "Pending";
        //                 break;
        //         }
        //         $dbConn -> query("UPDATE Feedback SET Status = '$status' WHERE ID = '$id';");
        //     }
        //     $dbConn -> close();
        //     header("location: ./?data=$data");
        //     die();
    }
    $dbConn -> close();
    
} else {
    header("Location: admin_user_page.php");
    exit();
}