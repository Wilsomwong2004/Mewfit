<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mewfit</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Mogra&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet"/>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css">
        <link rel="icon" type="image/x-icon" href="./assets/icons/cat-logo-tabs.png">
        <link rel="stylesheet" href="./css/diet_page.css">
        <link rel="stylesheet" href="./css/navigation_bar.css">
        <link rel="stylesheet" href="./css/gemini_chatbot.css">
        <script src="./js/diet_page.js"></script>
        <script src="./js/navigation_bar.js"></script>
        <script src="./js/gemini_chatbot.js"></script>
    </head>
    <body>
        <div class="no-select">
            <nav class="navbar" id="navbar">
                <div class="nav-links" id="nav-links">
                    <span class="workout-home"><a href="homepage.php">HOME</a></span>
                    <span class="workout-navbar"><a href="workout_page.html" >WORKOUT</a></span>
                    <img src="./assets/icons/logo.svg" alt="logo" class="nav-logo" id="nav-logo">
                    <span class="workout-dietplan"><a href="#" class="active">DIET PLAN</a></span>
                    <span class="workout-settings"><a href="settings_page.php">SETTINGS</a></span>
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

            <main class="main-content">
                <div class="content-header">
                    <div class="content-title">
                        <h2 class="content-logo-name">MEWFIT</h2><h2 class="content-title-name">Diet Plan</h2>
                    </div>
                    <div class="search-bar">
                        <i class="fas fa-search"></i>
                        <input type="text" placeholder="Search">
                    </div>
                    <div class="search-bar-small">
                        <i class="fas fa-search"></i>
                    </div>
                </div>
            </main>

            <div class="diet-carousel">
                <div class="diet-track">
                    <div class="diet-slides"></div>
                </div>
            </div>

            <section class="diet-body">
                <h2 class="section-title"><img src="./assets/icons/icons8-lightning-64.png">Categories</h2>
                <div class="activity-types">
                    <div class="activity-card activity-card-all" id="default-selection">
                        <img src="./assets/icons/all diet.svg" alt="All">
                        <p>All</p>
                    </div>
                    <div class="activity-card activity-card-vegetarian">
                        <img src="./assets/icons/vegetarian.svg" alt="vegetarian">
                        <p>Vegetarian</p>
                    </div>
                    <div class="activity-card activity-card-vegan">
                        <img src="./assets/icons/vegan.svg" alt="Vegan">
                        <p>Vegan</p>
                    </div>
                    <div class="activity-card activity-card-meat">
                        <img src="./assets/icons/meat.svg" alt="Meat">
                        <p>Meat</p>
                    </div>
                </div>
            </section>

            <section class="diet-body">
                <h2 class="section-title"><img src="./assets/icons/icons8-heart-50.png">Top Picks For You</h2>
                <div class="diet-grid"></div>
            </section>

            <section class="diet-body">
                <h2 class="section-title"><img src="./assets/icons/icons8-time-48.png">Recent Meals</h2>
                <div class="diet-grid"></div>
            </section>

            
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

            <div class="container-side-transparent-left"></div>
            <div class="container-side-transparent-right"></div>
        </div>
    </body>
    
</html>


