<?php
// 添加错误报告以便调试
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 创建调试日志功能
function debug_log($message) {
    file_put_contents('profile_upload_debug.log', date('[Y-m-d H:i:s] ') . $message . "\n", FILE_APPEND);
}

debug_log("Script started");

session_start();
debug_log("Session info: " . print_r($_SESSION, true));

if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    header("Content-Type: application/json");
    echo json_encode(["success" => false, "message" => "Not logged in"]);
    debug_log("User not logged in");
    exit;
}

include "conn.php";
debug_log("Database connection included");

// 记录所有接收到的数据
debug_log("POST data: " . print_r($_POST, true));
debug_log("FILES data: " . print_r($_FILES, true));

// Check if we have a file upload and action is update_profile_photo
if (isset($_FILES['profile_photo']) && isset($_POST['action']) && $_POST['action'] === 'update_profile_photo') {
    debug_log("Processing profile photo update");
    
    // 确保使用正确的会话变量名称（检查是否有空格）
    if (!isset($_SESSION['member id'])) {
        debug_log("ERROR: member id session variable not set");
        header("Content-Type: application/json");
        echo json_encode(["success" => false, "message" => "Member ID not found in session"]);
        exit;
    }
    
    $member_id = $_SESSION['member id'];
    debug_log("Member ID: " . $member_id);
    
    // Get current profile photo name from database
    $current_image = '';
    $stmt = $dbConn->prepare("SELECT profile_pic FROM member WHERE member_id = ?");
    if (!$stmt) {
        debug_log("ERROR: Database prepare statement failed: " . $dbConn->error);
        header("Content-Type: application/json");
        echo json_encode(["success" => false, "message" => "Database prepare error: " . $dbConn->error]);
        exit;
    }
    
    $stmt->bind_param("i", $member_id);
    if (!$stmt->execute()) {
        debug_log("ERROR: Database execute failed: " . $stmt->error);
        header("Content-Type: application/json");
        echo json_encode(["success" => false, "message" => "Database query error: " . $stmt->error]);
        exit;
    }
    
    $stmt->bind_result($current_image);
    $stmt->fetch();
    $stmt->close();
    
    debug_log("Current image: " . $current_image);
    $final_image = $current_image;
    
    // Process the new image upload
    if (!empty($_FILES["profile_photo"]["name"])) {
        debug_log("New file uploaded: " . $_FILES["profile_photo"]["name"]);
        
        // Delete the old file if it exists
        if (!empty($current_image) && file_exists("./uploads/member/member_pic/" . $current_image)) {
            debug_log("Attempting to delete old image: " . $current_image);
            if (unlink("./uploads/member/member_pic/" . $current_image)) {
                debug_log("Successfully deleted old image");
            } else {
                debug_log("Failed to delete old image");
            }
        }
        
        // Make sure the uploads directory exists
        $targetDir = "./uploads/member/member_pic/";
        if (!file_exists($targetDir)) {
            debug_log("Creating directory: " . $targetDir);
            if (!mkdir($targetDir, 0777, true)) {
                debug_log("ERROR: Failed to create directory");
                header("Content-Type: application/json");
                echo json_encode([
                    "success" => false,
                    "message" => "Failed to create upload directory. Check permissions."
                ]);
                exit;
            }
        }
        
        // Get file extension
        $fileType = strtolower(pathinfo($_FILES["profile_photo"]["name"], PATHINFO_EXTENSION));
        debug_log("File type: " . $fileType);
        
        // Only allow image files
        $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
        if (!in_array($fileType, $allowedTypes)) {
            debug_log("ERROR: Invalid file type: " . $fileType);
            header("Content-Type: application/json");
            echo json_encode([
                "success" => false,
                "message" => "Only JPG, JPEG, PNG, and GIF files are allowed"
            ]);
            exit;
        }
        
        // 确保username会话变量存在
        if (!isset($_SESSION['username'])) {
            debug_log("ERROR: username session variable not set");
            header("Content-Type: application/json");
            echo json_encode([
                "success" => false,
                "message" => "Username not found in session"
            ]);
            exit;
        }
        
        // Create new filename based on username and member ID to avoid conflicts
        $username = $_SESSION['username'];
        $newFileName = $username . "_" . $member_id . "." . $fileType;
        $targetFilePath = $targetDir . $newFileName;
        
        debug_log("New file name: " . $newFileName);
        debug_log("Target path: " . $targetFilePath);
        
        // Upload the file
        if (move_uploaded_file($_FILES["profile_photo"]["tmp_name"], $targetFilePath)) {
            debug_log("File uploaded successfully");
            $final_image = $newFileName;
            
            // Update the database with the new file name
            $updateStmt = $dbConn->prepare("UPDATE member SET profile_pic = ? WHERE member_id = ?");
            if (!$updateStmt) {
                debug_log("ERROR: Database prepare update statement failed: " . $dbConn->error);
                header("Content-Type: application/json");
                echo json_encode([
                    "success" => false,
                    "message" => "Database prepare error: " . $dbConn->error
                ]);
                exit;
            }
            
            $updateStmt->bind_param("si", $final_image, $member_id);
            
            debug_log("Executing database update with image=" . $final_image . " and member_id=" . $member_id);
            
            if ($updateStmt->execute()) {
                debug_log("Database updated successfully. Affected rows: " . $updateStmt->affected_rows);
                
                // 检查是否有行被更新
                if ($updateStmt->affected_rows <= 0) {
                    debug_log("WARNING: No rows were updated. Check if member_id exists in database.");
                }
                
                // Update session variable
                $_SESSION["member pic"] = $final_image;
                
                header("Content-Type: application/json");
                echo json_encode([
                    "success" => true,
                    "message" => "Profile photo updated successfully",
                    "image" => $final_image
                ]);
            } else {
                debug_log("ERROR: Database execute update failed: " . $updateStmt->error);
                header("Content-Type: application/json");
                echo json_encode([
                    "success" => false,
                    "message" => "Database update failed: " . $dbConn->error
                ]);
            }
            
            $updateStmt->close();
        } else {
            debug_log("ERROR: Failed to move uploaded file from temp location");
            header("Content-Type: application/json");
            echo json_encode([
                "success" => false,
                "message" => "Failed to upload the file. Check server permissions."
            ]);
        }
    } else {
        debug_log("ERROR: No file provided in the request");
        header("Content-Type: application/json");
        echo json_encode([
            "success" => false,
            "message" => "No file uploaded"
        ]);
    }
} else {
    debug_log("ERROR: Invalid request - missing profile_photo or action parameters");
    debug_log("FILES keys: " . (isset($_FILES) ? implode(", ", array_keys($_FILES)) : "none"));
    debug_log("POST keys: " . (isset($_POST) ? implode(", ", array_keys($_POST)) : "none"));
    
    header("Content-Type: application/json");
    echo json_encode([
        "success" => false,
        "message" => "Invalid request. Ensure you're uploading a file named 'profile_photo' and including 'action=update_profile_photo'."
    ]);
}

debug_log("Script completed");
?>