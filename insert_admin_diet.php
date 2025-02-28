<?php
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $name = $_POST['diet_name'];
            $type = $_POST['diet_type'];
            $duration = $_POST['preparation_min'];
            $thumbnail = $_POST['picture'];
            $description = $_POST['description'];
            $directions = $_POST['directions'];
            $nutrition_id = $_POST['nutrition_id']; 

        }

        include "conn.php";

        $sql = "INSERT INTO diet(diet_name, description, diet_type, preparation_min, picture, directions, nutrition_id) 
        VALUES('$name', '$description', '$type', '$duration', '$thumbnail', '$directions', '$nutrition_id');";

        if (!$dbConn->query($sql)) {
            die("Failed to update Laptop table");
        }
        $dbConn->close();

        echo "<script>alert('Sucessfully insert data')</script>"
    ?>