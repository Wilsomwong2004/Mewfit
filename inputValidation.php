<?php
header("Content-Type: application/json");

// Include the database connection file
include "conn.php";

// Get the table, column, and value from the POST request
$table = $_POST['table'] ?? '';
$column = $_POST['column'] ?? '';
$value = $_POST['value'] ?? '';
$id = $_POST['id'] ?? null; // Get the ID parameter

// Validate input
if (empty($table) || empty($column) || empty($value)) {
    echo json_encode(["error" => "Table, column, and value are required"]);
    exit;
}

// Sanitize input to prevent SQL injection
$table = preg_replace("/[^a-zA-Z0-9_]/", "", $table); // Allow only alphanumeric and underscores
$column = preg_replace("/[^a-zA-Z0-9_]/", "", $column); // Allow only alphanumeric and underscores

// Determine the ID column name based on the table
$id_column = '';
switch ($table) {
    case 'diet':
        $id_column = 'diet_id';
        break;
    case 'nutrition':
        $id_column = 'nutrition_id';
        break;
    case 'workout':
        $id_column = 'workout_id';
        break;
    case 'member':
        $id_column = 'member_id';
        break;
    // Add more cases for other tables as needed
    default:
        $id_column = 'id'; // Default ID column name
}

try {
    if ($id) {
        // Query excluding the current record ID
        $query = "SELECT COUNT(*) as count FROM `$table` WHERE `$column` = ? AND `$id_column` != ?";
        $stmt = $dbConn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Failed to prepare the SQL statement");
        }
        
        $stmt->bind_param("si", $value, $id);
    } else {
        // Original query without exclusion
        $query = "SELECT COUNT(*) as count FROM `$table` WHERE `$column` = ?";
        $stmt = $dbConn->prepare($query);
        
        if (!$stmt) {
            throw new Exception("Failed to prepare the SQL statement");
        }
        
        $stmt->bind_param("s", $value);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    // Check if the value exists
    $exists = $row['count'] > 0;
    
    // Return the result as JSON
    echo json_encode(["exists" => $exists]);
} catch (Exception $e) {
    // Handle errors and return a JSON error message
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    // Close the statement and connection
    if (isset($stmt)) {
        $stmt->close();
    }
    $dbConn->close();
}
?>