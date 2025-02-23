<?php
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $username = $_POST['username'];
        $password = $_POST['password'];
        $name = $_POST['name'];
        $gender = $_POST['gender'];
        $email = $_POST['email'];
        $phone_num = $_POST ['phonenum'];
    }

    include "conn.php";

    $sql = "INSERT INTO member(username, password, name, gender, email_address, phone_number) 
    VALUES('$username','$password','$name','$gender', '$email', '$phone_num');";

    mysqli_query($dbConn, $sql);

    if(mysqli_affected_rows($dbConn)<=0){
        die("<script>alert('Unable to insert data');</script>");
    }

    echo "<script>alert('Sucessfully insert data')</script>"
?>