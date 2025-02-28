<?php
    include "conn.php";
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $table = $_POST['table'];
        $id = $_POST['id'];
        $validTables = [
            "member" => "member_id",
            "administrator" => "admin_id",
            "nutrition" => "nutrition_id",
            "diet" => "diet_id",
            "workout" => "workout_id"
        ];
    
        if (!isset($validTables[$table])) {
            die("Invalid table name.");
        }
        
        $sql = "DELETE FROM $table WHERE {$validTables[$table]} = '$id'";
        
        if (!$dbConn->query($sql)) {
            die("Error Deleting: " . $dbConn->error);
        }
        
        echo "Record deleted successfully!";
    }