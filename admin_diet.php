<!-- NOTE FOR JS(dun ask me why this prevent bugs):
- admin_diet.js: select sections, retain information, clear session
- upper script: redirecting if got input errors
- down script: everything else -->
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
                    exit();
                }
                if(window.location.hash === "#nutrition") {
                    document.querySelector('.nutrition-container').style.display = 'flex';
                    document.querySelector('.diet-container').style.display = 'none';
                    document.querySelector('.nutrition-link').classList.add('active');
                    document.querySelector('.diet-link').classList.remove('active');
                    exit();
                }
            }
        });
</script>
<?php 
    include "conn.php";
    session_start();
    $nutrierrors = $_SESSION['nutri_errors'] ?? [];
    $nutri_old_data = $_SESSION['nutri_old_data'] ?? [];
    $dieterrors = $_SESSION['diet_errors'] ?? [];
    $diet_old_data = $_SESSION['diet_old_data'] ?? [];

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
                        <th>Nutrition IDs</th>
                    </tr>
                    <?php
                    include "conn.php";

                    // SQL query to get diet information along with nutrition IDs
                    $sql = "
                        SELECT d.diet_id, d.diet_name, d.description, d.diet_type, d.preparation_min, d.picture, d.directions, 
                            GROUP_CONCAT(n.nutrition_id) AS nutrition_ids
                        FROM diet d
                        LEFT JOIN diet_nutrition n ON d.diet_id = n.diet_id
                        GROUP BY d.diet_id
                    ";
                    $result = mysqli_query($dbConn, $sql);

                    if (mysqli_num_rows($result) > 0) {
                        while ($rows = mysqli_fetch_array($result)) {
                            echo "<tr diet-id='".$rows['diet_id']."'>";
                            echo "<td>".$rows['diet_id']."</td>";
                            echo "<td>".$rows['diet_name']."</td>";
                            echo "<td>".$rows['description']."</td>";
                            echo "<td>".$rows['diet_type']."</td>";
                            echo "<td>".$rows['preparation_min']."</td>";
                            if (!empty($rows['picture'])) {
                                echo "<td><img src='uploads/".$rows['picture']."' alt='".$rows['diet_name']."' width='100' loading='lazy'></td>";
                            } else {
                                echo "<td>No image available</td>";
                            }
                            echo "<td>".$rows['directions']."</td>";
                            echo "<td>".(!empty($rows['nutrition_ids']) ? $rows['nutrition_ids'] : 'No nutrition IDs available')."</td>";
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
                <?php
                
                if (!empty($dieterrors)) {
                    echo '<div class="error-messages">';
                    foreach ($dieterrors as $eacherror) {
                        echo "<p style='color:red;'>$eacherror</p>";
                    }
                    echo '</div>';
                    
                }
                ?>
            <center>
                <h2>Add New <span>Meal</span></h2>
            </center>
            <form action="insert_admin_diet.php" method="POST" enctype="multipart/form-data">
            <label for="diet-name">Meal Name</label>
            <input type="text" id="diet-name" name="diet-name" value="<?php echo htmlspecialchars($diet_old_data['diet-name'] ?? ''); ?>" required>

            <div class="form-columns">
                <div class="column">
                    <label for="diet-type">Meal Type</label>
                    <select id="diet-type" name="diet-type" required>
                        <option value="">Select Type</option>
                        <option value="all" <?php echo (isset($diet_old_data['diet-type']) && $diet_old_data['diet-type'] == 'all') ? 'selected' : ''; ?>>All</option>
                        <option value="meat" <?php echo (isset($diet_old_data['diet-type']) && $diet_old_data['diet-type'] == 'meat') ? 'selected' : ''; ?>>Meat</option>
                        <option value="vegetarian" <?php echo (isset($diet_old_data['diet-type']) && $diet_old_data['diet-type'] == 'vegetarian') ? 'selected' : ''; ?>>Vegetarian</option>
                        <option value="vegan" <?php echo (isset($diet_old_data['diet-type']) && $diet_old_data['diet-type'] == 'vegan') ? 'selected' : ''; ?>>Vegan</option>
                    </select>
                </div>
                <div class="column">
                    <label for="preparation_min">Preparation Time (min)</label>
                    <input type="number" id="preparation_min" name="preparation_min" value="<?php echo htmlspecialchars($diet_old_data['preparation_min'] ?? ''); ?>" required>
                </div>
            </div>

            <label for="nutrition_id">Ingredients</label>
            <div class="nutrition-select-container">
                <div class="custom-select">
                    <div class="select-box">
                        <input type="text" class="tags_input" name="nutrition_ids" hidden value="<?php echo htmlspecialchars($diet_old_data['nutrition_ids'] ?? ''); ?>" required/>
                        <div class="selected-options">
                            <span class="placeholder">Select nutrition IDs</span>
                        </div>
                    </div>
                </div>
                <div class="options">
                    <div class="option-search-tags">
                        <input type="text" class="search-tags" placeholder="Search nutrition IDs..."/>
                    </div>
                    <div class="option all-tags" data-value="all">Select All</div>
                </div>
                <span class="tag_error_msg">This field is required</span>
            </div>

            <div class="form-columns">
                <div class="column">
                    <label for="meal_picture">Meal Picture</label>
                    <div class="picture" onclick="document.getElementById('meal_picture').click()">
                        <p id="words">Click To Upload Meal Picture Here</p>
                        <input type="file" name="meal_picture" id="meal_picture" accept="image/*" hidden>
                        <img id="imagePreview" src="" alt="Image Preview">
                    </div>
                </div>
                <div class="column">
                    <label for="desc">Description</label>
                    <textarea id="desc" name="desc" rows="7" placeholder="Describe the diet.." required><?php echo htmlspecialchars($diet_old_data['desc'] ?? ''); ?></textarea>
                </div>
            </div>

            <label for="directions">Directions</label>
            <textarea id="directions" name="directions" rows="4" placeholder="Enter step-by-step following the format (Ex: Main direction, details;)" required><?php echo htmlspecialchars($diet_old_data['directions'] ?? ''); ?></textarea>

            <div style="display:flex;justify-content: flex-end;white-space: nowrap;">
                <button type="submit" id="add-profile-btn">Create New</button>
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
                <selec"egender" name="egender" required style="width:98%;">
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
                <?php
                if (!empty($nutrierrors)) {
                    echo '<div class="error-messages">';
                    foreach ($nutrierrors as $error) {
                        echo "<p style='color:red;'>$error</p>";
                    }
                    echo '</div>';
                    
                }
                ?>

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
                        unset($_SESSION['old_data']);
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
<!-- below is for add diet profile -->
<?php
$sql = "SELECT * FROM nutrition";
$result = mysqli_query($dbConn, $sql);

$nutritionData = [];

if (mysqli_num_rows($result) > 0) {
    while ($row = mysqli_fetch_assoc($result)) {
        $nutritionData[] = $row;
    }
}

$nutritionJson = json_encode($nutritionData);
?>
<script>
document.addEventListener('DOMContentLoaded', function () {
    const customSelects = document.querySelectorAll(".custom-select");

function updateSelectedOptions(customSelect) {
    const optionsContainer = customSelect.parentNode.querySelector(".options");
    const selectedOptions = Array.from(
        optionsContainer.querySelectorAll(".option.active")
    )
        .filter(option => option !== optionsContainer.querySelector(".option.all-tags"))
        .map(function(option) {
            return {
                value: option.getAttribute("data-value"),
                text: option.textContent.trim()
            };
        });

    // Update the hidden input with comma-separated values
    const selectedValues = selectedOptions.map(function(option) {
        return option.value;
    });
    customSelect.querySelector(".tags_input").value = selectedValues.join(",");

    // Generate the HTML for displaying selected tags
    let tagHTML = "";
    if (selectedOptions.length === 0) {
        tagHTML = '<span class="placeholder">Select nutrition IDs</span>';
    } else {
        const maxTagsToShow = 4;
        let additionalTagsCount = 0;
        
        selectedOptions.forEach(function(option, index) {
            if (index < maxTagsToShow) {
                tagHTML += '<span class="tag">' + option.text + 
                            '<span class="remove-tag" data-value="' + option.value + '">&times;</span></span>';
            } else {
                additionalTagsCount++;
            }
        });
        
        if (additionalTagsCount > 0) {
            tagHTML += '<span class="tag">+' + additionalTagsCount + ' more</span>';
        }
    }
    
    customSelect.querySelector(".selected-options").innerHTML = tagHTML;
}

// Set up event listeners for each custom select
customSelects.forEach(function(customSelect) {
    const optionsContainer = customSelect.parentNode.querySelector(".options");
    const searchInput = optionsContainer.querySelector(".search-tags");
    const noResultMessage = optionsContainer.querySelector(".no-result-message");
    const options = optionsContainer.querySelectorAll(".option");
    const allTagsOption = optionsContainer.querySelector(".option.all-tags");

    // Handle "Select All" functionality if allTagsOption exists
    if (allTagsOption) {
        allTagsOption.addEventListener("click", function(event) {
            const isActive = allTagsOption.classList.contains("active");
            allTagsOption.classList.toggle("active");
            
            options.forEach(function(option) {
                if (option !== allTagsOption) {
                    option.classList.toggle("active", !isActive);
                }
            });
            
            updateSelectedOptions(customSelect);
            event.stopPropagation();
        });
    }


    // Handle search functionality
    if (searchInput) {
        searchInput.addEventListener("input", function(event) {
            const searchTerm = searchInput.value.toLowerCase();
            let anyOptionsMatch = false;
            
            options.forEach(function(option) {
                if (option === allTagsOption) return; // Don't filter the "Select All" option
                
                const optionText = option.textContent.trim().toLowerCase();
                const shouldShow = optionText.includes(searchTerm);
                option.style.display = shouldShow ? "block" : "none";
                if (shouldShow) anyOptionsMatch = true;
            });
            
            noResultMessage.style.display = anyOptionsMatch ? "none" : "block";
            allTagsOption.style.display = searchTerm ? "none" : "block";
            
            event.stopPropagation();
        });
        
        // Prevent closing dropdown when clicking on search
        searchInput.addEventListener("click", function(event) {
            event.stopPropagation();
        });
    }

    // Handle option selection
    options.forEach(function(option) {
        option.addEventListener("click", function(event) {
            if (option !== allTagsOption) {
                option.classList.toggle("active");
                
                // Update "Select All" state
                if (allTagsOption) {
                    const allOptionsActive = Array.from(options)
                        .filter(opt => opt !== allTagsOption)
                        .every(opt => opt.classList.contains("active"));
                        
                    allTagsOption.classList.toggle("active", allOptionsActive);
                }
            }
            
            updateSelectedOptions(customSelect);
            event.stopPropagation();
        });
    });

    // Toggle dropdown when clicking the select box
    const selectBox = customSelect.querySelector(".select-box");
    selectBox.addEventListener("click", function(event) {
        // Only toggle if not clicking on a tag's remove button
        if (!event.target.closest(".remove-tag")) {
            const wasOpen = customSelect.classList.contains("open");
            
            // Close all other dropdowns
            customSelects.forEach(function(otherSelect) {
                if (otherSelect !== customSelect) {
                    otherSelect.classList.remove("open");
                }
            });
            
            // Toggle this dropdown
            customSelect.classList.toggle("open");
            
            // Clear search when opening
            if (!wasOpen && searchInput) {
                searchInput.value = "";
                options.forEach(function(option) {
                    option.style.display = "block";
                });
                noResultMessage.style.display = "none";
                
                // Focus on search input
                setTimeout(() => {
                    searchInput.focus();
                }, 10);
            }
        }
    });
});

// Handle removing tags and closing dropdowns when clicking outside
document.addEventListener("click", function(event) {
    // Handle removing tags
    const removeTag = event.target.closest(".remove-tag");
    if (removeTag) {
        const customSelect = removeTag.closest(".custom-select");
        const valueToRemove = removeTag.getAttribute("data-value");
        const optionsContainer = customSelect.parentNode.querySelector(".options");
        const optionToRemove = optionsContainer.querySelector(`.option[data-value="${valueToRemove}"]`);
        
        if (optionToRemove) {
            optionToRemove.classList.remove("active");
            
            // Update "Select All" state
            const allTagsOption = optionsContainer.querySelector(".option.all-tags");
            if (allTagsOption) {
                allTagsOption.classList.remove("active");
            }
            
            updateSelectedOptions(customSelect);
        }
        
        event.stopPropagation();
    } 
    // Close dropdowns when clicking outside
    else if (!event.target.closest(".custom-select") && !event.target.closest(".options")) {
        customSelects.forEach(function(customSelect) {
            customSelect.classList.remove("open");
        });
    }
});

// Initialize all custom selects
customSelects.forEach(updateSelectedOptions);
});
 //------------------------select row--------------------------
 const rows = document.querySelectorAll('table tr:not(:first-child)');
    const editBtn = document.getElementById("edit-btn");
    const deleteBtn = document.getElementById("delete-btn");
    const nutriDeleteBtn = document.getElementById("nutrition-delete-btn");
    const nutriEditBtn = document.getElementById("nutrition-edit-btn");
    let isEditing = false;
    let selectedRow = null;
    let mselectedRow = null;
    document.querySelectorAll(".diet-container tr").forEach(row => {
        row.addEventListener('click', function (event) {
            if (isEditing) return;
            if (this.classList.contains('no-data')) return;

            event.stopPropagation();
            rows.forEach(r => r.classList.remove('selected'));
            selectedRow = this;
            this.classList.add('selected');

            editBtn.disabled = false;
            deleteBtn.disabled = false;
        });
    });

    document.querySelectorAll(".nutrition-container tr").forEach(row => {
        row.addEventListener('click', function (event) {
            if (isEditing) return;
            if (this.classList.contains('no-data')) return;
    
            event.stopPropagation();
            rows.forEach(r => r.classList.remove('selected'));
            mselectedRow = this;
            this.classList.add('selected');
    
            nutriDeleteBtn.disabled = false;
            nutriEditBtn.disabled = false;
        });
    });

    //------------------------------deselect------------------
    document.addEventListener("click", function (event) {
        const table = document.querySelector(".box table");
        const table2 = document.querySelector(".nutri-box table");
        const tableOption = document.querySelectorAll('.table-option')
        if (table.contains(event.target) && tableOption.contains(event.target) && table2.contains(event.target)) {
            if (isEditing) return;
            if (selectedRow) {
                selectedRow.classList.remove('selected');
                selectedRow = null;
            }
            if (mselectedRow) {
                mselectedRow.classList.remove('selected');
                mselectedRow = null;
            }
            editBtn.disabled = true;
            deleteBtn.disabled = true;
            nutriDeleteBtn.disabled = true;
            nutriEditBtn.disabled = true;
        }
    }, true);

    //-----------------------------edit data-----------------------
    const addProfile = document.getElementById("dadd-profile");
    const editProfile = document.getElementById("dedit-profile");
    const naddProfile = document.getElementById("nadd-profile");
    const neditProfile = document.getElementById("nedit-profile");
    editBtn.addEventListener("click", function () {
        if (!selectedRow) return;
        isEditing = true;
        addProfile.style.display = "none";
        editProfile.style.display = "block";
        editBtn.disabled = true;
        deleteBtn.disabled = true;


        const cells = selectedRow.getElementsByTagName("td");
        document.getElementById("selectedAdminId").value = cells[0].textContent;
        document.getElementById("eusername").value = cells[1].textContent;
        document.getElementById("epassword").value = cells[2].textContent;
        document.getElementById("ename").value = cells[3].textContent;
        document.getElementById("egender").value = cells[4].textContent;
        document.getElementById("eemail").value = cells[5].textContent;
        document.getElementById("ephonenum").value = cells[6].textContent;

    });

    nutriEditBtn.addEventListener("click", function () {
        if (!mselectedRow) return;
        isEditing = true;
        document.getElementById("nutrition-name").value = "";
        document.getElementById("calories").value = "";
        document.getElementById("fat").value = "";
        document.getElementById("protein").value = "";
        document.getElementById("carb").value = "";
        naddProfile.style.display = "none";
        neditProfile.style.display = "block";
        nutriEditBtn.disabled = true;
        nutriDeleteBtn.disabled = true;
        
        const cells = mselectedRow.getElementsByTagName("td");
        document.getElementById("selectedNutriId").value = cells[0].textContent;
        document.getElementById("enutrition-name").value = cells[1].textContent;
        document.getElementById("ecalories").value = cells[2].textContent;
        document.getElementById("efat").value = cells[3].textContent;
        document.getElementById("eprotein").value = cells[4].textContent;
        document.getElementById("ecarb").value = cells[5].textContent;

    });

    //discard changes button
    document.getElementById("discard-btn").addEventListener("click", () => {
        addProfile.style.display = "block";
        editProfile.style.display = "none";
        isEditing = false;
    });

    document.getElementById("ndiscard-btn").addEventListener("click", () => {
        naddProfile.style.display = "block";
        neditProfile.style.display = "none";
        isEditing = false;
    });

    document.getElementById("confirm-btn").addEventListener("click", () => {
        isEditing = false;
        addProfile.style.display = "block";
        editProfile.style.display = "none";
    });

    document.getElementById("nconfirm-btn").addEventListener("click", () => {
        isEditing = false;
        naddProfile.style.display = "block";
        neditProfile.style.display = "none";
    });

//----------------------delete data------------------------
 let id = null;
    let table = null;
    deleteBtn.addEventListener("click", () => {
        if (!selectedRow) return;

        let popUp = document.getElementById("popup");
        popUp.style.display = "flex";
        id = selectedRow.getAttribute("diet-id");
        table = "diet";
        console.log(`ID: ${id}, Table: ${table}`);
    });

    
    document.getElementById("nutrition-delete-btn").addEventListener("click", () => {
        console.log("Selected row:", mselectedRow);
        if (!mselectedRow) return;
        let popUp = document.getElementById("mpopup");
        
        popUp.style.display = "flex";
        id = mselectedRow.getAttribute("nutrition-id");
        table = "nutrition";
        console.log(`ID: ${id}, Table: ${table}`);
    });

    document.querySelector(".content").addEventListener("click", function (event) {
        if (event.target.classList.contains("confirmDelete")) {
            console.log("confirmDelete button detected");

            if (!id || !table) {
                console.error("Missing data-id or data-table attribute");
                return;
            }

            fetch("delete.php", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: `table=${table}&id=${id}`
            })
                .then(res => res.text())
                .then(() => location.reload()) 
                .catch(console.error);
    
            document.getElementById("popup").style.display = "none";
            document.getElementById("mpopup").style.display = "none";
        }
        if (event.target.classList.contains("cancelDelete")) {
            document.getElementById("mpopup").style.display = "none";
            document.getElementById("popup").style.display = "none";
        }
    });

//-----------------------------search--------------------------
    document.querySelectorAll(".search-bar").forEach(searchBar => {
        searchBar.addEventListener("keyup", function () {
            const searchValue = this.value.toLowerCase();

            let table = this.closest("div").querySelector("table");
            let rows = table.querySelectorAll("tr:not(:first-child)");
    
            rows.forEach(row => {
                if (row.classList.contains("no-data")) return;
    
                const usernameCell = row.cells[1].textContent.toLowerCase(); 
    
                if (usernameCell.includes(searchValue)) {
                    row.style.display = "";
                } else {
                    row.style.display = "none";
                }
            });
        });
    });

    //----------------------------tag--------------------------
    const nutritionData = <?php echo $nutritionJson; ?>;

    const optionsContainer = document.querySelector(".options");

    function populateOptions(data) {

        if (data.length > 0) {
            // Create options for each nutrition item
            data.forEach(nutrition => {
                const option = document.createElement('div');
                option.classList.add('option');
                option.dataset.value = nutrition.nutrition_id;
                option.textContent = `(${nutrition.nutrition_id}) ${nutrition.nutrition_name} `;
                optionsContainer.appendChild(option);
            });
        } else {
            const noData = document.createElement("div");
            noData.classList.add("no-result-message");
            noData.textContent = "No nutrition data found";
            optionsContainer.appendChild(noData);
        }
    }
    populateOptions(nutritionData);

    document.getElementById("meal_picture").addEventListener("change", function (event) {
    const file = event.target.files[0]; 
    if (file) {
        const reader = new FileReader(); 
        reader.onload = function (e) {
            console.log("image attached");
            const img = document.getElementById("imagePreview");
            img.src = e.target.result;
            img.style.display = "block"; 

            const words = document.getElementById("words");
            words.style.display = "none";
        };
        reader.readAsDataURL(file);
    }

    
});
</script>  
