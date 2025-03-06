<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Mewfit</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet"/>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css"/>
      <link rel="icon" type="image/x-icon" href="./assets/icons/cat-logo-tabs.png">
      <link rel="stylesheet" href="./css/settings_page.css" />
      <link rel="stylesheet" href="./css/gemini_chatbot.css">
      <link rel="stylesheet" href="./css/navigation_bar.css" />
    </head>
    <body>
      <div class="no-select">
        <nav class="navbar" id="navbar">
          <div class="nav-links" id="nav-links">
              <span class="workout-home"><a href="homepage.html">HOME</a></span>
              <span class="workout-navbar"><a href="workout_page.html">WORKOUT</a></span>
              <img src="./assets/icons/logo.svg" alt="logo" class="nav-logo" id="nav-logo">
              <span class="workout-dietplan"><a href="diet_page.html">DIET PLAN</a></span>
              <span class="workout-settings"><a href="#" class="active">SETTINGS</a></span>
          </div>
          <div class="header-right">
              <button id="hamburger-menu" aria-label="Menu">
                  <span></span>
                  <span></span>
                  <span></span>
              </button>
          </div>
          <img src="./assets/icons/logo.svg" alt="logo" class="nav-logo-responsive" id="nav-logo-responsive">
          <div class="profile">
              <img src="./assets/icons/Unknown_acc-removebg.png" alt="Profile" id="profile-pic">
              <div class="profile-dropdown" id="profile-dropdown">
                  <div class="profile-info">
                      <img src="./assets/icons/Unknown_acc-removebg.png" alt="unknown cat">
                      <div>
                          <h3>unknown</h3>
                          <p>unknown</p>
                      </div>
                  </div>
                  <ul>
                      <li><a href="#" class="settings-profile"><i class="fas fa-cog"></i>Settings</a></li>
                      <li>
                      <i class="fas fa-moon"></i> Dark Mode
                      <label class="switch">
                          <input type="checkbox" name="dark-mode-toggle" id="dark-mode-toggle">
                          <span class="slider round"></span>
                      </label>
                      </li>
                      <li><a href="#" class="help-center-profile"><i class="fas fa-question-circle"></i>Help </a></li>
                      <li class="logout-profile" id="logout-profile"><i class="fas fa-sign-out-alt"></i> Logout</li>
                  </ul>
              </div>
          </div>
        </nav>

        <div class="boxes-container">
          <div class="transparent-box">
            <h2>Settings</h2>
          </div>
          <button class="logout-btn" id="logout-settings">
            <i class="fa-solid fa-arrow-right-from-bracket"></i>Log Out
          </button>
        </div>

        <div class="main-container">
          <div class="left-frame">
            <div class="profile-section">
              <?php
                $servername = "localhost";
                $username = "root";
                $password = "";
                $dbname = "mewfit";
                    
                $conn = new mysqli($servername, $username, $password, $dbname);

                $member_id = "10"; // replace with session variable later

                if ($conn->connect_error) {
                  die("Connection failed: " . $conn->connect_error);
                }

                $sql = "SELECT * FROM member";
                $result = $conn->query($sql); // create a variable and store the sql query result inside it

                while ($row = $result->fetch_assoc()) {
                  if ($member_id == $row['member_id']) {
                    echo "
                      <img src=\".uploads/{$row['member_pic']}\" alt=\"Profile\" class=\"profile-photo\"/>
                      <div class=\"profile-info-settings\">
                      <h2>{$row['username']}</h2>
                      <button class=\"change-photo\">Change profile photo</button>
                      </div>
                    ";
                  }
                }

              ?>
            </div>
          </div>

          <div class="middle-frame">
            <div class="settings-group">
              <h3>Account Settings</h3>
              <ul>
                <li>
                  <a href="#" class="setting-item">
                    Update personal information
                    <span class="cheval-left">></span>
                  </a>
                </li>
                <li>
                  <label class="toggle-item">
                    Two Factor Authentication
                    <input type="checkbox" class="toggle-switch" checked />
                    <span class="slider-settings"></span>
                  </label>
                </li>
                <li>
                  <div class="setting-item">
                    <div class="danger">
                      Delete Account
                      <img src="./assets/icons/delete.png" alt="Delete" class="delete-icon"/>
                    </div>
                    <span class="cheval-left">></span>
                  </div>
                </li>
              </ul>
            </div>

            <div class="settings-group">
              <h3>Preferences</h3>
              <ul>
                <li>
                  <label class="toggle-item">
                    Dark Mode
                    <input type="checkbox" class="toggle-switch" id="settings-darkmode-toggle" />
                    <span class="slider-settings"></span>
                  </label>
                </li>
                <li>
                  <label class="toggle-item">
                    Push Notifications
                    <input type="checkbox" class="toggle-switch" checked />
                    <span class="slider-settings"></span>
                  </label>
                </li>
              </ul>
            </div>

            <div class="settings-group more-middle">
              <h3>More</h3>
              <ul>
                <li>
                  <a href="FAQ_page.html" class="setting-item">
                    FAQ
                    <span class="cheval-left">></span>
                  </a>
                </li>
                <li>
                  <a href="privacy_policy_page.html" class="setting-item">
                    Privacy Policy
                    <span class="cheval-left">></span>
                  </a>
                </li>
                <li>
                  <a href="terms_condition_page.html" class="setting-item">
                    Terms and Conditions
                    <span class="cheval-left">></span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div class="right-frame">
            <div class="settings-group">
              <h3>More</h3>
              <ul>
                <li>
                  <a href="FAQ_page.html" class="setting-item">
                    FAQ
                    <span class="cheval-left">></span>
                  </a>
                </li>
                <li>
                  <a href="privacy_policy_page.html" class="setting-item">
                    Privacy Policy
                    <span class="cheval-left">></span>
                  </a>
                </li>
                <li>
                  <a href="terms_condition_page.html" class="setting-item">
                    Terms and Conditions
                    <span class="cheval-left">></span>
                  </a>
                </li>
              </ul>
            </div>
        </div>
      </div>
    </body>
    <script src="./js/navigation_bar.js"></script>
    <script src="./js/settings_page.js"></script>
    <script src="./js/darkmode.js"></script>
    <script src="./js/gemini_chatbot.js"></script>
    <input type="file" id="avatar-upload" hidden accept="image/*">
  </html>