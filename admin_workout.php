<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workout Management</title>
    <link rel="stylesheet" href="css/admin_workout.css">
</head>
<body>
    <nav>
        <div class="logo-space">
            <div class="logo-and-title"></div>
            <img src="assets/icons/logo.svg" style="height:40px;" alt="Logo">
        </div>
        <ul class="nav-links">
            <li><a href="#">DASHBOARD</a></li>
            <li><a href="#">USER</a></li>
            <li><a href="#" class="active">WORKOUT</a></li>
            <li><a href="#">MEALS</a></li>
        </ul>
    </nav>

    <div class="container">
        <!-- Workout Table -->
        <div class="profile-table">
            <h2>WORKOUT <span>LIST</span></h2>
            <input type="text" class="search-bar" placeholder="Search">
            <div class="box"></div>
        </div>

        <!-- Add New Workout Form -->
        <div class="add-profile">
            <center>
                <h2>Add New <span>Workout</span></h2>
            </center>
            <form>
                <label for="workout-name">Workout Name</label>
                <input type="text" id="workout-name" name="workout-name" required>
                
                <label for="workout-type">Workout Type</label>
                <select id="workout-type" name="workout-type" required>
                    <option value="">Select Type</option>
                    <option value="cardio">Cardio</option>
                    <option value="strength">Strength</option>
                    <option value="flexibility">Flexibility</option>
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

                <div class="drag-drop-box">
                    <p>Drag and Drop Thumbnail Here</p>
                    <input type="file" accept="image/*" hidden>
                </div>

                <div class="drag-drop-box">
                    <p>Drag and Drop Video Here</p>
                    <input type="file" accept="video/*" hidden>
                </div>

                <div class="drag-drop-box">
                    <p>Drag and Drop Muscle Diagram Here</p>
                    <input type="file" accept="image/*" hidden>
                </div>

                <label for="description">Description</label>
                <textarea id="description" name="description" rows="4" required></textarea>

                <label for="steps">Workout Step Checklist</label>
                <textarea id="steps" name="steps" rows="4" placeholder="Enter steps separated by new lines" required></textarea>

                <center>
                    <button type="submit">Create Workout</button>
                </center>
            </form>
        </div>
    </div>
    <?php
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $name = $_POST['name'];
            $type = $_POST['workout_type'];
            $calories = $_POST['calories'];
            $duration = $_POST['duration'];
            $thumbnail = $_POST['thumbnail'];
            $video = $_POST ['video'];
            $description = $_POST['description'];
            $muscle_diagram = $_POST['muscle_diagram'];
            $workout_step_checklist = $_POST['steps'];
        }

        include "conn.php";

        $sql = "INSERT INTO workout(workout_name, workout_type, calories, duration, thumbnail, video, description. muscle_diagram, workout_step_checklist) 
        VALUES('$name','$type','$calories','$duration', '$thumbnail', '$video','$description','$muscle_diagram','$workout_step_checklist');";

        if (!$dbConn->query($sql)) {
            die("Failed to update Laptop table");
        }
        $dbConn->close();

        echo "<script>alert('Sucessfully insert data')</script>"
    ?>
</body>
</html>