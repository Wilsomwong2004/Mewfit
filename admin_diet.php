<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diet Management</title>
    <link rel="stylesheet" href="./css/admin_diet.css">
    <link rel="stylesheet" href="./css/navigation_bar.css">
    <script src="js/navigation_bar.js"></script>
    <script src="js/admin_diet.js"></script>
</head>
<script>
        window.onresize = function() {
            if (window.innerWidth > 1200) {
                window.scrollTo(0, 0); 
            }
        };
        document.addEventListener("DOMContentLoaded", function() {
            if(window.location.hash) {
                if(window.location.hash === "#editnutrition") {
                    document.querySelector('.nutrition-container').style.display = 'flex';
                    document.querySelector('.diet-container').style.display = 'none';
                    document.querySelector('.nutrition-link').classList.add('active');
                    document.querySelector('.diet-link').classList.remove('active');
                    document.getElementById('nadd-profile').style.display = 'none';
                    document.getElementById('nedit-profile').style.display = 'block';
                }
                if(window.location.hash === "#nutrition") {
                    document.querySelector('.nutrition-container').style.display = 'flex';
                    document.querySelector('.diet-container').style.display = 'none';
                    document.querySelector('.nutrition-link').classList.add('active');
                    document.querySelector('.diet-link').classList.remove('active');
                }
            }
        });
    </script>
