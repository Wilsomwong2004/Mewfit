<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile</title>
    <link rel="stylesheet" href="css/admin_user_page.css">
    <style>
        th:hover {background-color: white !important;}
        th{background-color: white;}
        th:nth-child(1), td:nth-child(1) { width: 10%; }
        th:nth-child(2), td:nth-child(2) { width: 20%; }
        th:nth-child(3), td:nth-child(3) { width: 20%; }
        th:nth-child(4), td:nth-child(4) { width: 20%; }
        th:nth-child(5), td:nth-child(5) { width: 10%; }
        th:nth-child(6), td:nth-child(6) { width: 20%; }
        th:nth-child(7), td:nth-child(7) { width: 20%; }
    </style>
</head>
<?php
    include "conn.php";

    
    
?>
<body>
    <nav>
        <div class="logo-space"> <div class="logo-and-title"></div>
            <img src="assets/icons/logo.svg" style="height:40px;" alt="Logo">
        </div>
        <ul class="nav-links">
            <li><a href="#">DASHBOARD</a></li>
            <li><a href="#" class="active">USER</a></li>
            <li><a href="#">WORKOUT</a></li>
            <li><a href="#">MEALS</a></li>
        </ul>
    </nav>

    <h2 class="title"> USER <span>PROFILE</span></h2>

    <div class="container">
        <div class="profile-table">
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
                        $sql = "SELECT * FROM administrator";
                        $result = mysqli_query($dbConn, $sql);
                        if (mysqli_num_rows($result) > 0) {
                            while ($rows = mysqli_fetch_array($result)) {
                                echo "<tr>";
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
                            echo "<tr><td colspan='7' style='border:none;text-align:center;margin:50px'>No data available</td></tr>";
                            $sql="TRUNCATE TABLE administrator";
                        }
                    ?>
                </table>
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

                <center>
                <button type="submit" class="add-profile">Create New</button>
                </center>
            </form>
        </div>
    </div>
</body>
</html>
<?php
// enter new data
function validateInput($username, $phone_num) {
    $errors = [];

    if (empty($username) || strlen($username) < 3 || strlen($username) > 20) {
        $errors[] = "Username must be between 3 and 20 characters.";
    }

    if (empty($phone_num) || !preg_match('/^\d{10}$/', $phone_num)) {
        $errors[] = "Phone number must be 10 digits.";
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

    $errors = validateInput($username,  $phone_num);
    echo $errors;
    
    if (empty($errors)){
        $sql = "INSERT INTO administrator(username, password, name, gender, email_address, phone_number) 
        VALUES('$username','$password','$name','$gender', '$email', '$phone_num');";

        if (!$dbConn->query($sql)) {
            die("Failed to update admin table");
        }
    
        echo "<script>alert('Sucessfully insert data')</script>";
        
    }
    
}
?>
