<?php
session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mewfit";

$conn = new mysqli($servername, $username, $password, $dbname);

$exist_username = false;
$homepage = "homepage.php";
$login = false;

if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  $username = $_POST['username'];
  $password = $_POST['password'];

  $sql = "SELECT * FROM member";
  $result = $conn->query($sql);

  if (!$result) {
    die("Query failed: " . $conn->error);
  }

  while ($row = $result->fetch_assoc()) {
    if (($row['username'] == $username) && password_verify($password, $row['password'])) {
      $login = true;
      
      $_SESSION["logged_in"] = true;
      $_SESSION["username"] = $row['username'];
      
      header("Location: " . $homepage);
      exit();
    }
  }

  if (!$login) {
    echo "
          <script>alert(\"Invalid username or password\");</script>
          ";
  }
}
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mewfit</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Mogra&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <link rel="icon" type="image/x-icon" href="./assets/icons/cat-logo-tabs.png">
    <link rel="stylesheet" href="css/account.css" />
    <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet"/>
  </head>
  <body>
    <div class="login-box">
      <div class="login-form-box">
        <div class="logo-icon">
          <img src="assets/icons/logo.svg" alt="" />
        </div>
        <div class="login-form">
          <form action="" method="post">
            <div class="login-header"><h1>WELCOME BACK!</h1></div>
            <div class="input-box">
              <input
                type="text"
                name="username"
                placeholder="Username/Email"
                required
              />
            </div>
            <div class="input-box">
              <input
                type="password"
                name="password"
                placeholder="Password"
                required
              />
            </div>
            <button
              type="button"
              data-modal-target="#modal"
              class="forget-password-button"
            >
              Forget Password?
            </button>
            <!-- <div class="forget-password"><a href="">Forget Password?</a></div> -->
            <div class="login-button">
              <button type="submit" name="login" class="btn">LOGIN</button>
            </div>
            <div class="sign_up"><a href="sign_up_page.php">SIGN UP</a></div>
          </form>
        </div>
      </div>
    </div>
    <div class="forget-password-modal" id="modal">
      <div class="modal-header">
        <div class="modal-title">Forget password</div>
        <button data-close-button class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <div class="otp-input-wrapper">
          <div class="verify-email-wrapper">
            <input
              type="email"
              id="email-verify"
              placeholder="Enter your email"
            />
          </div>
          <div class="otp-wrapper">
            <input
              type="number"
              id="email-otp"
              placeholder="Vertification Code"
            />
          </div>
          <div class="countdown"></div>
          <div class="modal-buttons">
            <button class="otp-verify" type="button" onclick="sendOTP()">Verify</button>
            <button class="otp-button">Send OTP</button>
          </div>
          <div class="reset-vertification-btn"></div>
        </div>
      </div>
    </div>
    <div id="overlay"></div>
  </body>
  <script src="./js/login_page.js"></script>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
  <script type="text/javascript">
    (function() {
        emailjs.init("sW8jqtPVyoHZyuTY2");
    })();
</script>
</html>
