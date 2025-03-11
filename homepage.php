<?php
session_start();
include "conn.php";

if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    header("Location: prelogin.html");
    exit;
}

$member_id = $_SESSION['member id'] ?? 1;

$sqlMember = "SELECT weight, height, target_weight, gender, age, day_streak_starting_date, last_session_date, level 
              FROM member WHERE member_id = ?";
$stmtMember = $dbConn->prepare($sqlMember);
$stmtMember->bind_param("i", $member_id);
$stmtMember->execute();
$resultMember = $stmtMember->get_result();
$member = $resultMember->fetch_assoc();

$weight = $member['weight'];
$height = $member['height'];
$target_weight = $member['target_weight'];
$gender = $member['gender'];
$age = $member['age'];
$level = $member['level'];

$today = new DateTime();
$yesterday = (clone $today)->modify('-1 day');
$last_session_date = new DateTime($member['last_session_date']);
$day_streak_starting_date = new DateTime($member['day_streak_starting_date'] ?? date('Y-m-d'));

if (
    $last_session_date->format('Y-m-d') === $today->format('Y-m-d') ||
    $last_session_date->format('Y-m-d') === $yesterday->format('Y-m-d')
) {
} else {
    $day_streak_starting_date = $today;
}

$updateSql = "UPDATE member SET day_streak_starting_date = ?, last_session_date = ? WHERE member_id = ?";
$updateStmt = $dbConn->prepare($updateSql);
$formattedToday = $today->format('Y-m-d');
$formattedStreakStart = $day_streak_starting_date->format('Y-m-d');
$updateStmt->bind_param("ssi", $formattedStreakStart, $formattedToday, $member_id);
$updateStmt->execute();

$day_streak = $day_streak_starting_date->diff($today)->days + 1;

// Fetch total calories burned from workouts today
$sqlWorkout = "SELECT SUM(w.calories) AS total_workout_burned 
               FROM workout_history wh 
               JOIN workout w ON wh.workout_id = w.workout_id
               WHERE wh.member_id = ? AND DATE(wh.date) = CURDATE()";
$stmtWorkout = $dbConn->prepare($sqlWorkout);
$stmtWorkout->bind_param("i", $member_id);
$stmtWorkout->execute();
$resultWorkout = $stmtWorkout->get_result();
$workoutData = $resultWorkout->fetch_assoc();
$total_workout_calories_burned = $workoutData['total_workout_burned'] ?? 0;

// Fetch total calories consumed from diet today
$sqlDiet = "
    SELECT SUM(total_calories) AS total_diet_calories 
    FROM (
        -- Calories from predefined diets
        SELECT SUM(n.calories) AS total_calories
        FROM diet_history dh 
        JOIN diet d ON dh.diet_id = d.diet_id
        JOIN diet_nutrition dn ON d.diet_id = dn.diet_id
        JOIN nutrition n ON dn.nutrition_id = n.nutrition_id
        WHERE dh.member_id = ? AND DATE(dh.date) = CURDATE()
        
        UNION ALL
        
        -- Calories from custom diets
        SELECT SUM(cd.calories) AS total_calories
        FROM custom_diet cd
        WHERE cd.member_id = ? AND DATE(cd.date) = CURDATE()
    ) AS combined_calories;
";

$stmtDiet = $dbConn->prepare($sqlDiet);
$stmtDiet->bind_param("ii", $member_id, $member_id); // Bind member_id twice
$stmtDiet->execute();
$resultDiet = $stmtDiet->get_result();
$dietData = $resultDiet->fetch_assoc();
$total_diet_calories = $dietData['total_diet_calories'] ?? 0;


// Fetch total workout duration
$sqlWorkoutTime = "SELECT SUM(w.duration) AS total_duration 
                   FROM workout_history wh 
                   JOIN workout w ON wh.workout_id = w.workout_id
                   WHERE wh.member_id = ? AND DATE(wh.date) = CURDATE()";
$stmtWorkoutTime = $dbConn->prepare($sqlWorkoutTime);
$stmtWorkoutTime->bind_param("i", $member_id);
$stmtWorkoutTime->execute();
$resultWorkoutTime = $stmtWorkoutTime->get_result();
$workoutTimeData = $resultWorkoutTime->fetch_assoc();
$total_workout_time = $workoutTimeData['total_duration'] ?? 0;

if (strtolower($gender) === 'male') {
    $bmr = 88.362 + (13.397 * $weight) + (4.799 * $height) - (5.677 * $age);
} else {
    $bmr = 447.593 + (9.247 * $weight) + (3.098 * $height) - (4.330 * $age);
}

$activity_level = 1.55;
$required_calories = $bmr * $activity_level;


$weight_difference = $target_weight - $weight;
$calories_per_kg = 7700;
$calories_required_monthly = $weight_difference * $calories_per_kg;

$calories_required_daily = $calories_required_monthly / 30;

$required_calories += $calories_required_daily;

// Calculate required calories to be burned through workouts daily (excluding BMR)
$required_workout_calories = max(0, $total_diet_calories - $required_calories);

$total_calories = round($total_diet_calories - $total_workout_calories_burned);
if ($total_calories <= 0) {
    $total_calories = 0;
}

// Calculate target day streak based on level
$target_day_streak = min(10 * ceil($level / 10), 50);

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["level_up"])) {
    $new_level = $level + 1;

    $new_streak_start_date = (new DateTime($day_streak_starting_date->format('Y-m-d')))
        ->modify("+$target_day_streak days")
        ->format('Y-m-d');

    $updateQuery = "UPDATE member SET level = ?, day_streak_starting_date = ? WHERE member_id = ?";
    $updateStmt = $dbConn->prepare($updateQuery);
    $updateStmt->bind_param("isi", $new_level, $new_streak_start_date, $member_id);
    $updateStmt->execute(); // Add this line to execute the update
    
    // If handling AJAX request
    if (isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
        echo json_encode(['success' => true, 'new_level' => $new_level]);
        exit;
    } else {
        // For regular form submissions
        header('Location: ' . $_SERVER['PHP_SELF']);
        exit;
    }
}
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
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="js/admin_homepage.js"></script>
    <script src="./js/navigation_bar.js"></script>
    <script src="./js/gemini_chatbot.js"></script>
    <style>
        .no-history {
            height: 250px;
            display: flex;
            flex: 1;
            justify-content: center;
            align-items: center;
            font-size: 18px;
            color: #666;
            text-align: center;
        }

        #recordWeight,
        #recordCalorie {
            width: 50%;
        }

        #recordWeight h6,
        #recordCalorie h6 {
            font-size: 18px;
            text-align: center;
            margin: 10px;
            font-weight: bold;
        }

        #recordWeight label,
        #recordCalorie label {
            font-size: 14px;
            margin: 15px;
        }

        .column {
            display: flex;
            width: 100%;
        }

        input {
            width: 70%;
            margin: 15px 0px 15px 0px;
            border: 3px solid #FFAD84;
            border-radius: 16px;
        }

        @media screen and (max-width: 935px) {

            #recordWeight h6,
            #recordCalorie h6 {
                font-size: 3.5vw;
            }

            #recordWeight label,
            #recordCalorie label {
                font-size: 3vw;
                margin: 15px;
            }

            .column {
                display: flex;
                width: 100%;
            }

            input {
                width: 70%;
                margin: 15px 0px 15px 0px;
                border: 3px solid #FFAD84;
                border-radius: 16px;
            }
        }
    </style>
