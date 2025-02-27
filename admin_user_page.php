<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
 9
        <div class="member-container">
            <input type="text" class="search-bar" placeholder="Search">
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
                                    echo "<tr>";
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
                                echo "<tr class='no-data'><td colspan='10'>No data available</td></tr>";
                                $sql="TRUNCATE TABLE member";
                            }
                        ?>
                </table>
            </div>
        </div>
    </div>
    <script>
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

