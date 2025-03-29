<?php
session_start();
require_once 'conn.php';

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    header("Location: index.php");
    exit;
}

$member_id = $_SESSION['member id'];

// if ($conn->connect_error) {
//     header('Content-Type: application/json');
//     echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $dbConn->connect_error]);
//     exit;
// }

if (!$member_id) {
    header("Location: index.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mewfit</title>
        <link rel="stylesheet" href="./css/subworkout_done_page.css">
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Mogra&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css">
        <link rel="icon" type="image/x-icon" href="./assets/icons/cat-logo-tabs.png">
    </head>
    <body>
        <div class="container">
            <img src="./assets/icons/finish_workout.svg" alt="MewFit Finish Pic" class="finish-pic">
            <h1><span class="yay">Yay!</span> You're finish your workout</h1>
            <div class="stats">
                <div class="duration-stat stat"><i class="fa-solid fa-stopwatch"></i></div>
                <div class="calories-stat stat"></div>
            </div>
        <div class="btns">
            <button id="done-btn" class="done-btn">Done</button>
            <div id="restart-btn" class="restart-btn"><i class="fa-solid fa-rotate-right" style="color: #ffffff;"></i></div>
        </div>

        <div id="feedback-container"></div>
    </body>
    <script>
        const memberId = <?php echo $member_id; ?>;
    </script>
    <script src="./js/darkmode.js"></script>
    <script src="./js/subworkout_done_page.js"></script>
</html>