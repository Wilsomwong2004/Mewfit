<?php
$localhost = 'localhost';
$user = 'root';
$pass = "";
$dbName = "mewfit";

$dbConn = mysqli_connect($localhost,$user,$pass,$dbName);

if(mysqli_connect_errno()){
    die('<script>alert("Connection failed")</script>')
}

echo "<script>alert("Successfully connect")</script>"
?>