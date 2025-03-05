<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MewFit Admin</title>
    <link rel="stylesheet" href="./css/admin_homepage.css">
    <link rel="icon" type="image/x-icon" href="./assets/icons/cat-logo-tabs.png">
</head>
<?php include "conn.php" ?>
<body>
    <h1>Hello, <span style="color:#FF9F39">admin</span></h1>
    <section class="summary-container">
        <div class="summary" style="background-color:#DBFAFF">
        <div class="summary" style="background-color:#DBFAFF">
    <?php
    $current_month = date('Y-m');
    $member_sql = "SELECT COUNT(*) AS total_members FROM member WHERE DATE_FORMAT(date_registered, '%Y-%m') = '$current_month'";
    $member_result = $conn->query($member_sql);
    $member_row = $member_result->fetch_assoc();
    $current_member_count = $member_row['total_members'];

    $admin_sql = "SELECT COUNT(*) AS total_admins FROM admin WHERE DATE_FORMAT(date_registered, '%Y-%m') = '$current_month'";
    $admin_result = $conn->query($admin_sql);
    $admin_row = $admin_result->fetch_assoc();
    $current_admin_count = $admin_row['total_admins'];

    // Fetch total number of users and admins for the previous month
    $previous_month = date('Y-m', strtotime('last month'));
    $prev_member_sql = "SELECT COUNT(*) AS total_members FROM member WHERE DATE_FORMAT(registration_date, '%Y-%m') = '$previous_month'";
    $prev_member_result = $conn->query($prev_member_sql);
    $prev_member_row = $prev_member_result->fetch_assoc();
    $prev_member_count = $prev_member_row['total_members'];

    $prev_admin_sql = "SELECT COUNT(*) AS total_admins FROM admin WHERE DATE_FORMAT(registration_date, '%Y-%m') = '$previous_month'";
    $prev_admin_result = $conn->query($prev_admin_sql);
    $prev_admin_row = $prev_admin_result->fetch_assoc();
    $prev_admin_count = $prev_admin_row['total_admins'];

    // Calculate the total number of users and admins for the current and previous months
    $current_total = $current_member_count + $current_admin_count;
    $prev_total = $prev_member_count + $prev_admin_count;

    // Calculate the percentage change
    if ($prev_total > 0) {
        $increase_percentage = (($current_total - $prev_total) / $prev_total) * 100;
    } else {
        $increase_percentage = 0; // Avoid division by zero
    }

    // Close the connection
    $conn->close();
    ?>

    <div>
        <h5>User</h5>
        <h6><?php echo $current_total; ?></h6>
        <p>Increase by <?php echo round($increase_percentage, 2); ?>%</p>
    </div>
</div>
        <div>
                <h5>User</h5>
                <h6>23</h6>
                <p>Increase by 5%</p>
            </div>
            <img src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png">
        </div>
        <div class="summary" style="background-color:#FFF1DB">
            <div>
                <h5>Workout</h5>
                <h6>23</h6>
                <p>Increase by 5%</p>
            </div>
            <img src="https://png.pngtree.com/png-vector/20230407/ourmid/pngtree-workout-line-icon-vector-png-image_6680960.png"  style="width:100px;height:100px; ">
        </div>
        <div class="summary" style="background-color:#FFDBDB">
            <div>
                <h5>Diet</h5>
                <h6>23</h6>
                <p>Increase by 5%</p>
            </div>
            <img src="https://cdn-icons-png.flaticon.com/512/706/706133.png">
        </div>
    </section>

    <section>
        <h2>User Analysis</h2>
        <div>
            <div class="containers">
                <h3>User Personal Information</h3>
            </div>
            <div class="containers">
                <h3>User Activity</h3>
            </div>
        </div>
    </section>

    <section>
        <h2>Workout Analysis</h2>
        <div>
            <div class="containers">
                <h3>Most viewed</h3>
            </div>
            <div class="containers">
                <h3>User favourite</h3>
            </div>
        </div>
    </section>

    <section>
        <h2>Diet Analysis</h2>
        <div>
            <div class="containers">
                <h3>Most viewed</h3>
            </div>
            <div class="containers">
                <h3>User favourite</h3>
            </div>
        </div>
    </section>
</body>
</html>