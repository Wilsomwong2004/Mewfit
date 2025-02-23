<?php
    $header = "location: ./";
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $data = $_POST['data'];
        $id = $_POST['id'];
        switch ($data) {
            case 'member':
                $sql = "DELETE FROM member WHERE member_ID = '$id'";
                break;
            case 'admin':
                $sql = "DELETE FROM administrator WHERE admin_ID = '$id'";
                break;
            case 'nutrition':
                $sql = "DELETE FROM nutrition WHERE nutrition_ID = '$id'";
                break;
            case 'diet':
                $sql = "DELETE FROM nutrition WHERE diet_ID = '$id'";
                break;
            case 'workout':
                $sql = "DELETE FROM workout WHERE workout_ID = '$id'";
                break;
        }
        $header .= "?data=$data";
        require "./dbConn.php";
        if (!$dbConn -> query($sql)) {
            die("Error Deleting");
        }
    }
    header($header);
    die();