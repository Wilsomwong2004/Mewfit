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

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $error = false;
    $errorMessage = "";

    $username = trim($_POST['username']);
    $email = trim($_POST['e-mail']);
    $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $age = (int)$_POST['age'];
    $gender = $_POST['gender'];
    $weight = (float)$_POST['weight'];
    $weight_unit = $_POST['weight-unit'];
    $height = (float)$_POST['height'];
    $height_unit = $_POST['height-unit'];
    $fitness_goal = $_POST['fitness-goal'];
    $target_weight = (float)$_POST['target-weight'];
    $target_weight_unit = $_POST['target-weight-unit'];
    $start_streak = date('Y-m-d');

    foreach ($_POST as $key => $value) {
        if (empty(trim($value)) || (!isset($fitness_goal) || !isset($gender))) {
            $_SESSION['error_message'] = 'Please fill in all the required fields.';
            header("Location: sign_up_page.php");
            exit;
        }
    }

    if (($target_weight - $weight > 20) || ($weight - $target_weight > 20)) {
        $_SESSION['error_message'] = "Please enter a target weight range that is less that 20 gap";
        header("Location: sign_up_page.php");
        exit;
    } else if ((($weight < 0) || $target_weight < 0) || $height < 0) {
        $_SESSION['error_message'] = "Please enter an appropriate weight and height";
        header("Location: sign_up_page.php");
        exit;
    } else if ($age < 0 || $age > 100) {
        $_SESSION['error_message'] = "Please enter an appropriate age";
        header("Location: sign_up_page.php");
        exit;
    }

    $sql = "SELECT * FROM member WHERE username = '$username'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $_SESSION['error_message'] = "Username already taken, please choose another one.";
        header("Location: sign_up_page.php");
        exit;
    } 

    $sql = "SELECT * FROM member WHERE email_address = '$email'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $_SESSION['error_message'] = "Email is already in use, please use another e-mail";
        header("Location: sign_up_page.php");
        exit;
    } 

    $sql = "INSERT INTO member (`member_pic`, `username`, `email_address`, `password`, `level`, `height`, `weight`, `age`, `fitness_goal`, `target_weight`, `gender`, `day_streak_starting_date`, `date_registered`)
            VALUES ('Unknown_acc-removebg.png', '$username', '$email', '$password', 1, '$height',  '$weight', '$age', '$fitness_goal', '$target_weight', '$gender', '$start_streak', '$start_streak')";

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
