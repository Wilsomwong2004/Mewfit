<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Meal Management</title>
    <link rel="stylesheet" href="css/admin_diet.css">
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
            <li><a href="#">WORKOUT</a></li>
            <li><a href="#" class="active">MEALS</a></li>
        </ul>
    </nav>

    <div class="container">
        <!-- Meal Table -->
        <div class="profile-table">
            <h2>MEAL <span>LIST</span></h2>
            <input type="text" class="search-bar" placeholder="Search">
            <div class="box"></div>
        </div>

        <!-- Add New Meal Form -->
        <div class="add-profile">
            <center>
                <h2>Add New <span>Meal</span></h2>
            </center>
            <form>
                <label for="meal-name">Meal Name</label>
                <input type="text" id="meal-name" name="meal-name" required>
                
                <label for="meal-type">Meal Type</label>
                <select id="meal-type" name="meal-type" required>
                    <option value="">Select Type</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="snack">Snack</option>
                </select>

                <div class="form-columns">
                    <div class="column">
                        <label for="calorie">Calorie (kcal)</label>
                        <input type="number" id="calorie" name="calorie" required>
                    </div>
                    <div class="column">
                        <label for="minutes">Preparation Time (minutes)</label>
                        <input type="number" id="minutes" name="minutes" required>
                    </div>
                </div>

                <div class="drag-drop-box">
                    <p>Drag and Drop Meal Picture Here</p>
                    <input type="file" accept="image/*" hidden>
                </div>

                <label for="ingredients">Ingredients</label>
                <textarea id="ingredients" name="ingredients" rows="4" placeholder="List ingredients separated by commas" required></textarea>

                <label for="directions">Directions</label>
                <textarea id="directions" name="directions" rows="4" placeholder="Enter step-by-step cooking directions" required></textarea>

                <center>
                    <button type="submit">Create Meal</button>
                </center>
            </form>
        </div>
    </div>

    <?php
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $name = $_POST['meal-name'];
            $type = $_POST['meal_type'];
            $duration = $_POST['minutes'];
            $thumbnail = $_POST['thumbnail'];
            $description = $_POST['description'];
            $directions = $_POST['directions'];
        }

        include "conn.php";

        $sql = "INSERT INTO diet(meal_name, description, meal_type, preparation_min, picture,directions) 
        VALUES('$name','$description','$type','$duration', '$thumbnail', '$directions');";

        if (!$dbConn->query($sql)) {
            die("Failed to update Laptop table");
        }
        $dbConn->close();

        echo "<script>alert('Sucessfully insert data')</script>"
    ?>

    <!-- <?php
        if ($_SERVER['REQUEST_METHOD'] == 'POST') {
            $name = $_POST['nutrition-name'];
            $calorie = $_POST['calorie'];
            $fat = $_POST['fat'];
            $protein = $_POST['protein'];
            $carbohydrate = $_POST['carbohydrate'];
        }

        include "conn.php";

        $sql = "INSERT INTO nutrition(nutrition_name, calorie, fat, protein, carbohydrate) 
        VALUES('$name','$calorie','$fat','$protein', '$carbohydrate');";

        if (!$dbConn->query($sql)) {
            die("Failed to update Laptop table");
        }
        $dbConn->close();

        echo "<script>alert('Sucessfully insert data')</script>"
    ?> -->
</body>
</html>
