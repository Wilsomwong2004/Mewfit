<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Profile</title>
    <link rel="stylesheet" href="css/admin_user_page.css">
</head>
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

    <div class="container">
        <!-- User Profile Table -->
        <div class="profile-table">
            <h2> USER <span>PROFILE</span></h2><!--add button for user n admin-->
            <input type="text" class="search-bar" placeholder="Search">
                <div class="box"></div>
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
                <div style="display:flex;justify-content: space-around;">
                    <label id="custom-label">
                        <input type="radio" name="gender" value="Female" onclick="changeColor(this)" style="display:none;">
                        Female
                    </label>
                    <label id="custom-label">
                        <input type="radio" name="gender" value="Male" onclick="changeColor(this)" style="display:none;">
                        Male
                    </label>
                </div>

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
    <script>
    document.querySelectorAll('.option-button input').forEach(input => {
        input.addEventListener('change', function() {
            document.querySelectorAll('.option-button').forEach(btn => btn.classList.remove('selected'));
            this.parentElement.classList.add('selected');
        });
    });
    </script>
    <?php
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $username = $_POST['username'];
        $password = $_POST['password'];
        $name = $_POST['name'];
        $gender = $_POST['gender'];
        $email = $_POST['email'];
        $phone_num = $_POST ['phonenum'];
    }

    include "conn.php";

    $sql = "INSERT INTO administrator(username, password, name, gender, email_address, phone_number) VALUES('$username','$password','$name','$gender', '$email', '$phone_num');";

    if (!$dbConn->query($sql)) {
        die("Failed to update Laptop table");
    }
    $dbConn->close();

    echo "<script>alert('Sucessfully insert data')</script>"
?>
</body>

</html>

