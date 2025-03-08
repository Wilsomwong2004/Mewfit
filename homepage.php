<?php
session_start();  

// if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
//     header("Location: prelogin.html");
//     exit;
// }
?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>MewFit</title>
        <link rel="icon" type="image/x-icon" href="./assets/icons/cat-logo-tabs.png">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css">
        <link rel="stylesheet" href="./css/homepage.css">
        <link rel="stylesheet" href="./css/navigation_bar.css">
        <link rel="stylesheet" href="./css/gemini_chatbot.css">
    </head>
    <body>
        <div class="no-select">
            <nav class="navbar" id="navbar">
                <div class="nav-links" id="nav-links">
                    <span class="workout-home"><a href="#" class="active">HOME</a></span>
                    <span class="workout-navbar"><a href="workout_page.html">WORKOUT</a></span>
                    <img src="./assets/icons/logo.svg" alt="logo" class="nav-logo" id="nav-logo">
                    <span class="workout-dietplan"><a href="diet_page.html">DIET PLAN</a></span>
                    <span class="workout-settings"><a href="settings_page.html">SETTINGS</a></span>
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
        
            <div class="content">
                <section class="section1">
                    <div class="s1-words">
                        <h2>Hello, <span style="color:#FF946E">Ariande Grande</span></h2>
                        <p>Today is the workout time that you have long awaited for. <br>
                            Let's hit the workout time goal to get a mew mew! </p>
                        <div class="s1-icon">
                            <img src="assets/icons/calories or streak.svg" id="day-streak">
                            <p>214</p>
                            <img src="assets/icons/level.svg" id="level">
                            <p>LV. <span id="level-num">34</span></p>
                        </div>
                    </div>
                    <div id="cat-tower-section">
                        <img src="assets/icons/cat tower.svg" class="cat-tower">
                    </div>
                </section>

                <section>
                    <div class="section2-title">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><path d="M543.8 287.6c17 0 32-14 32-32.1c1-9-3-17-11-24L309.5 7c-6-5-14-7-21-7s-15 1-22 8L10 231.5c-7 7-10 15-10 24c0 18 14 32.1 32 32.1l32 0 0 160.4c0 35.3 28.7 64 64 64l320.4 0c35.5 0 64.2-28.8 64-64.3l-.7-160.2 32 0zM256 208c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 48 48 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-48 0 0 48c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-48-48 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l48 0 0-48z"/></svg>
                        <h3>Fitness Summary</h3>
                    </div>
                    <div class="section2-containers">
                        <div class="section2-each-container">
                            <div id="fitness-summary-container" style="border: 2px solid #FFCD97;">
                                <div style="display:flex;">
                                    <img src="./assets/icons/total calories.svg">
                                    <h4>Total Calories</h4>
                                    <h5>></h5>
                                </div>
                                <h6>1124 <span style="color:#515151; font-size:10px;padding-top:10px;">/3000 kcal</span></h6>
                                <p>Calories has been consumed</p>
                            </div>
                            <div id="fitness-summary-container" style="border: 2px solid #FFCBB1;">
                                <div style="display:flex;">
                                    <img src="./assets/icons/calories or streak.svg" style="width:15px;">
                                    <h4>Calories Burnt</h4>
                                    <h5>></h5>
                                </div>
                                <h6>200 <span style="color:#515151; font-size:10px;padding-top:10px;">/240 kcal</span></h6>
                                <p>Calories burnt from workout</p>
                            </div>
                        </div>
                        <div class="section2-each-container">
                            <div id="fitness-summary-container" style="border: 2px solid #9ECBF5;">
                                <div style="display:flex;">
                                    <img src="./assets/icons/workout time.svg" style="width:15px;">
                                    <h4>Workout Time</h4>
                                    <h5>></h5>
                                </div>
                                <h6>24 <span style="color:#515151; font-size:10px;padding-top:10px;">/60 min</span></h6>
                                <p>minutes for workout today</p>
                            </div>
                            <div id="fitness-summary-container" style="border: 2px solid #BBF3AA;">
                                <div style="display:flex;">
                                    <img src="./assets/icons/day streaks.svg" style="width:15px;">
                                    <h4>Day Streaks</h4>
                                    <h5>></h5>
                                </div>
                                <h6>34 <span style="color:#515151; font-size:10px;padding-top:10px;">/50 days</span></h6>
                                <p>Days of consistency</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section class="section2a">
                    <div class="box">
                        <div style="display:flex;">
                            <img src="./assets/icons/your weight.png">
                            <h4> Your Weight</h4>
                        </div>
                        <div style="display:flex; justify-content: space-evenly;">
                            <div id="chart">Oops! No Data Available. <br>Please try again later.</div>
                            <div>
                                <h5>Current Weight</h5>
                                <h6>80.00 <span style="color:#868686;font-size:15px;">kg</span></h6>
                                <div class="section2a-description">
                                    <h3>Target</h3> 
                                    <p>65.00 <span>kg</span></p>
                                </div>
                                <div class="section2a-description">
                                    <h3>Average this week</h3> 
                                    <p>65.00 <span>kg</span></p>
                                </div>
                                <div class="section2a-description">
                                    <h3>Average last week</h3> 
                                    <p>65.00 <span>kg</span></p>
                                </div>
                                <button>Record Weight</button>
                            </div>
                        </div>
                    </div>
                    <div class="box">
                        <div style="display:flex;">
                            <img src="./assets/icons/diet calories.png">
                            <h4> Diet Calories Today</h4>
                        </div>
                        <div style="display:flex;justify-content: space-evenly;">
                            <div id="chart">Oops! No Data Available. <br>Please try again later.</div>
                            <div>
                                <h5>Current Calorie Today</h5>
                                <h6>1540 <span style="color:#868686;font-size:15px;">kcal</span></h6>
                                <div class="section2a-description">
                                    <h3>Target today</h3> 
                                    <p>2100 <span>kcal</span></p>
                                </div>
                                <div class="section2a-description">
                                    <h3>Average this week</h3> 
                                    <p>10340 <span>kcal</span></p>
                                </div>
                                <div class="section2a-description">
                                    <h3>Average last week</h3> 
                                    <p>13580 <span>kcal</span></p>
                                </div>
                                <button>Record Calorie Today</button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
                
            <section>
                <div class="section3">
                    <h3 class="section2-title"><img src="https://static.thenounproject.com/png/2216254-200.png">Workout history</h3>
                    <h4>View More <span style="padding-left: 20px;">></span></h4>            
                </div>
                <div class="workout-history-grid"></div>
            </section>

            <section>
                <div class="section3">
                    <h3 class="section2-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:24px;"><path fill="#272020" d="M416 0C400 0 288 32 288 176l0 112c0 35.3 28.7 64 64 64l32 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 0-112 0-208c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7L80 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224.4c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16l0 134.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8L64 16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"/></svg>
                        Diet history</h3>
                    <h4>View More <span style="padding-left: 20px;">></span></h4>        
                </div>
                <div class="diet-history-grid"></div>
            </section>


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
    <script src="./js/navigation_bar.js"></script>
    <script src="./js/gemini_chatbot.js"></script>
    <script src="./js/homepage.js"></script>
</html>