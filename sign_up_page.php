<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mewfit";

$conn = new mysqli($servername, $username, $password, $dbname);

$error = false;
$errorMessage = "";

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {

  foreach ($_POST as $key => $value) {
    if (empty(trim($value))) {
        $error = true;
        $errorMessage = 'Please fill in all the required fields.';
        break;
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

  $sql = "SELECT * FROM member";
  
  $result = $conn->query($sql);

  if (!$result) {
      die("Query failed: " . $conn->error);
  }

  while ($row = $result->fetch_assoc()) {
      if ($username == $row['username']) {
        $errorMessage = "Username already taken, please choose another one";
        $error = true;
      }
  }

  if ($error) {
    // echo "
    //     <div class=\"error-popup\">
    //       <p>{$errorMessage}</p>
    //       <button class=\"close-error\">&times;</button>
    //     </div>
    //     ";

    echo "
          <script>
            alert('$errorMessage');
          </script>
          ";
  } else {
    $sql = "INSERT INTO member (`member_pic`, `username`, `password`, `level`, `weight`, `age`, `target_weight`, `gender`, `day_streak_starting_date`)
    VALUES ('./assets/icons/Unknown_acc-removebg.png', '$username', '$password', 1, '$weight', '$age', '$target_weight', '$gender', '$start_streak')";

    $result = $conn->query($sql);

    if (!$result) {
      $errorMessage = "Error: " . $conn->error;
    }

    echo '<script>alert("Account added");</script>';
    header("Refresh: 1; url=login_page.php");
    exit;
  }
}




$conn->close();
?> 

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mewfit</title>
    <link href="css/account.css" rel="stylesheet" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Mogra&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
      rel="stylesheet"
    />
  </head>
  <body>

    <div class="outer-form">
      <div class="form-wrapper">
        <div class="create-header">
          <button class="previous"><i class="bx bxs-chevron-left"></i></button>
          <h2>Create an account</h2>
        </div>
        <form method="post" autocomplete="off">
          <div class="sign-in-steps">
            <div class="pages slide_page">
              <div class="sign-in-description">
                <p>Let’s us know more about you.</p>
              </div>
              <div class="half-input-wrapper">
                <div class="half-inputs">
                  <label for="f-name">First Name</label>
                  <input type="text" id="f-name" name="f-name"/>
                </div>
                <div class="half-inputs">
                  <label for="l-name">Last Name</label>
                  <input type="text" id="l-name" name="l-name"/>
                </div>
              </div>
              <div class="inputs">
                <label for="username">Username</label>
                <input type="text" id="username" name="username"/>
              </div>
              <div class="inputs">
                <label for="e-mail">Email</label>
                <input type="email" id="e-mail" name="e-mail"/>
              </div>
              <div class="inputs">
                <label for="password">Password</label>
                <input type="password" id="password" name="password"/>
              </div>
              <div class="account-rules">
                <ul>
                  <li>Use 8 or more characters</li>
                  <li>Use upper and lower case letters (e.g. Aa)</li>
                  <li>Use a number (e.g. 1234)</li>
                  <li>Use a symbol (e.g. !@#$)</li>
                </ul>
              </div>
              <div class="button-inputs next_button">
                <button type="button">Next</button>
              </div>
            </div>

            <div class="pages slide_page">
              <div class="sign-in-description">
                <p>
                  We still need your information for let’s us more accuracy on
                  recommand
                </p>
              </div>
              <div class="half-input-wrapper">
                <div class="half-inputs">
                  <label for="age">Your Age</label>
                  <input type="number" id="age" name="age" required />
                </div>
                <div class="gender-inputs">
                  <label for="gender">Your Gender</label>
                  <select id="gender" name="gender" required>
                    <option value="" disabled selected>
                      Select your gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
              <div class="half-input-wrapper">
                <div class="half-inputs">
                  <label for="weight">Your Weight</label>
                  <input type="number" id="weight" name="weight" required />
                  <select id="weight-unit" name="weight-unit">
                    <option value="kg">KG</option>
                    <option value="lbs">LBS</option>
                  </select>
                </div>
                <div class="half-inputs">
                  <label for="height">Your Height</label>
                  <input type="number" id="height" name="height" required />
                  <select id="height-unit" name="height-unit">
                    <option value="kg">CM</option>
                    <option value="lbs">FEET</option>
                  </select>
                </div>
              </div>
              <p>Current BMI:</p>
              <div class="inputs">
                <label for="target-weight">Target Weight</label>
                <input
                  type="number"
                  id="target-weight"
                  name="target-weight"
                  required
                />
                <select id="target-weight-unit" name="target-weight-unit">
                  <option value="kg">KG</option>
                  <option value="lbs">LBS</option>
                </select>
              </div>
              <p>Target BMI:</p>
              <div class="button-inputs">
                <button type="submit">Sign up</button>
              </div>
            </div>
          </div>
        </form>
        <div class="policy">
          <p>
            By creating an account, you agree to the
            <a href="terms_condition_page.html">Terms of use</a> and
            <a href="privacy_policy_page.html"> Privacy Policy. </a>
          </p>
        </div>
      </div>
    </div>
    <script src="js/sign-in-steps.js"></script>
    <script>
      function calculateSum() {

      }
    </script>
  </body>
</html>
