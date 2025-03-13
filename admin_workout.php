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
                        <th>Username</th>
                        <th>Password</th>
                        <th>Name</th>
                        <th>Gender</th>
                        <th>Email Address</th>
                        <th>Phone Number</th>
                    </tr>
                    <?php
                        include "conn.php";
                        
                        $sql="SELECT * FROM administrator";
                        $result=mysqli_query($dbConn,$sql);
                        if(mysqli_num_rows($result)<=0){
                            die("<script>alert('No data from database')</script>");
                        }

                        while($rows = mysqli_fetch_array($result)){
                            echo "<tr>";
                            echo "<td>".$rows['workout_id']."</td>";
                            echo "<td>".$rows['workout_name']."</td>";
                            echo "<td>".$rows['workout_type']."</td>";
                            echo "<td>".$rows['calories']."</td>";
                            echo "<td>".$rows['duration']."</td>";
                            echo "<td>".$rows['thumbnail']."</td>";
                            echo "<td>".$rows['video']."</td>";
                            echo "<td>".$rows['description']."</td>";
                            echo "<td>".$rows['muscle_diagram']."</td>";
                            echo "<td>".$rows['workout_step_checklist']."</td>";
                            echo "<tr>";
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