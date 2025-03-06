<?php

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
    echo '  <script>
            alert("Invalid username or password");
            window.location.href = "login_page.php";
            </script>
        ';
  }
}
?>