<?php 
    include "conn.php";
    session_start();
    $nutrierrors = $_SESSION['nutri_errors'] ?? [];
    $nutri_old_data = $_SESSION['nutri_old_data'] ?? [];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['nutrition-name'] ?? '';
    $calories = $_POST['calories'] ?? 0;
    $fat = $_POST['fat'] ?? 0;
    $protein = $_POST['protein'] ?? 0;
    $carbohydrate = $_POST['carb'] ?? 0;

    $nutrierrors = [];

    // Validate input
    if ($calories <= 0) {
        $nutrierrors[] = "Calories must be a positive number.";
    }
    if ($fat < 0) {
        $nutrierrors[] = "Fat must be a non-negative number.";
    }
    if ($protein < 0) {
        $nutrierrors[] = "Protein must be a non-negative number.";
    }
    if ($carbohydrate < 0) {
        $nutrierrors[] = "Carbohydrate must be a non-negative number.";
    }

    // Check if nutrition name already exists
    $checkStmt = $dbConn->prepare("SELECT COUNT(*) FROM nutrition WHERE nutrition_name = ?");
    $checkStmt->bind_param("s", $name);
    $checkStmt->execute();
    $checkStmt->bind_result($count);
    $checkStmt->fetch();
    $checkStmt->close();

    if ($count > 0) {
        $nutrierrors[] = "Nutrition name already exists.";
    }

    if (empty($nutrierrors)) {
        $insertStmt = $dbConn->prepare("INSERT INTO nutrition (nutrition_name, calories, fat, protein, carbohydrate) VALUES (?, ?, ?, ?, ?)");
        $insertStmt->bind_param("sdddd", $name, $calories, $fat, $protein, $carbohydrate);

        if ($insertStmt->execute()) {
            $_SESSION['success_message'] = "Nutrition data added successfully!";
            unset($_SESSION['nutri_errors']);
            unset($_SESSION['nutri_old_data']);
            header("Location: admin_diet.php#nutrition");
            exit();
        } else {
            $errors[] = "Error adding nutrition data: " . $dbConn->error;
        } 
    } 
    if (!empty($nutrierrors)) {
        $_SESSION['nutri_errors'] = $nutrierrors;
        $_SESSION['nutri_old_data'] = $_POST;
        header("Location: admin_diet.php#nutrition");
    }
}
?>
<body>
    <nav class="navbar" id="navbar">
        <div class="nav-links" id="nav-links">
            <img src="./assets/icons/mewfit-admin-logo.svg" alt="logo" class="nav-logo" id="nav-logo">
            <span><a href="admin_homepage.php">DASHBOARD</a></span>
            <span><a href="admin_user_page.php" >USER</a></span>
            <span><a href="admin_workout.php">WORKOUT</a></span>
            <span><a href="#" class="active">MEALS</a></span>
        </div>
        <div class="header-right">
            <button id="hamburger-menu" aria-label="Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>
        </div>
    </nav>

    <div id="heading">
        <h2 class="title"> MEAL <span>PROFILE</span></h2>
        <ul class="meal-section">
            <li><a href="#diet" class="diet-link">DIET</a></li>
            <li><a href="#nutrition" class="nutrition-link">NUTRITION</a></li>  
        </ul>
    </div>
    
    <div class="content">
        <div class="diet-container">
            <div class="section1">
                <input type="text" class="search-bar" placeholder="Search Diet Name..">
                <div class="box">
                    <table>
                        <tr>
                            <th>Diet ID</th>
                            <th>Diet Name</th>
                            <th>Description</th>
                            <th>Diet Type</th>
                            <th>Preparation Time (Min)</th>
                            <th>Picture</th>
                            <th>Directions</th>
                            <th>Nutrition ID</th>
                        </tr>
                        <?php
                        include "conn.php";
                        $sql = "SELECT * FROM diet";
                        $result = mysqli_query($dbConn, $sql);

                        if (mysqli_num_rows($result) > 0) {
                            while ($rows = mysqli_fetch_array($result)) {
                                echo "<tr diet-id='".$rows['diet_id']."'>";
                                echo "<td>".$rows['diet_id']."</td>";
                                echo "<td>".$rows['diet_name']."</td>";
                                echo "<td>".$rows['description']."</td>";
                                echo "<td>".$rows['diet_type']."</td>";
                                echo "<td>".$rows['preparation_min']."</td>";
                                echo "<td><img src='".$rows['picture']."' alt='Diet Image' width='100'></td>";
                                echo "<td>".$rows['directions']."</td>";
                                echo "<td>".$rows['nutrition_id']."</td>";
                                echo "</tr>";
                            }
                        } else {
                            echo "<tr class='no-data'><td colspan='8'>No data available</td></tr>";
                        }
                        ?>
                    </table>
                </div>
                <div class="table-option">
                    <button id="edit-btn" disabled>Edit</button>
                    <button id="delete-btn" disabled>Delete</button>
                </div>
            </div>

            <!--Add New Profile Form -->
            <div class="add-profile" id="dadd-profile">
            <center>
                <h2>Add New <span>Meal</span></h2>
            </center>
            <form>
                <label for="diet-name">Meal Name</label>
                <input type="text" id="diet-name" name="diet-name" required>
                
                <label for="diet-type">Meal Type</label>
                <select id="diet-type" name="diet-type" required>
                    <option value="">Select Type</option>
                    <option value="all">All</option>
                    <option value="meat">Meat</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                </select>

                <div class="form-columns">
                    <div class="column">
                        <label for="nutrition_id">Nutrition ID</label>
                        <input type="number" id="nutrition_id" name="nutrition_id" required>
                    </div>
                    <div class="column">
                        <label for="preparation_min">Preparation Time (minutes)</label>
                        <input type="number" id="preparation_min" name="preparation_min" required>
                    </div>
                </div>

                <div class="picture">
                    <p>Drag and Drop Meal Picture Here</p>
                    <input type="file" accept="image/*" hidden>
                </div>

                <label for="ingredients">Ingredients</label>
                <textarea id="ingredients" name="ingredients" rows="4" placeholder="List ingredients separated by commas" required></textarea>

                <label for="directions">Directions</label>
                <textarea id="directions" name="directions" rows="4" placeholder="Enter step-by-step cooking directions" required></textarea>

                <div style="display:flex;justify-content: flex-end;white-space: nowrap;">
                    <button type="" id="add-profile-btn">Create New</button>
                </div>
                </form>
            </div>
            <div class="edit-profile" id="dedit-profile">
                <center>
                <h2>Edit <span>Profile</span></h2> 
                </center>
                <?php
                if (!empty($errors)) {
                    echo '<div class="error-messages">';
                    foreach ($errors as $error) {
                        echo "<p style='color:red;'>$error</p>";
                    }
                    echo '</div>';
                    
                }
                ?>
                <form method="POST" action="edit.php" id="administrator">
                <input type="hidden" id="selectedAdminId" name="selectedAdminId" value="<?php echo $_GET['admin_id'] ?? ''; ?>">
                <input type="hidden" id="nutrition_table" name="table" value="administrator">
                    
                <label for="eusername">Username</label>
                <input type="text" id="eusername" name="eusername" value="<?php echo htmlspecialchars($old_data['eusername'] ?? ''); ?>" required>

                <label for="epassword">Password</label>
                <input type="text" id="epassword" name="epassword" value="<?php echo htmlspecialchars($old_data['epassword'] ?? ''); ?>" required>

                <label for="ename">Name</label>
                <input type="text" id="ename" name="ename" value="<?php echo htmlspecialchars($old_data['ename'] ?? ''); ?>" required>

                <label for="egender">Gender</label>
                <select id="egender" name="egender" required style="width:98%;">
                    <option value="">Select Gender</option>
                    <option value="female" <?php echo (isset($old_data['egender']) && $old_data['egender'] == 'female') ? 'selected' : ''; ?>>Female</option>
                    <option value="male" <?php echo (isset($old_data['egender']) && $old_data['egender'] == 'male') ? 'selected' : ''; ?>>Male</option>
                </select>

                <label for="eemail">Email Address</label>
                <input type="email" id="eemail" name="eemail" value="<?php echo htmlspecialchars($old_data['eemail'] ?? ''); ?>" required>

                <label for="ephonenum">Phone Number</label>
                <input type="text" id="ephonenum" name="ephonenum" value="<?php echo htmlspecialchars($old_data['ephonenum'] ?? ''); ?>" required>

                <div style="display:flex;justify-content: flex-end;gap:20px;white-space: nowrap;">
                    <button type="button" id="discard-btn">Discard Changes</button>
                    <button type="submit" id="confirm-btn">Update Changes</button>
                </div>
            </form>
            </div>
            <div class="popup" id="popup">
                <div class="popup-content">
                    <h2>Confirm Deletion</h2>
                    <p>Are you sure you want to delete this record?</p>
                    <button class="confirmDelete">Yes, Delete</button>
                    <button class="cancelDelete">Cancel</button>
                </div>
            </div>
        </div>
        <div class="nutrition-container">
            <div class="section1">
                <input type="text" class="search-bar" placeholder="Search Nutrition Name">
                <div class="nutri-box">
                    <table>
                        <tr>
                            <th>ID</th>
                            <th>Nutrition Name</th>
                            <th>Calories</th>
                            <th>Fat (g)</th>
                            <th>Protein (g)</th>
                            <th>Carbohydrate (g)</th>
                        </tr>

                        <?php

                        $sql = "SELECT * FROM nutrition";
                        $result = mysqli_query($dbConn, $sql);

                        if (mysqli_num_rows($result) > 0) {
                            while ($row = mysqli_fetch_assoc($result)) {
                                echo "<tr nutrition-id='" . $row['nutrition_id'] . "'>";
                                echo "<td>" . $row['nutrition_id'] . "</td>";
                                echo "<td>" . $row['nutrition_name'] . "</td>";
                                echo "<td>" . $row['calories'] . "</td>";
                                echo "<td>" . $row['fat'] . "</td>";
                                echo "<td>" . $row['protein'] . "</td>";
                                echo "<td>" . $row['carbohydrate'] . "</td>";
                                echo "</tr>";
                            }
                        } else {
                            echo "<tr class='no-data'><td colspan='6'>No data available</td></tr>";
                        }
                        ?>
                    </table>
                </div>
                <div class="table-option">
                    <button id="nutrition-edit-btn" disabled>Edit</button>
                    <button id="nutrition-delete-btn" disabled>Delete</button>
                </div>
                
            </div>  
            <div class="add-profile" id="nadd-profile" style="height:540px;">
            <center>
                <h2>Add New <span>Nutrition</span></h2>
            </center>
            <?php if (!empty($nutrierrors)): ?>
                <script>
                    <?php foreach ($nutrierrors as $error): ?>
                        alert("<?php echo addslashes($error); ?>");
                    <?php endforeach; ?>
                </script>
            <?php endif; ?>
            <form action="" method="POST">
            <label for="nutrition-name">Nutrition Name</label>
            <input type="text" id="nutrition-name" name="nutrition-name" value="<?php echo htmlspecialchars($nutri_old_data['nutrition-name'] ?? ''); ?>" required>

            <label for="calories">Calories</label>
            <input type="number" id="calories" name="calories" value="<?php echo htmlspecialchars($nutri_old_data['calories'] ?? ''); ?>" required>

            <label for="fat">Fat (g)</label>
            <input type="number" step="0.01" id="fat" name="fat" value="<?php echo htmlspecialchars($nutri_old_data['fat'] ?? ''); ?>" required>

            <label for="protein">Protein (g)</label>
            <input type="number" step="0.01" id="protein" name="protein" value="<?php echo htmlspecialchars($nutri_old_data['protein'] ?? ''); ?>" required>

            <label for="carb">Carbohydrate (g)</label>
            <input type="number" step="0.01" id="carb" name="carb" value="<?php echo htmlspecialchars($nutri_old_data['carb'] ?? ''); ?>" required>

            <div style="display:flex;justify-content: flex-end;white-space: nowrap;">
                <button type="submit" id="nadd-profile-btn">Create New</button>
            </div>
            </form>
            </div>
            <div class="edit-profile" id="nedit-profile" style="height:540px;">
            <center>
                <h2>Edit <span>Nutrition</span></h2>
            </center>
            <form action="edit.php" method="POST">
                <?php
                    $errors = $_SESSION['admin_errors'] ?? [];
                    $old_data = $_SESSION['old_data'] ?? [];
                    $showEditForm = $_SESSION['show_edit_form'] ?? false;

                    if (isset($_SESSION['admin_errors']) && count($_SESSION['admin_errors']) > 0) {
                        echo "<div class='error-messages'>";
                        foreach ($_SESSION['admin_errors'] as $error) {
                            echo "<p style='color: red;'>$error</p>";
                        }
                        echo "</div>";
                        unset($_SESSION['admin_errors']); 
                    }
                ?>
                
                <input type="hidden" id="selectedNutriId" name="selectedNutriId" value="<?php echo $_GET['nutrition_id'] ?? ''; ?>">
                <input type="hidden" id="table" name="table" value="nutrition">
                <label for="nutrition-name">Nutrition Name</label>
                <input type="text" id="enutrition-name" name="enutrition-name" value="<?php echo htmlspecialchars($old_data['enutrition-name'] ?? ''); ?>" required>

                <label for="calories">Calories</label>
                <input type="number" id="ecalories" name="ecalories" value="<?php echo htmlspecialchars($old_data['ecalories'] ?? ''); ?>"required>

                <label for="fat">Fat (g)</label>
                <input type="number" step="0.01" id="efat" name="efat" value="<?php echo htmlspecialchars($old_data['efat'] ?? ''); ?>" required>


                <label for="protein">Protein (g)</label>
                <input type="number" step="0.01" id="eprotein" name="eprotein" value="<?php echo htmlspecialchars($old_data['eprotein'] ?? ''); ?>" required>

                <label for="carb">Carbohydrate (g)</label>
                <input type="number" step="0.01" id="ecarb" name="ecarb" value="<?php echo htmlspecialchars($old_data['ecarb'] ?? ''); ?>" required>

                <div class="table-option">
                    <button type="button" id="ndiscard-btn">Discard Changes</button>
                    <button type="submit" id="nconfirm-btn">Update Changes</button>
                </div>
            </form>
            <?php
            if (isset($_SESSION['admin_errors']) || isset($_SESSION['old_data']) || isset($_SESSION['show_edit_form'])) {
                unset($_SESSION['admin_errors']);
                unset($_SESSION['old_data']);
                unset($_SESSION['show_edit_form']);
            }
            ?>
            </div>
            <div class="mpopup" id="mpopup">
                <div class="popup-content">
                    <h2>Confirm Deletion</h2>
                    <p>Are you sure you want to delete this record?</p>
                    <button class="confirmDelete">Yes, Delete</button>
                    <button class="cancelDelete">Cancel</button>
                </div>
            </div>
        </div>
    </div>
                          
    </div>
</body>
</html>
