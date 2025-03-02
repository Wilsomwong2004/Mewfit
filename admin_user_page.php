<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile</title>
    <link rel="stylesheet" href="css/admin_user_page.css">
    <link rel="stylesheet" href="./css/navigation_bar.css">
    <script src="js/admin_user_page.js" defer></script>
    <script src="js/navigation_bar.js"></script>
</head>
<?php 
    include "conn.php";
    session_start();

    $errors = $_SESSION['admin_errors'] ?? [];
    $old_data = $_SESSION['old_data'] ?? [];
    $showEditForm = $_SESSION['show_edit_form'] ?? false;

    if (isset($_SESSION['admin_errors']) || isset($_SESSION['old_data']) || isset($_SESSION['show_edit_form'])) {
        unset($_SESSION['admin_errors']);
        unset($_SESSION['old_data']);
        unset($_SESSION['show_edit_form']);
    }
?>
<body>
    <nav class="navbar" id="navbar">
        <div class="nav-links" id="nav-links">
            <img src="./assets/icons/mewfit-admin-logo.svg" alt="logo" class="nav-logo" id="nav-logo">
            <span class="admin-dashboard"><a href="admin_homepage.php">DASHBOARD</a></span>
            <span class="admin-user"><a href="#" class="active">USER</a></span>
            <span class="admin-workout"><a href="admin_workout.php">WORKOUT</a></span>
            <span class="admin-meals"><a href="admin_diet.php" >MEALS</a></span>
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
        <h2 class="title"> USER <span>PROFILE</span></h2>
        <ul class="user-section">
            <li><a href="#admin" class="admin-link">ADMIN</a></li>
            <li><a href="#member" class="member-link">MEMBER</a></li>
        </ul>
    </div>
    
    <div class="content">
        <div class="admin-container">
            <div class="section1">
                <input type="text" class="search-bar" placeholder="Search Username..">
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
                        $sql = "SELECT * FROM administrator";
                        $result = mysqli_query($dbConn, $sql);
                        if (mysqli_num_rows($result) > 0) {
                            while ($rows = mysqli_fetch_array($result)) {
                                echo "<tr admin-id='".$rows['admin_id']."'>";
                                echo "<td>".$rows['admin_id']."</td>";
                                echo "<td>".$rows['username']."</td>";
                                echo "<td>".$rows['password']."</td>";
                                echo "<td>".$rows['name']."</td>";
                                echo "<td>".$rows['gender']."</td>";
                                echo "<td>".$rows['email_address']."</td>";
                                echo "<td>".$rows['phone_number']."</td>";
                                echo "</tr>";
                            }
                        } else {
                            echo "<tr class='no-data'><td colspan='7'>No data available</td></tr>";
                            $sql="TRUNCATE TABLE administrator";
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
            <div class="add-profile">
                <center>
                <h2>Add New <span>Profile</span></h2> 
                </center>
                <form method="post" action="">
                    <label for="username">Username</label>
                    <input type="text" id="username" name="username" required>
                    
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>

                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>

                    <label for="gender">Gender</label>
                    <select id="gender" name="gender" required style="width:98%;">
                        <option value="">Select Gender</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </select>

                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required>

                    <label for="phonenum">Phone Number</label>
                    <input type="text" id="phonenum" name="phonenum" required>

                    <div style="display:flex;justify-content: flex-end;white-space: nowrap;">
                        <button type="submit" id="add-profile-btn">Create New</button>
                    </div>
                </form>
            </div>
            <div class="edit-profile">
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
                <input type="hidden" id="table" name="table" value="administrator">
                    
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
        <div class="member-container">
            <input type="text" class="search-bar" placeholder="Search Username">
            <div class="member-box">
                <table>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Password</th>
                        <th>Level</th>
                        <th>Weight</th>
                        <th>Age</th>
                        <th>Fitness Goal</th>
                        <th>Target Weight</th>
                        <th>Gender</th>
                        <th>Day Streak Starting Date</th>
                    </tr>
                    
                    <?php
                        $sql = "SELECT * FROM member";
                        $result = mysqli_query($dbConn, $sql);
                        if (mysqli_num_rows($result) > 0) {
                            while ($rows = mysqli_fetch_array($result)) {
                                echo "<tr member-id='".$rows['member_id']."'>";
                                echo "<td>".$rows['member_id']."</td>";
                                echo "<td>".$rows['username']."</td>";
                                echo "<td>".$rows['password']."</td>";
                                echo "<td>".$rows['level']."</td>";
                                echo "<td>".$rows['weight']."</td>";
                                echo "<td>".$rows['age']."</td>";
                                echo "<td>".$rows['fitness_goal']."</td>";
                                echo "<td>".$rows['target_weight']."</td>";
                                echo "<td>".$rows['gender']."</td>";
                                echo "<td>".$rows['day_streak_starting_date']."</td>";
                                echo "</tr>";
                            }
                        } else {
                            echo "<tr class='no-data'><td colspan='10' >No data available</td></tr>";
                            $sql="TRUNCATE TABLE member";
                        }
                    ?>
                </table>
            </div>
            <div class="table-option">
                <button id="member-delete-btn" disabled>Delete</button>
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
    <script>
        window.onresize = function() {
            if (window.innerWidth > 1200) {
                window.scrollTo(0, 0); 
            }
        };
        document.addEventListener("DOMContentLoaded", function() {
            var addProfile = document.querySelector('.add-profile');
            var editProfile = document.querySelector('.edit-profile');

            <?php if ($showEditForm): ?>
                addProfile.style.display = 'none';
                editProfile.style.display = 'block';
            <?php endif; ?>
        });
    </script>
</body>
</html>
<?php
// enter new data
function validateInput($dbConn, $username, $email, $phone_num) {
    $errors = [];

    if (empty($username) || strlen($username) < 3 || strlen($username) > 20) {
        $errors[] = "Username must be between 3 and 20 characters.";
    }
    if (empty($phone_num) || !preg_match('/^\d{10}$/', $phone_num)) {
        $errors[] = "Phone number must be 10 digits.";
    }

    $stmt = $dbConn->prepare("SELECT username, email_address, phone_number FROM administrator WHERE username = ? OR email_address = ? OR phone_number = ?");
    
    if ($stmt) {
        $stmt->bind_param("sss", $username, $email, $phone_num);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            if ($row['username'] === $username) {
                $errors[] = "Username already exists.";
                break;
            }
            if ($row['email_address'] === $email) {
                $errors[] = "Email already exists.";
                break;
            }
            if ($row['phone_number'] === $phone_num) {
                $errors[] = "Phone number already exists.";
                break;
            }
        }
        $stmt->close();
    } else {
        $errors[] = "Database error: Unable to prepare statement.";
    }

    return $errors;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);
    $name = trim($_POST['name']);
    $gender = trim($_POST['gender']);
    $email = trim($_POST['email']);
    $phone_num = trim($_POST['phonenum']);

    if (!empty($username)){
        $errors = validateInput($dbConn,$username,$email,  $phone_num);
        if (empty($errors)) {
            $sql = "INSERT INTO administrator (username, password, name, gender, email_address, phone_number) 
                    VALUES ('$username', '$password', '$name', '$gender', '$email', '$phone_num')";
    
            if (!$dbConn->query($sql)) {
                die("Failed to update admin table");
            }else{
                echo "<script>sessionStorage.setItem('clearForm', 'true');</script>";
            }
        } else {
            foreach ($errors as $error) {
                echo "<script>alert('$error');</script>";
            }
        }
    }
}
?>