</head>

<body>
    <div class="no-select">
        <nav class="navbar" id="navbar">
            <div class="nav-links" id="nav-links">
                <span class="workout-home"><a href="#" class="active">HOME</a></span>
                <span class="workout-navbar"><a href="workout_page.html">WORKOUT</a></span>
                <img src="./assets/icons/logo.svg" alt="logo" class="nav-logo" id="nav-logo">
                <span class="workout-dietplan"><a href="diet_page.html">DIET PLAN</a></span>
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
                <div>
                    <?php
                    echo "
                        <img src=\"./uploads/{$_SESSION["member pic"]}\" alt=\"Profile\" id=\"profile-pic\">
                        ";
                    ?>
                </div>

                <div class="profile-dropdown" id="profile-dropdown">
                    <div class="profile-info">
                        <?php
                        echo "
                                <img src=\"./uploads/{$_SESSION["member pic"]}\" alt=\"Profile\" id=\"profile-pic\">
                                <div>
                                    <h3>{$_SESSION["username"]}</h3>
                                    <p>unknown</p>
                                </div>
                                ";
                        ?>
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
            <!-- ---------------------------------section 1-------------------------------- -->
            <section class="section1">
                <div class="s1-words">
                    <div class="greetings" style="display:flex;">
                        <h2 id='type'>Hello, <span style='color:#FF946E'><?php echo $_SESSION['username']; ?></span></h2>
                        <h2 class='cursor'>|</h2>
                    </div>

                    <p>Today is the workout time that you have long awaited for. <br>
                        Let's hit the workout time goal to get a mew mew! </p>

                    <div class="s1-icon">
                        <img src="assets/icons/calories or streak.svg" id="day-streak">
                        <p><?php echo $day_streak; ?></p>

                        <img src="assets/icons/level.svg" id="level">
                        <p>LV. <span id="level-num"><?php echo $level; ?></span></p>
                    </div>
                </div>
                <div id="cat-tower-section">
                    <img src="assets/icons/cat tower.svg" class="cat-tower">
                </div>
            </section>

            <!-- ----------------------------------section 2------------------------------- -->
            <section>
                <div class="section2-title">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                        <path d="M543.8 287.6c17 0 32-14 32-32.1c1-9-3-17-11-24L309.5 7c-6-5-14-7-21-7s-15 1-22 8L10 231.5c-7 7-10 15-10 24c0 18 14 32.1 32 32.1l32 0 0 160.4c0 35.3 28.7 64 64 64l320.4 0c35.5 0 64.2-28.8 64-64.3l-.7-160.2 32 0zM256 208c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 48 48 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-48 0 0 48c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-48-48 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l48 0 0-48z" />
                    </svg>
                    <h3>Fitness Summary</h3>
                </div>
                <div class="section2-containers">
                    <div class="section2-each-container">
                        <div class="fitness-summary-container" style="border: 2px solid rgb(255, 226, 120);">
                            <div style="display:flex;">
                                <img src="./assets/icons/total calories.svg">
                                <h4>Total Calories</h4>
                            </div>
                            <div class="section2-value"><span class="count-up"><?php echo $total_calories ?> </span>
                                <span style="color:#515151; font-size:14px;padding-top:10px;">
                                    / <?php echo round($required_calories); ?> kcal
                                </span>
                            </div>
                            <p>Including calories burnt</p>
                        </div>

                        <!-- Second Container: Calories Burnt from Workouts -->
                        <div class="fitness-summary-container" style="border: 2px solid #FFCBB1; animation-delay: 0.5s;">
                            <div style="display:flex;">
                                <img src="./assets/icons/calories or streak.svg" style="width:15px;">
                                <h4>Calories Burnt</h4>
                            </div>
                            <div class="section2-value"><span class="count-up"><?php echo $total_workout_calories_burned; ?></span>
                                <span style="color:#515151; font-size:14px;padding-top:10px;">
                                    / <?php echo round($required_workout_calories); ?> kcal
                                </span>
                            </div>
                            <p>Calories burnt from workout</p>
                        </div>
                    </div>

                    <div class="section2-each-container">
                        <!-- Third Container: Workout Time -->
                        <div class="fitness-summary-container" style="border: 2px solid #9ECBF5; animation-delay: 1s;">
                            <div style="display:flex;">
                                <img src="./assets/icons/workout time.svg" style="width:15px;">
                                <h4>Workout Time</h4>
                            </div>
                            <div class="section2-value"><span class="count-up"><?php echo round($total_workout_time); ?></span>
                                <span style="color:#515151; font-size:14px;padding-top:10px;">/30 min</span>
                            </div>
                            <p>Recommended minutes for workout today</p>
                        </div>

                        <!-- Fourth Container: Day Streaks -->
                        <div class="fitness-summary-container" style="border: 2px solid #BBF3AA; animation-delay: 1.5s;">
                            <div style="display:flex;">
                                <img src="./assets/icons/day streaks.svg" style="width:15px;">
                                <h4>Day Streaks</h4>
                            </div>
                            <div class="section2-value"><span class="count-up"><?php echo $day_streak; ?> </span>
                                <span style="color:#515151; font-size:14px;padding-top:10px;">/<?php echo $target_day_streak; ?> days</span>
                            </div>
                            <p>Days of consistency</p>
                        </div>
                    </div>
                </div>
                <?php
                $data2 = [
                    'total_diet_calories' => $total_diet_calories,
                    'total_workout_calories_burned' => $total_workout_calories_burned,
                    'required_calories' => $required_calories,
                    'required_workout_calories' => $required_workout_calories,
                    'total_workout_time' => $total_workout_time,
                    'day_streak' => $day_streak,
                    'target_day_streak' => $target_day_streak
                ];
                ?>
                <script>
                    const phpData = <?php echo json_encode($data2); ?>;
                    document.addEventListener("DOMContentLoaded", function() {
                        const containers = document.querySelectorAll(".fitness-summary-container");

                        containers.forEach(container => {
                            const h6 = container.querySelector(".section2-value");

                            if (h6) {
                                const metric = container.querySelector("h4").textContent.trim().toLowerCase();
                                const {
                                    value,
                                    target
                                } = getMetricValues(metric);

                                // Update background color based on value and target
                                updateBackgroundColor(container, value, target);
                            }
                        });

                        function getMetricValues(metric) {
                            switch (metric) {
                                case "total calories":
                                    return {
                                        value: phpData.total_diet_calories - phpData.total_workout_calories_burned,
                                            target: phpData.required_calories
                                    };
                                case "calories burnt":
                                    return {
                                        value: phpData.total_workout_calories_burned,
                                            target: phpData.required_workout_calories
                                    };
                                case "workout time":
                                    return {
                                        value: phpData.total_workout_time,
                                            target: 30 // Hardcoded target for workout time
                                    };
                                case "day streaks":
                                    return {
                                        value: phpData.day_streak,
                                            target: phpData.target_day_streak
                                    };
                                default:
                                    return {
                                        value: 0, target: 0
                                    };
                            }
                        }

                        function updateBackgroundColor(container, value, target) {
                            if (!isNaN(value) && !isNaN(target) && value >= target) {
                                let borderColor = window.getComputedStyle(container).borderColor || "rgb(255, 226, 120)"; // Default fallback
                                container.style.backgroundColor = borderColorToRGBA(borderColor, 0.5);
                            } else {
                                container.style.backgroundColor = ""; // Reset background color
                            }
                        }

                        function borderColorToRGBA(color, opacity) {
                            let rgb = color.match(/\d+/g);
                            if (rgb && rgb.length >= 3) {
                                return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
                            }
                            return color;
                        }
                    });
                </script>
            </section>

            <!-- -----------------------------------section 2a----------------------------- -->
            <!-- chart and details -->
            <?php
            //----------------------chart 1
            $sql2 = "
                    SELECT 
                        DATE_FORMAT(weeks_date_mon, '%d %b %Y') AS period_label,  -- Format as '02 Feb 2025'
                        AVG(current_weight) AS avg_weight
                    FROM member_performance 
                    WHERE member_id = ? 
                        AND weeks_date_mon >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)  -- Limit to the past 3 months
                    GROUP BY YEAR(weeks_date_mon), WEEK(weeks_date_mon)  -- Group by year and week
                    ORDER BY weeks_date_mon ASC;
                ";

            $stmt = $dbConn->prepare($sql2);
            $stmt->bind_param("i", $member_id);
            $stmt->execute();
            $result = $stmt->get_result();

            $labels = [];
            $weights = [];
            while ($row = $result->fetch_assoc()) {
                $labels[] = $row["period_label"];
                $weights[] = $row["avg_weight"];
            }

            //chart 2
            $query = "
                    SELECT 
                        DATE_FORMAT(DATE_SUB(week_dates.week_start, INTERVAL WEEKDAY(week_dates.week_start) DAY), '%d %b %Y') AS week_start_date,  
                        AVG(week_dates.total_calories) AS average_calories
                    FROM (
                        -- Calories from predefined diets
                        SELECT dh.date AS week_start, nutr.calories AS total_calories
                        FROM diet_history dh
                        JOIN diet_nutrition dn ON dh.diet_id = dn.diet_id
                        JOIN nutrition nutr ON dn.nutrition_id = nutr.nutrition_id
                        WHERE dh.member_id = ? 
                            AND dh.date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)  

                        UNION ALL
                        
                        -- Calories from custom diets
                        SELECT cd.date AS week_start, cd.calories AS total_calories
                        FROM custom_diet cd
                        WHERE cd.member_id = ? 
                            AND cd.date >= DATE_SUB(CURDATE(), INTERVAL 3 MONTH)
                    ) AS week_dates
                    GROUP BY YEAR(week_dates.week_start), WEEK(week_dates.week_start)
                    ORDER BY week_dates.week_start ASC;
                ";

            $stmt = $dbConn->prepare($query);
            $stmt->bind_param("ii", $member_id, $member_id);
            $stmt->execute();
            $result = $stmt->get_result();

            $nutritionData = [];
            while ($row = $result->fetch_assoc()) {
                $nutritionData[] = $row;
            }

            //-------------------------label for chart 1
            // target weight
            $sql_target = "SELECT weight, weight_registered_date, target_weight FROM member WHERE member_id = $member_id";
            $result_target = $dbConn->query($sql_target);
            $target_weight = 0;
            $registered_weight = 0;
            $weight_registered_date = "";

            if ($result_target->num_rows > 0) {
                while ($row_target = $result_target->fetch_assoc()) {
                    $target_weight = $row_target['target_weight'];
                    $registered_weight = $row_target['weight'];
                    $weight_registered_date = $row_target['weight_registered_date'];
                }
            }

            // Fetch current week's weight
            $current_date = date('Y-m-d');
            $current_day_of_week = date('w', strtotime($current_date));
            $current_day_of_week = ($current_day_of_week == 0) ? 7 : $current_day_of_week;
            $start_of_current_week = date('Y-m-d', strtotime($current_date . ' -' . ($current_day_of_week - 1) . ' days'));
            $end_of_current_week = date('Y-m-d', strtotime($start_of_current_week . ' +6 days'));

            $sql_current = "SELECT current_weight FROM member_performance 
                                WHERE member_id = $member_id 
                                AND weeks_date_mon BETWEEN '$start_of_current_week' AND '$end_of_current_week' 
                                ORDER BY weeks_date_mon DESC LIMIT 1";
            $result_current = $dbConn->query($sql_current);
            $current_weight = "-";

            if ($result_current->num_rows > 0) {
                $row_current = $result_current->fetch_assoc();
                $current_weight = $row_current['current_weight'];
            }

            // Fetch last week's weight
            $start_of_last_week = date('Y-m-d', strtotime($start_of_current_week . ' -7 days'));
            $end_of_last_week = date('Y-m-d', strtotime($start_of_last_week . ' +6 days'));
            $sql_last_week = "SELECT current_weight FROM member_performance 
                                WHERE member_id = $member_id 
                                AND weeks_date_mon BETWEEN '$start_of_last_week' AND '$end_of_last_week' 
                                ORDER BY weeks_date_mon DESC LIMIT 1";
            $result_last_week = $dbConn->query($sql_last_week);
            $last_week_weight = "-";

            if ($result_last_week->num_rows > 0) {
                $row_last_week = $result_last_week->fetch_assoc();
                $last_week_weight = $row_last_week['current_weight'];
            }

            //if no current weight
            $latest_weight_query = "
                    SELECT current_weight, weeks_date_mon 
                    FROM member_performance 
                    WHERE member_id = ? 
                    ORDER BY weeks_date_mon DESC 
                    LIMIT 1
                ";

            $latest_stmt = $dbConn->prepare($latest_weight_query);
            if ($latest_stmt) {
                $latest_stmt->bind_param("i", $member_id);
                $latest_stmt->execute();
                $latest_result = $latest_stmt->get_result();

                if ($latest_result->num_rows > 0) {
                    $latest_record = $latest_result->fetch_assoc();
                    $last_performance_weight = $latest_record['current_weight'];
                    $last_performance_date = $latest_record['weeks_date_mon'];
                } else {
                    $last_performance_weight = "-";
                    $last_performance_date = null;
                }
                $latest_stmt->close();
            } else {
                $last_performance_weight = "-";
                $last_performance_date = null;
            }

            // Get the registered weight and date from member table
            $member_query = "
                    SELECT weight, weight_registered_date 
                    FROM member 
                    WHERE member_id = ?
                ";

            $member_stmt = $dbConn->prepare($member_query);
            if ($member_stmt) {
                $member_stmt->bind_param("i", $member_id);
                $member_stmt->execute();
                $member_result = $member_stmt->get_result();

                if ($member_result->num_rows > 0) {
                    $member_record = $member_result->fetch_assoc();
                    $registered_weight = $member_record['weight'];
                    $registered_date = $member_record['weight_registered_date'];
                } else {
                    $registered_weight = "-";
                    $registered_date = null;
                }
                $member_stmt->close();
            } else {
                $registered_weight = "-";
                $registered_date = null;
            }


            if ($last_performance_date === null && $registered_date === null) {
                $last_weight = "-";
            } else if ($last_performance_date === null) {
                $last_weight = $registered_weight;
            } else if ($registered_date === null) {
                $last_weight = $last_performance_weight;
            } else {
                if (strtotime($last_performance_date) >= strtotime($registered_date)) {
                    $last_weight = $last_performance_weight;
                } else {
                    $last_weight = $registered_weight;
                }
            }

            if ($current_weight == "-") {
                $current_weight = $last_weight;
            }

            // weekly target to hit goal
            $weekly_target = "-";
            if ($weight_registered_date != "") {
                $registration_timestamp = strtotime($weight_registered_date);
                $current_timestamp = strtotime($current_date);
                $weeks_since_registration = floor(($current_timestamp - $registration_timestamp) / (7 * 24 * 60 * 60));

                $total_weeks_for_target = 4;
                $weeks_remaining = max(0, $total_weeks_for_target - $weeks_since_registration);

                if ($target_weight != 0 && $last_weight != "-" && is_numeric($last_weight)) {
                    if ($weeks_remaining <= 1) {
                        $weekly_target = $target_weight;
                    } else {
                        $remaining_weight_to_lose = floatval($last_weight) - floatval($target_weight);
                        $weekly_weight_loss = $remaining_weight_to_lose / $weeks_remaining;
                        $weekly_target = floatval($last_weight) - $weekly_weight_loss;
                    }
                }
            }

            if ($current_weight != "-") {
                $current_weight = floatval($current_weight);
            }

            if ($last_week_weight != "-") {
                $last_week_weight = floatval($last_week_weight);
            }

            if ($weekly_target != "-") {
                $weekly_target = number_format(floatval($weekly_target), 2);
            }

            //-------------------------label for chart 2

            $queryToday = "
                    SELECT SUM(total_calories) AS total_calories_today
                    FROM (
                        -- Calories from predefined diets
                        SELECT SUM(nutr.calories) AS total_calories
                        FROM diet_history dh
                        JOIN diet_nutrition dn ON dh.diet_id = dn.diet_id
                        JOIN nutrition nutr ON dn.nutrition_id = nutr.nutrition_id
                        WHERE dh.member_id = ? AND DATE(dh.date) = CURDATE()
                        
                        UNION ALL
                        
                        -- Calories from custom diets
                        SELECT SUM(cd.calories) AS total_calories
                        FROM custom_diet cd
                        WHERE cd.member_id = ? AND DATE(cd.date) = CURDATE()
                    ) AS combined_calories;
                ";

            // Prepare and execute the statement
            $stmt = $dbConn->prepare($queryToday);
            if ($stmt) {
                // Bind member_id twice for both placeholders
                $stmt->bind_param("ii", $member_id, $member_id);

                $stmt->execute();
                $stmt->bind_result($totalCaloriesToday);
                $stmt->fetch();
                $stmt->close();
            }

            // average calories for this week
            $queryThisWeek = "
                    SELECT AVG(total_calories) AS avg_calories_this_week
                    FROM (
                        -- Calories from predefined diets
                        SELECT nutr.calories AS total_calories
                        FROM diet_history dh
                        JOIN diet_nutrition dn ON dh.diet_id = dn.diet_id
                        JOIN nutrition nutr ON dn.nutrition_id = nutr.nutrition_id
                        WHERE dh.member_id = ? AND dh.date BETWEEN ? AND ?
                        
                        UNION ALL
                        
                        -- Calories from custom diets
                        SELECT cd.calories AS total_calories
                        FROM custom_diet cd
                        WHERE cd.member_id = ? AND cd.date BETWEEN ? AND ?
                    ) AS combined_calories;
                ";

            $stmt = $dbConn->prepare($queryThisWeek);
            if ($stmt) {
                $stmt->bind_param("ississ", $member_id, $start_of_current_week, $end_of_current_week, $member_id, $start_of_current_week, $end_of_current_week);
                $stmt->execute();
                $stmt->bind_result($avgCaloriesThisWeek);
                $stmt->fetch();
                $stmt->close();
            }

            // Average calories for last week (including custom_diet)
            $queryLastWeek = "
                    SELECT AVG(total_calories) AS avg_calories_last_week
                    FROM (
                        -- Calories from predefined diets
                        SELECT nutr.calories AS total_calories
                        FROM diet_history dh
                        JOIN diet_nutrition dn ON dh.diet_id = dn.diet_id
                        JOIN nutrition nutr ON dn.nutrition_id = nutr.nutrition_id
                        WHERE dh.member_id = ? AND dh.date BETWEEN ? AND ?
                        
                        UNION ALL
                        
                        -- Calories from custom diets
                        SELECT cd.calories AS total_calories
                        FROM custom_diet cd
                        WHERE cd.member_id = ? AND cd.date BETWEEN ? AND ?
                    ) AS combined_calories;
                ";

            $stmt = $dbConn->prepare($queryLastWeek);
            if ($stmt) {
                $stmt->bind_param("ississ", $member_id, $start_of_last_week, $end_of_last_week, $member_id, $start_of_last_week, $end_of_last_week);
                $stmt->execute();
                $stmt->bind_result($avgCaloriesLastWeek);
                $stmt->fetch();
                $stmt->close();
            }

            $required_calories = round($required_calories);
            $avgCaloriesThisWeek = round($avgCaloriesThisWeek);
            $avgCaloriesLastWeek = round($avgCaloriesLastWeek);

            $totalCaloriesToday = ($totalCaloriesToday === NULL || $totalCaloriesToday == 0) ? "-" : $totalCaloriesToday;
            $avgCaloriesThisWeek = ($avgCaloriesThisWeek === NULL || $avgCaloriesThisWeek == 0) ? "-" : $avgCaloriesThisWeek;
            $avgCaloriesLastWeek = ($avgCaloriesLastWeek === NULL || $avgCaloriesLastWeek == 0) ? "-" : $avgCaloriesLastWeek;
            ?>
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    const labels = <?php echo json_encode($labels); ?>;
                    const weights = <?php echo json_encode($weights); ?>;
                    const nutritionData = <?php echo json_encode($nutritionData); ?>;

                    const weightChart = document.getElementById("weightChart");
                    const dietChart = document.getElementById("dietChart");
                    const noChart1 = document.querySelector(".no-chart1");
                    const noChart2 = document.querySelector(".no-chart2");

                    if (labels.length > 0 && weights.length > 0) {
                        weightChart.style.display = "block";
                        noChart1.style.display = "none";

                        const ctx = weightChart.getContext("2d");
                        new Chart(ctx, {
                            type: "bar",
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: "Weight (kg)",
                                    data: weights,
                                    backgroundColor: createGradient(ctx),
                                    borderColor: "#FFAD84",
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                        min: Math.min(...weights) - 5,
                                        title: {
                                            display: true,
                                            text: "Weight Progress (kg)"
                                        }
                                    },
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Date"
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        weightChart.style.display = "none";
                        noChart1.style.display = "block";
                    }

                    if (nutritionData && nutritionData.length > 0) {
                        dietChart.style.display = "block";
                        noChart2.style.display = "none";

                        const ctxDiet = dietChart.getContext("2d");

                        const labels = nutritionData.map(item => item.week_start_date);
                        const avgCaloriesArray = nutritionData.map(item => item.average_calories);

                        new Chart(ctxDiet, {
                            type: "bar",
                            data: {
                                labels: labels,
                                datasets: [{
                                    label: "Average Calories (kcal)",
                                    data: avgCaloriesArray,
                                    backgroundColor: createGradient(ctxDiet),
                                    borderColor: "#FFAD84",
                                    borderWidth: 1
                                }]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    y: {
                                        beginAtZero: false,
                                        min: Math.min(...avgCaloriesArray) - 500, // Adjust minimum value for better scaling
                                        title: {
                                            display: true,
                                            text: "Diet Progress (kcal)"
                                        }
                                    },
                                    x: {
                                        title: {
                                            display: true,
                                            text: "Date"
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        dietChart.style.display = "none";
                        noChart2.style.display = "block";
                    }

                    function createGradient(ctx) {
                        const gradient = ctx.createLinearGradient(0, 0, 0, 120);
                        gradient.addColorStop(0.5, "#FFAD84");
                        gradient.addColorStop(1, "rgb(255, 233, 212)");
                        return gradient;
                    }
                });
            </script>

            <!-- enter data -->
            <?php

$sqlMember = "SELECT weight, target_weight, fitness_goal FROM member WHERE member_id = ?";
$stmtMember = $dbConn->prepare($sqlMember);
$stmtMember->bind_param("i", $member_id);
$stmtMember->execute();
$resultMember = $stmtMember->get_result();
$member = $resultMember->fetch_assoc();

$weight = $member['weight'];
$target_weight = $member['target_weight'];
$fitness_goal = $member['fitness_goal'];

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["newweight"])) {
    $newWeight = floatval($_POST['newweight']); 
    $currentWeekMonday = date('Y-m-d', strtotime('monday this week'));

    // Check if an entry for the current week exists
    $sql = "SELECT * FROM member_performance WHERE weeks_date_mon = ? AND member_id = ?";
    $stmt = $dbConn->prepare($sql);
    $stmt->bind_param("si", $currentWeekMonday, $member_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $sql = "UPDATE member_performance SET current_weight = ? WHERE weeks_date_mon = ? AND member_id = ?";
    } else {
        $sql = "INSERT INTO member_performance (performance_id, weeks_date_mon, current_weight, member_id) VALUES (NULL, ?, ?, ?)";
    }

    $stmt = $dbConn->prepare($sql);
    $stmt->bind_param("dsi", $newWeight, $currentWeekMonday, $member_id);

    if ($stmt->execute()) {
        if ($newWeight <= $target_weight) {
            echo json_encode(["status" => "success", "message" => "Weight recorded successfully!", "updateTarget" => true]);
        } else {
            echo json_encode(["status" => "success", "message" => "Weight recorded successfully!", "updateTarget" => false]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Error: " . $dbConn->error]);
    }
    exit();
}

// Handle target weight & fitness goal update
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["new_target_weight"]) && isset($_POST["new_fitness_goal"])) {
    $newTargetWeight = floatval($_POST["new_target_weight"]);
    $newFitnessGoal = $_POST["new_fitness_goal"];
    
    // Basic validation
    if ($newTargetWeight <= 0 || empty($newFitnessGoal)) {
        echo json_encode(["status" => "error", "message" => "Invalid weight or goal."]);
        exit();
    }
    
    $weightRegisteredDate = date('Y-m-d');
    $sqlUpdateTarget = "UPDATE member SET weight = ?,target_weight = ?, fitness_goal = ?, weight_registered_date = ? WHERE member_id = ?";
    $stmtUpdate = $dbConn->prepare($sqlUpdateTarget);
    $stmtUpdate->bind_param("ddssi",$current_weight, $newTargetWeight, $newFitnessGoal, $weightRegisteredDate, $member_id);
    
    if ($stmtUpdate->execute()) {
        echo json_encode(["status" => "success", "message" => "Target weight and fitness goal updated successfully!"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update target weight: " . $dbConn->error]);
    }
    exit();
}

            //enter calories
            $message = "";

            if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST["meal_name"]) && isset($_POST["calorie"])) {
                $meal_name = trim($_POST["meal_name"]);
                $calorie = floatval($_POST["calorie"]);
                $date = date("Y-m-d");

                if (!empty($meal_name) && $calorie > 0) {
                    $query = "
                            INSERT INTO custom_diet (date, custom_diet_name, calories, member_id)
                            VALUES (?, ?, ?, ?)
                        ";
                    $stmt = $dbConn->prepare($query);
                    if ($stmt) {
                        $stmt->bind_param("ssdi", $date, $meal_name, $calorie, $member_id);
                        if ($stmt->execute()) {
                            $message = "Custom meal recorded successfully!";
                        } else {
                            $message = "Error recording custom meal: " . $stmt->error;
                        }
                        $stmt->close();
                    } else {
                        $message = "Prepare failed: " . $dbConn->error;
                    }
                } else {
                    $message = "Invalid input! Please provide a valid meal name and calorie value.";
                }
            }
            ?>
            <script>
                function recordWeight() {
                    document.getElementById("displayWeight").style.display = "none";
                    document.getElementById("recordWeight").style.display = "block";
                }

                function goBackWeight() {
                    document.getElementById("recordWeight").style.display = "none";
                    document.getElementById("displayWeight").style.display = "block";
                }

                function recordWeightDone() {
                    const newweight = document.getElementById("newweight").value;

                    if (newweight !== "" && newweight > 0) {
                        const formData = new FormData();
                        formData.append("newweight", newweight);

                        fetch(window.location.href, {
                                method: "POST",
                                body: formData
                            })
                            .then(response => response.text())
                            .then(data => {
                                alert("New weight recorded!");
                                goBackWeight();
                                location.reload();
                            })
                            .catch(error => {
                                console.error("Error:", error);
                            });
                    } else {
                        alert("Please enter a valid weight!");
                    }
                }

                function recordCalorie() {
                    document.getElementById("displayCalorie").style.display = "none";
                    document.getElementById("recordCalorie").style.display = "block";
                }

                function goBackCalorie() {
                    document.getElementById("recordCalorie").style.display = "none";
                    document.getElementById("displayCalorie").style.display = "block";
                }

                function recordCalorieDone() {
                    const mealName = document.getElementById("meal_name").value;
                    const calorie = document.getElementById("calorie").value;

                    if (mealName.trim() !== "" && calorie > 0) {
                        const formData = new FormData();
                        formData.append("meal_name", mealName);
                        formData.append("calorie", calorie);

                        fetch(window.location.href, {
                                method: "POST",
                                body: formData
                            })
                            .then(response => response.text())
                            .then(data => {
                                alert("Meal recorded!");
                                document.getElementById("recordCalorie").style.display = "none";
                                document.getElementById("displayCalorie").style.display = "block";
                                location.reload();
                            })
                            .catch(error => {
                                console.error("Error:", error);
                            });
                    } else {
                        alert("Please enter a valid meal name and calorie value!");
                    }
                }
            </script>

            <!-- level up or reenter weight -->
            <script>
                document.addEventListener("DOMContentLoaded", function() {
                    //enter day streak
                let dayStreak = <?php echo $day_streak; ?>;
                let targetDayStreak = <?php echo $target_day_streak; ?>;

                if (dayStreak >= targetDayStreak) {
                    if (confirm("🎉 Congratulations! You've reached your streak goal. Do you want to level up?")) {
                        let form = document.createElement('form');
                        form.method = 'POST';
                        form.action = window.location.href;
                        
                        let input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = 'level_up';
                        input.value = 'true';
                        
                        form.appendChild(input);
                        document.body.appendChild(form);
                        form.submit();
                    }
                }

                //enter weight
                document.getElementById("weightForm").addEventListener("submit", function(event) {
    event.preventDefault();

    let newWeight = document.getElementById("new_target_weight").value;
    let newFitnessGoal = document.getElementById("new_fitness_goal").value;

    updateTargetWeight(newWeight, newFitnessGoal);
});

function updateTargetWeight(newTargetWeight, newFitnessGoal) {
    fetch("", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "new_target_weight=" + newTargetWeight + "&new_fitness_goal=" + encodeURIComponent(newFitnessGoal)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        if (data.status === "success") {
            location.reload();
        }
    })
    .catch(error => console.error("Error:", error));
}
            });
            </script>

            <section class="section2a">
                <div class="box" style="animation-delay:2s;">
                    <div style="display:flex;">
                        <img src="./assets/icons/your weight.png">
                        <h4> Your Weight</h4>
                    </div>
                    <div style="display:flex; justify-content: space-evenly;">
                        <div id="chart">
                            <p class="no-chart1">Oops! No Data Available. <br>Please try again later.</p>
                            <canvas id="weightChart"></canvas>
                        </div>

                        <div id="displayWeight">
                            <h5>Current Weight</h5>
                            <h6 id="currentWeight"><?= $current_weight ?> <span style="color:#868686;font-size:15px;">kg</span></h6>

                            <div class="section2a-description">
                                <h3>Overall Target</h3>
                                <p class="data-details" id="overallTarget"><?= $target_weight ?> <span>kg</span></p>
                            </div>

                            <div class="section2a-description">
                                <h3>Target This Week</h3>
                                <p class="data-details" id="targetThisWeek"> <?= $weekly_target ?><span> kg</span></p>
                            </div>

                            <div class="section2a-description">
                                <h3>Average Last Week</h3>
                                <p class="data-details" id="averageLastWeek"><?= $last_week_weight ?> <span>kg</span></p>
                            </div>

                            <button onclick="recordWeight()">Record Weight</button>
                        </div>
                        <div id="recordWeight" style="display: none;">
                            <span style="color:#868686" onclick="goBackWeight()">
                                < Back</span>
                                    <div>
                                        <h6>Record New Weight</h6>
                                        <label>Current: <span><?= $current_weight ?></span></label>
                                        <div class="column">
                                            <label>New:</label>
                                            <input type="number" id="newweight" name="newweight" required step="0.01">
                                        </div>
                                    </div>
                                    <button onclick="recordWeightDone()">Record Weight</button>
                        </div>
                    </div>
                </div>
                <div class="box" style="animation-delay:2.5s;">
                    <div style="display:flex;">
                        <img src="./assets/icons/diet calories.png">
                        <h4> Diet Calories Today</h4>
                    </div>
                    <div style="display:flex;justify-content: space-evenly;">
                        <div id="chart">
                            <p class="no-chart2">Oops! No Data Available. <br>Please try again later.</p>
                            <canvas id="dietChart"></canvas>
                        </div>
                        <div id="displayCalorie">
                            <h5>Current Calorie Today</h5>
                            <h6><?= $totalCaloriesToday ?><span style="color:#868686;font-size:15px;"> kcal</span></h6>
                            <div class="section2a-description">
                                <h3>Target today</h3>
                                <p class="data-details"><?php echo $required_calories; ?><span> kcal</span></p>
                            </div>
                            <div class="section2a-description">
                                <h3>Average this week</h3>
                                <p class="data-details"><?php echo $avgCaloriesThisWeek ?><span> kcal</span></p>
                            </div>
                            <div class="section2a-description">
                                <h3>Average last week</h3>
                                <p class="data-details"><?php echo $avgCaloriesLastWeek ?><span> kcal</span></p>
                            </div>
                            <button onclick="recordCalorie()">Record Calorie Today</button>
                        </div>
                        <div id="recordCalorie" style="display: none;">
                            <span style="color:#868686" onclick="goBackCalorie()">
                                < Back</span>
                                    <div>
                                        <h6>New Custom Meal</h6>
                                        <div class="column">
                                            <label>Name:</label>
                                            <input type="text" id="meal_name" name="meal_name" required>
                                        </div>
                                        <div class="column">
                                            <label>Calorie:</label>
                                            <input type="number" id="calorie" name="calorie" required>
                                        </div>
                                    </div>
                                    <button onclick="recordCalorieDone()">Record Weight</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <div class="pop-up">
            <form id="weightForm">
                <label for="new_target_weight">Enter Your New Weight:</label>
                <input type="number" step="0.1" id="new_target_weight" name="new_target_weight" required>
                <label for="new_fitness_goal">Choose your fitness goal:</label>
                <select id="new_fitness_goal" name="new_fitness_goal" required>
                    <option value="">Select Goal</option>
                    <option value="Lose Weight">Lose Weight</option>
                    <option value="Gain Muscle">Gain Muscle</option>
                </select>
                <button type="submit">Submit</button>
            </form>
        </div>

        <section>
            <div class="section3">
                <h3 class="section2-title"><img src="https://static.thenounproject.com/png/2216254-200.png">Workout history</h3>
                <h4>
                    <a href="workout_history_page.php" style="text-decoration: none; color: inherit;">
                        View More <span style="padding-left: 20px;">></span>
                    </a>
                </h4>
            </div>
            <div class="workout-history-grid"></div>
        </section>

        <section>
            <div class="section3">
                <h3 class="section2-title"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" style="width:24px;">
                        <path fill="#272020" d="M416 0C400 0 288 32 288 176l0 112c0 35.3 28.7 64 64 64l32 0 0 128c0 17.7 14.3 32 32 32s32-14.3 32-32l0-128 0-112 0-208c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7L80 480c0 17.7 14.3 32 32 32s32-14.3 32-32l0-224.4c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16l0 134.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8L64 16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z" />
                    </svg>
                    Diet history</h3>
                <h4>
                    <a href="diet_history_page.php" style="text-decoration: none; color: inherit;">
                        View More <span style="padding-left: 20px;">></span>
                    </a>
                </h4>
            </div>
            <div class="diet-history-grid"></div>
        </section>

        <?php
        $sql = "
                SELECT w.*
                FROM workout_history wh
                JOIN workout w ON wh.workout_id = w.workout_id
                WHERE wh.member_id = ?
                ORDER BY wh.date DESC
                LIMIT 6
            ";

        $stmt = $dbConn->prepare($sql);
        $stmt->bind_param("i", $member_id); 
        $stmt->execute();
        $result = $stmt->get_result();

        $workouts = [];
        while ($row = $result->fetch_assoc()) {
            $workouts[] = $row;
        }

        // Fetch the latest 6 diets and sum the calories from the nutrition table
        $sql = "SELECT diet_id, diet_name, difficulty, preparation_min, total_calories, diet_type, date
                    FROM (
                        SELECT d.diet_id, d.diet_name, d.difficulty, d.preparation_min, SUM(n.calories) AS total_calories, 'standard' AS diet_type, dh.date
                        FROM diet_history dh
                        JOIN diet d ON dh.diet_id = d.diet_id
                        LEFT JOIN diet_nutrition dn ON dn.diet_id = d.diet_id
                        LEFT JOIN nutrition n ON n.nutrition_id = dn.nutrition_id
                        WHERE dh.member_id = ?
                        GROUP BY d.diet_id, dh.date
                        
                        UNION ALL
                        
                        -- Fetch custom diets
                        SELECT cd.custom_diet_id AS diet_id, cd.custom_diet_name AS diet_name, NULL AS difficulty, NULL AS preparation_min, cd.calories AS total_calories, 'custom' AS diet_type, cd.date
                        FROM custom_diet cd
                        WHERE cd.member_id = ?
                    ) AS combined_diets
                    ORDER BY date DESC
                    LIMIT 6";

        $stmt = $dbConn->prepare($sql);
        $stmt->bind_param("ii", $member_id, $member_id);
        $stmt->execute();
        $result = $stmt->get_result();

        $diets = [];
        while ($row = $result->fetch_assoc()) {
            $diets[] = $row;
        }

        // Combine both datasets into a single array
        $response = [
            'workouts' => !empty($workouts) ? $workouts : ['no_data' => true],
            'diets' => !empty($diets) ? $diets : ['no_data' => true]
        ];

        json_encode($response);

        ?>

        <script>
            const response = <?php echo json_encode($response); ?>;

            const createCard = (item, type) => {
                const imageSrc = item.image || './assets/icons/error.svg';

                if (type === 'workout') {
                    return `
                            <div class="workout-card-content">
                                <div>
                                    <img src="${imageSrc}" alt="${item.workout_name}" class="workout-image">
                                </div>
                                <div class="workout-info">
                                    <h3 class="workout-title">${item.workout_name}</h3>
                                    <span class="workout-level">${item.difficulty || ''}</span>
                                    <div class="workout-stats">
                                        <span><i class="fas fa-clock"></i> ${item.duration || ''}</span>
                                        <span><i class="fas fa-fire"></i> ${item.calories || 0}</span>
                                    </div>
                                </div>
                            </div>
                        `;
                } else if (type === 'diet') {
                    return `
                            <div class="diet-card-content">
                                <div >
                                    <img src="${imageSrc}" alt="${item.diet_name}" class="diet-image">
                                </div>
                                <div class="diet-info">
                                    <h3 class="diet-title">${item.diet_name}</h3>
                                    <span class="diet-level">${item.diet_type === 'standard' ? item.difficulty || '' : 'Custom'}</span>
                                    <div class="diet-stats">
                                        <span><i class="fas fa-clock"></i> ${item.diet_type === 'standard' ? item.preparation_min || '' : '-'}</span>
                                        <span><i class="fas fa-fire"></i> ${item.total_calories || 0} kcal</span>
                                    </div>
                                </div>
                            </div>
                        `;
                }
            };

            // Assuming workout-history-grid and diet-history-grid are present in the HTML
            const workoutGrid = document.querySelector('.workout-history-grid');
            const dietGrid = document.querySelector('.diet-history-grid');

            // Check if the workouts and diets have data
            if (response.workouts && !response.workouts.no_data) {
                workoutGrid.innerHTML = response.workouts.map(workout => createCard(workout, 'workout')).join('');
            } else {
                workoutGrid.innerHTML = '<div class="no-history">No workout available.</div>';
            }

            if (response.diets && !response.diets.no_data) {
                dietGrid.innerHTML = response.diets.map(diet => createCard(diet, 'diet')).join('');
            } else {
                dietGrid.innerHTML = '<div class="no-history">No diet available.</div>';
            }
        </script>


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
<!-- -------cat tower------- -->
<script>
    // ------------------Cat Tower Stuff-----------------------------
// Create new cat elements
let userLevel = parseInt(document.getElementById("level-num")?.textContent, 10) || 1;

const maxLevel = 50;
const catsPerLevel = 9;
const catDesigns = [
    './assets/icons/lvl 1 cat.svg',
    './assets/icons/lvl 2 cat.svg',
    './assets/icons/lvl 3 cat.svg',
    './assets/icons/lvl 4 cat.svg',
    './assets/icons/lvl 5 cat.svg',
];

function updateCats() {
    const container = document.getElementById('cat-tower-section');

    let numCats = Math.min(userLevel, catsPerLevel); //to make sure the max num of cats is 9

    let currentDesignIndex = Math.floor(userLevel / 10);
    let prevDesignIndex = Math.max(0, currentDesignIndex - 1);

    let newDesignCount = userLevel % 10;
    if (newDesignCount === 0 && userLevel > 0) {
        newDesignCount = 1;
    }

    let oldDesignCount = catsPerLevel - newDesignCount;

    for (let i = 0; i < numCats; i++) {
        const newCat = document.createElement('img');
        newCat.className = 'cat';

        if (i < oldDesignCount) {
            newCat.src = catDesigns[prevDesignIndex];
        } else {
            newCat.src = catDesigns[currentDesignIndex];
        }

        // Random position inside container
        const randomX = Math.random() * (container.clientWidth - 50);
        const randomY = Math.random() * (container.clientHeight - 50);
        newCat.style.left = `${randomX}px`;
        newCat.style.top = `${randomY}px`;

        container.appendChild(newCat);
    }

    attachSpeechBubbles();
    move();
}

// speech bubbles
function attachSpeechBubbles() {
    const cats = document.querySelectorAll('.cat');

    cats.forEach(cat => {
        cat.addEventListener('mouseover', (event) => {
            const speech = document.createElement('div');
            speech.className = 'speech-bubble';
            speech.textContent = getRandomSpeech();

            document.body.appendChild(speech);

            // Position the speech bubble above the cat
            const catRect = cat.getBoundingClientRect();
            speech.style.left = `${catRect.left + catRect.width / 2}px`;
            speech.style.top = `${catRect.top - 30}px`;

            setTimeout(() => {
                speech.remove();
            }, 1500);
        });

        cat.addEventListener('mouseout', () => {
            removeSpeechBubble();
        });

        cat.addEventListener('mousedown', () => {
            removeSpeechBubble();
        });
    });
}

function removeSpeechBubble() {
    const existingBubble = document.querySelector('.speech-bubble');
    if (existingBubble) {
        existingBubble.remove();
    }
}

const speechTexts = [
    "Meow!",
    "cHonKy",
    "Leg day bro",
    "Feed me!",
    "Let's play!",
    "Nappy naps",
    "What's up dude?",
    "I'm watching you"
];

function getRandomSpeech() {
    const randomIndex = Math.floor(Math.random() * speechTexts.length);
    return speechTexts[randomIndex];
}

// moving any cat
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;
let selectedElement = null;

const move = function () {
    const elements = document.querySelectorAll('.cat');
    const container = document.getElementById('cat-tower-section');

    elements.forEach(element => {
        element.addEventListener('mousedown', dragStart);
    });

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    function dragStart(e) {
        selectedElement = e.target;
        const rect = selectedElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        initialX = e.clientX - rect.left;
        initialY = e.clientY - rect.top;

        currentX = rect.left - containerRect.left;
        currentY = rect.top - containerRect.top;

        isDragging = true;
    }

    function drag(e) {
        if (!isDragging || !selectedElement) return;

        e.preventDefault();

        const containerRect = container.getBoundingClientRect();

        // Calculate the new position
        let newX = e.clientX - containerRect.left - initialX;
        let newY = e.clientY - containerRect.top - initialY;

        // Apply boundaries
        const maxX = containerRect.width - selectedElement.offsetWidth;
        const maxY = containerRect.height - selectedElement.offsetHeight;

        newX = Math.min(Math.max(0, newX), maxX);
        newY = Math.min(Math.max(0, newY), maxY);

        selectedElement.style.left = `${newX}px`;
        selectedElement.style.top = `${newY}px`;

        currentX = newX;
        currentY = newY;
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        selectedElement = null;
    }
};

window.onload = function () {
    updateCats();
};
</script>