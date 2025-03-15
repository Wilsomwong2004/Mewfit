<?php
// Read the JSON file
$jsonFile = file_get_contents('./exercises.json');

// Parse JSON to PHP array
$exercises = json_decode($jsonFile, true);

// If your JSON structure is slightly different and exercises are inside another key,
// you might need to access them like this instead:
// $exercises = json_decode($jsonFile, true)['exercises'];

// Now $exercises contains your exercise data for use in your form
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workout Management</title>
    <link rel="stylesheet" href="./css/admin_workout.css">
    <link rel="stylesheet" href="./css/navigation_bar.css">
    <style>
        #logout-profile{
            width:32px;
            margin-right: 3vw;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <nav class="navbar" id="navbar">
        <div class="nav-links" id="nav-links">
            <img src="./assets/icons/mewfit-admin-logo.svg" alt="logo" class="nav-logo" id="nav-logo">
            <span class="admin-dashboard"><a href="admin_homepage.php">DASHBOARD</a></span>
            <span class="admin-user"><a href="admin_user_page.php" >USER</a></span>
            <span class="admin-workout"><a href="#" class="active">WORKOUT</a></span>
            <span class="admin-meals"><a href="admin_diet.php" >MEALS</a></span>
        </div>
        <div class="header-right">
            <button id="hamburger-menu" aria-label="Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
        <image src="./assets/icons/admin_logout.svg" id="logout-profile"></image>
    </nav>

    <div class="container">
        <!-- Workout Table -->
        <div class="profile-table">
            <h2>WORKOUT <span>LIST</span></h2>
            <input type="text" class="search-bar" placeholder="Search">
            <div class="box">
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Difficulty</th>
                        <th>Calories</th>
                        <th>Duration</th>
                        <th>Image</th>
                        <th>Description</th>
                        <th>Long Description</th>
                        <th>Sets</th>
                        <th>Exercise Checklist</th>
                        <th>Date Registered</th>
                    </tr>
                    <?php
                        include "conn.php";
                        
                        $sql = "SELECT * FROM workout"; // Changed from "administrator" to "workout"
                        $result = mysqli_query($dbConn, $sql);
                        if(mysqli_num_rows($result) <= 0){
                            echo "<tr><td colspan='11'>No workout data found</td></tr>";
                        } else {
                            while($rows = mysqli_fetch_array($result)){
                                echo "<tr>";
                                echo "<td>" . (isset($rows['workout_id']) ? $rows['workout_id'] : '') . "</td>";
                                echo "<td>" . (isset($rows['workout_name']) ? $rows['workout_name'] : '') . "</td>";
                                echo "<td>" . (isset($rows['workout_type']) ? $rows['workout_type'] : '') . "</td>";
                                echo "<td>" . (isset($rows['difficulty']) ? $rows['difficulty'] : '') . "</td>";
                                echo "<td>" . (isset($rows['calories']) ? $rows['calories'] : '') . "</td>";
                                echo "<td>" . (isset($rows['duration']) ? $rows['duration'] : '') . "</td>";
                                echo "<td>" . (isset($rows['image']) ? $rows['image'] : '') . "</td>";
                                echo "<td>" . (isset($rows['description']) ? $rows['description'] : '') . "</td>";
                                echo "<td>" . (isset($rows['long_description']) ? $rows['long_description'] : '') . "</td>";
                                echo "<td>" . (isset($rows['sets']) ? $rows['sets'] : '') . "</td>";
                                echo "<td>" . (isset($rows['exercise_checklist']) ? $rows['exercise_checklist'] : '') . "</td>";
                                echo "<td>" . (isset($rows['date_registered']) ? $rows['date_registered'] : '') . "</td>";
                                echo "</tr>";
                            }
                        }
                    ?>
                </table>
            </div>
        </div>

        <!-- Add New Workout Form -->
        <div class="add-profile">
            <center>
                <h2>Add New <span>Workout</span></h2>
            </center>
            <form method="POST" action="" enctype="multipart/form-data">
                <label for="workout-name">Workout Name</label>
                <input type="text" id="workout-name" name="workout-name" required>
                
                <label for="workout-type">Workout Type</label>
                <select id="workout-type" name="workout-type" required>
                    <option value="">Select Type</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Flexibility">Flexibility</option>
                </select>
                
                <label for="difficulty">Difficulty Level</label>
                <select id="difficulty" name="difficulty" required>
                    <option value="">Select Difficulty</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                </select>

                <div class="form-columns">
                    <div class="column">
                        <label for="calorie">Calorie (kcal)</label>
                        <input type="number" id="calorie" name="calorie" required>
                    </div>
                    <div class="column">
                        <label for="minutes">Minutes</label>
                        <input type="number" id="minutes" name="minutes" required>
                    </div>
                </div>

                <label for="workout-image">Workout Image</label>
                <input type="file" id="workout-image" name="workout-image" accept="image/*" required>

                <label for="description">Short Description</label>
                <textarea id="description" name="description" rows="2" required placeholder="Brief description shown in workout listings"></textarea>
                
                <label for="long-description">Long Description</label>
                <textarea id="long-description" name="long-description" rows="4" required placeholder="Detailed description of the workout"></textarea>

                <div class="form-group">
                    <label for="exercise-select">Exercise Checklist</label>
                    <div class="select-dropdown">
                        <input type="text" id="exercise-search" placeholder="Select exercise IDs" readonly onclick="toggleDropdown()">
                        <div class="dropdown-content" id="exercises-dropdown">
                            <div class="search-box">
                                <input type="text" id="search-exercises" placeholder="Search exercise IDs" onkeyup="filterExercises()">
                            </div>
                            <div class="select-actions">
                                <a href="#" onclick="selectAll()">Select All</a>
                            </div>
                            <div class="exercise-list">
                                <?php if (empty($exercises)): ?>
                                <p>No exercises found</p>
                                <?php else: ?>
                                    <?php foreach ($exercises as $exercise): ?>
                                    <div class="exercise-item">
                                        <label>
                                            <input type="checkbox" name="exercises[]" value="<?php echo $exercise['id']; ?>" class="exercise-checkbox">
                                            (<?php echo $exercise['id']; ?>) <?php echo $exercise['exercise']; ?>
                                        </label>
                                    </div>
                                    <?php endforeach; ?>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                </div>

                <center>
                    <button type="submit">Create Workout</button>
                </center>
            </form>
        </div>
    </div>
    <?php
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            include "conn.php";
            
            // Get form data
            $name = $_POST['workout-name'] ?? '';
            $type = $_POST['workout-type'] ?? '';
            $difficulty = $_POST['difficulty'] ?? '';
            $calories = $_POST['calorie'] ?? 0;
            $duration = $_POST['minutes'] ?? 0;
            $description = $_POST['description'] ?? '';
            $long_description = $_POST['long-description'] ?? '';
            
            // Handle file upload for workout image
            $image = '';
            if(isset($_FILES['workout-image']) && $_FILES['workout-image']['error'] === 0) {
                $target_dir = "assets/workout_pics/";
                $file_extension = pathinfo($_FILES['workout-image']['name'], PATHINFO_EXTENSION);
                $filename = strtolower(str_replace(' ', '_', $name)) . "." . $file_extension;
                $target_file = $target_dir . $filename;
                
                // Move uploaded file
                if(move_uploaded_file($_FILES['workout-image']['tmp_name'], $target_file)) {
                    $image = $target_file;
                }
            }
            
            // Handle exercise checklist selection
            $exercise_checklist = [];
            if(isset($_POST['exercises']) && is_array($_POST['exercises'])) {
                $exercise_checklist = $_POST['exercises'];
            }
            
            // Format the exercise_checklist as shown in your example [3, [1, 2, 3, 4]]
            $exercise_count = count($exercise_checklist);
            $formatted_exercise_list = "[$exercise_count, [" . implode(", ", $exercise_checklist) . "]]";
            
            // Current date for registration
            $date_registered = date('Y-m-d');
            
            // Insert data into workout table
            $sql = "INSERT INTO workout (workout_name, workout_type, difficulty, calories, duration, image, description, long_description, exercise_checklist, date_registered) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    
            $stmt = $dbConn->prepare($sql);
            $stmt->bind_param("sssiisssss", $name, $type, $difficulty, $calories, $duration, $image, $description, $long_description, $formatted_exercise_list, $date_registered);
            
            if ($stmt->execute()) {
                echo "<script>alert('Successfully inserted workout data');</script>";
                // Redirect to refresh the page after successful submission
                echo "<script>window.location.href = 'admin_workout.php';</script>";
            } else {
                echo "<script>alert('Failed to insert data: " . $stmt->error . "');</script>";
            }
            
            $stmt->close();
            $dbConn->close();
        }
    ?>
</body>
    <script src="./js/navigation_bar.js"></script>
    <script src="./js/admin_workout.js"></script>
</html>