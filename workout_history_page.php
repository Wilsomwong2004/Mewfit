<?php
session_start();  

if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    header("Location: prelogin.html");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MewFit</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Mogra&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css"
    />
    <link
      rel="icon"
      type="image/x-icon"
      href="./assets/icons/cat-logo-tabs.png"
    />
    <link href="css/history.css" rel="stylesheet" />
    <link rel="stylesheet" href="./css/navigation_bar.css" />
    <link rel="stylesheet" href="./css/gemini_chatbot.css" />
    <link
      href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
      rel="stylesheet"
    />
    <script defer src="./js/workout_history_page.js"></script>
  </head>
  <body>
    <div class="no-select">
      <nav class="navbar" id="navbar">
        <div class="nav-links" id="nav-links">
          <span class="workout-home"
            ><a href="homepage.html" class="active">HOME</a></span
          >
          <span class="workout-navbar"><a href="#">WORKOUT</a></span>
          <img
            src="./assets/icons/logo.svg"
            alt="logo"
            class="nav-logo"
            id="nav-logo"
          />
          <span class="workout-dietplan"
            ><a href="diet_page.html">DIET PLAN</a></span
          >
          <span class="workout-settings"
            ><a href="settings_page.html">SETTINGS</a></span
          >
        </div>
        <div class="header-right">
          <button id="hamburger-menu" aria-label="Menu">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
        <img
          src="./assets/icons/logo.svg"
          alt="logo"
          class="nav-logo-responsive"
          id="nav-logo-responsive"
        />
        <div class="profile">
          <img
            src="./assets/icons/Unknown_acc-removebg.png"
            alt="Profile"
            id="profile-pic"
          />
          <div class="profile-dropdown" id="profile-dropdown">
            <div class="profile-info">
              <img
                src="./assets/icons/Unknown_acc-removebg.png"
                alt="unknown cat"
              />
              <div>
                <h3>unknown</h3>
                <p>unknown</p>
              </div>
            </div>
            <ul>
              <li>
                <a href="#" class="settings-profile"
                  ><i class="fas fa-cog"></i>Settings</a
                >
              </li>
              <li>
                <i class="fas fa-moon"></i> Dark Mode
                <label class="switch">
                  <input
                    type="checkbox"
                    name="dark-mode-toggle"
                    id="dark-mode-toggle"
                  />
                  <span class="slider round"></span>
                </label>
              </li>
              <li>
                <a href="#" class="help-center-profile"
                  ><i class="fas fa-question-circle"></i>Help
                </a>
              </li>
              <li class="logout-profile" id="logout-profile">
                <i class="fas fa-sign-out-alt"></i> Logout
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <header class="page-header">
        <button class="previous"><i class="bx bxs-chevron-left"></i></button>
        <h1>History</h1>
      </header>

      <?php
        $servername = "localhost";
        $username = "root";
        $password = "";
        $dbname = "mewfit";
      
        $conn = new mysqli($servername, $username, $password, $dbname);
        $exist_record = false;

        if ($conn->connect_error) {
          die("Connection failed: " . $conn->connect_error);
        }
        
        $sql = "SELECT 
                workout_history.workout_history_id,
                workout_history.date,
                workout_history.member_id,
                workout_history.workout_id,
                workout.workout_name,
                workout.workout_type,
                workout.calories,
                workout.duration,
                workout.thumbnail
                FROM workout_history 
                INNER JOIN workout 
                ON workout_history.workout_id = workout.workout_id
                ORDER BY workout_history.date DESC"; // connect the workout_history table and workout table

        $result = $conn->query($sql); // create a variable and store the sql query result inside it
        
        function formatDate($date) {
          if ($date == date("Y-m-d")) {
              return "Today";
          } elseif ($date == date("Y-m-d", strtotime("-1 day"))) {
              return "Yesterday";
          } else {
              return date('d F Y', strtotime($date)); // Return normal date for older days
          }
        }

        while ($row = $result->fetch_assoc()) {

          $workout_date = formatDate($row['date']);

          if ($row['member_id'] == $_SESSION['member id']) {
            $exist_record = true;
            // prints out the record
            echo "<div class=\"workout-date\">
                  <p>{$workout_date}</p>
                  </div>
                  <div class=\"workout-record\">
                  <img
                  class=\"picture\"
                  src=\"./assets/workout_pics/{$row['thumbnail']}\"
                  alt=\"{$row['workout_name']}\"
                  />
                  <p class=\"name\">{$row['workout_name']}</p>
                  <p class=\"type\">{$row['workout_type']}</p>
                  <p class=\"kcal\">{$row['calories']}kcal</p>
                  <p class=\"time\">{$row['duration']}min</p>
                  </div>
                ";
            }
        }

        if (!$exist_record) {
          echo "<marquee class=\"no-record\" behavior=\"scroll\" direction=\"left\">There is no workout activity record in your history</marquee>";
        }

      $conn->close();
      ?>
    </div>
  </body>
  <script src="./js/navigation_bar.js"></script>
  <script src="./js/gemini_chatbot.js"></script>
  <script src="./js/darkmode.js"></script>
</html>
