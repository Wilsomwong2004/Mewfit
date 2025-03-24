<?php
session_start();  

if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    header("Location: index.php");
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
        <h1>Diet</h1>
      </header>

      <div class="filter-controls">
        <button id="all-filter" class="filter-button">
          <span class="filter-text">All</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        
        <button id="date-range-filter" class="filter-button">
          <span class="filter-text">Date Range</span>
          <i class="fas fa-chevron-down"></i>
        </button>
        
        <!-- Activity Types Dropdown -->
        <div id="activity-types-dropdown" class="filter-dropdown">
          <div class="dropdown-content">
            <div class="activity-type-option" data-type="All">All</div>
            <div class="activity-type-option" data-type="Meat">Meat</div>
            <div class="activity-type-option" data-type="Vegetarian">Vegetarian</div>
            <div class="activity-type-option" data-type="Vegan">Vegan</div>
          </div>
        </div>
        
        <!-- Date Range Picker -->
        <div id="date-range-picker" class="filter-dropdown date-picker-dropdown">
          <div class="dropdown-content">
            <div class="date-picker-header">
              <h3>Select Date Range</h3>
              <button id="close-date-picker" class="close-button">×</button>
            </div>
            <div class="date-inputs">
              <div class="date-input-group">
                <label for="start-date">From</label>
                <input type="date" id="start-date" name="start-date">
              </div>
              <div class="date-input-group">
                <label for="end-date">To</label>
                <input type="date" id="end-date" name="end-date">
              </div>
            </div>
            <div class="date-filter-buttons">
              <button id="apply-date-filter" class="apply-date-btn">Apply</button>
              <button id="reset-date-filter" class="reset-date-btn">Reset</button>
            </div>
          </div>
        </div>
      </div>

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
                diet_history.diet_history_id,
                diet_history.date,
                diet_history.member_id,
                diet_history.diet_id,
                diet.diet_name,
                diet.diet_type,
                diet.preparation_min,
                diet.picture
                FROM diet_history 
                INNER JOIN diet 
                ON diet_history.diet_id = diet.diet_id
                ORDER BY diet_history.date DESC"; // connect the workout_history table and workout table

        $result = $conn->query($sql); // create a variable and store the sql query result inside it
        
        function formatDate($date) {
          if ($date == date("Y-m-d")) {
              return "Today";
          } else if ($date == date("Y-m-d", strtotime("-1 day"))) {
              return "Yesterday";
          } else {
              return date('d F Y', strtotime($date)); 
          }
        }

        while ($row = $result->fetch_assoc()) {

          $workout_date = formatDate($row['date']);

          $diet_id = $row['diet_id'];

          if ($row['member_id'] == $_SESSION['member id']) {
            $exist_record = true;
            // prints out the record
            echo "<div class=\"workout-date\">
                    <p>{$workout_date}</p>
                  </div>
                  <div class=\"workout-record\" data-diet-id=\"{$diet_id}\">
                    <img
                    class=\"picture\"
                    src=\"./uploads/diet/{$row['picture']}\"
                    alt=\"{$row['diet_name']}\"
                    />
                    <p class=\"name\">{$row['diet_name']}</p>
                    <p class=\"type\">{$row['diet_type']}</p>
                    <p class=\"time\">{$row['preparation_min']} min</p>
                  </div>";
            }
        }

        if (!$exist_record) {
          echo "
                <div class='no-record'>
                  <img src='./assets/icons/error.svg' alt='logo' class='no-record-img' />
                  <p>There is no diet meals recorded in your history</p>  
                </div>         
                ";
        }

      $conn->close();
      ?>
    </div>

    <!-- Chatbot Interface -->
    <div class="chatbot-container">
            <div class="chatbot-header">
                <div class="chatbot-header-left">
                    <img src="./assets/icons/cat-logo-tabs.png">
                    <h3>MEWAI</h3>
                </div>
                <button class="close-chat">&times;</button>
            </div>
            <div class="chatbot-transparent-top-down"></div>
            <div class="chatbot-messages"></div>
            <div class="chatbot-input">
                <input type="text" placeholder="Ask me about fitness...">
                <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
        <button class="chatbot-toggle">
            <img class="chatbot-img" src="./assets/icons/cat-logo-tabs.png">
        </button>
      </div>

      <div class="container-side-transparent-left"></div>
      <div class="container-side-transparent-right"></div>
    </div>
  </body>
  <script src="./js/navigation_bar.js"></script>
  <script src="./js/gemini_chatbot.js"></script>
  <script src="./js/darkmode.js"></script>
  <script>
  document.addEventListener("DOMContentLoaded", function () {
    // Select all workout records
    const records = document.querySelectorAll(".workout-record");

    records.forEach(record => {
      record.addEventListener("click", function () {
        const dietId = this.getAttribute("data-diet-id"); 
        if (dietId) {
          window.location.href = `subdiet_page.php?diet_id=${dietId}`;
        }
      });
    });
  });
  </script>
</html>
