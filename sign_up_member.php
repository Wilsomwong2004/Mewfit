<?php
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mewfit";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $error = false;
    $errorMessage = "";

    // Check for empty fields
    foreach ($_POST as $key => $value) {
        if (empty(trim($value))) {
            $_SESSION['error_message'] = 'Please fill in all the required fields.';
            header("Location: sign_up_page.php");
            exit;
        }
    }

    $first_name = trim($_POST['f-name']);
    $last_name = trim($_POST['l-name']);
    $member_name = $first_name . " " . $last_name; 
    $username = trim($_POST['username']);
    $email = trim($_POST['e-mail']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $age = (int)$_POST['age'];
    $gender = $_POST['gender'];
    $weight = (float)$_POST['weight'];
    $weight_unit = $_POST['weight-unit'];
    $height = (float)$_POST['height'];
    $height_unit = $_POST['height-unit'];
    $target_weight = (float)$_POST['target-weight'];
    $target_weight_unit = $_POST['target-weight-unit'];
    $start_streak = date('Y-m-d H:i:s');

    $sql = "SELECT * FROM member WHERE username = '$username'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $_SESSION['error_message'] = "Username already taken, please choose another one.";
        header("Location: sign_up_page.php");
        exit;
    }

    $sql = "INSERT INTO member (`member_pic`, `username`, `email_address`, `password`, `level`, `weight`, `age`, `target_weight`, `gender`, `day_streak_starting_date`)
            VALUES ('Unknown_acc-removebg.png', '$username', '$email', '$password', 1, '$weight', '$age', '$target_weight', '$gender', '$start_streak')";

    if ($conn->query($sql)) {
        echo '<script>
                alert("Account added successfully!");
                window.location.href = "login_page.php";
              </script>';
    } else {
        $_SESSION['error_message'] = "Error: " . $conn->error;
        header("Location: sign_up_page.php");
        exit;
    }
}

$conn->close();
?>
