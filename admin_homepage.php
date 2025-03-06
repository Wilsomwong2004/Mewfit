<!DOCTYPE html>
<html lang="en">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MewFit Admin</title>
    <link rel="stylesheet" href="./css/navigation_bar.css">
    <link rel="stylesheet" href="./css/admin_homepage.css">
    <script src="js/navigation_bar.js"></script>
    <script src="js/admin_homepage.js"></script>
    <script src="path/to/chartjs/dist/chart.umd.js"></script>
</head>
<?php include "conn.php" ?>
<body>
    <nav class="navbar" id="navbar">
        <div class="nav-links" id="nav-links">
            <img src="./assets/icons/mewfit-admin-logo.svg" alt="logo" class="nav-logo" id="nav-logo">
            <span class="admin-dashboard"><a href="#" class="active">DASHBOARD</a></span>
            <span class="admin-user"><a href="admin_user_page.php" >USER</a></span>
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

    <div class="content">
        <div style="display:flex;">
        <h1 id="type">Hello, <span style="color:#FF9F39">admin</span></h1>
        <h1 class="cursor">|</h1>
        </div>
        
        <section class="summary-container">
        <?php
            function getCount($dbConn, $table) {
                $sql = "SELECT COUNT(*) AS total FROM $table";
                return $dbConn->query($sql)->fetch_assoc()['total'] ?? 0;
            }
            function comparison($dbConn, $table){
                $currentYear = date('Y');
                $currentMonth = date('m');

                $sql = "SELECT COUNT(*) AS currentmonth FROM $table WHERE MONTH(date_registered) = $currentMonth AND YEAR(date_registered) = $currentYear";
                $currentResult = $dbConn->query($sql)->fetch_assoc()['currentmonth'] ?? 0;

                $sql = "SELECT COUNT(*) AS total FROM $table";
                $beforeResult = $dbConn->query($sql)->fetch_assoc()['total'] ?? 0;

                if ($currentResult == 0) {
                    return 0; 
                }

                $comparison = round($currentResult/$beforeResult *100 , 2); 
                return $comparison;
            }

            $memberNo = getCount($dbConn, 'member');
            $adminNo = getCount($dbConn, 'administrator');

            $memberCompare = comparison($dbConn,'member');
            $adminCompare = comparison($dbConn,'administrator');
            ?>
            <div class="summary" style="background-color:#DBFAFF;">
                <div>
                <h5>User</h5>
                <h6 class="count-up"><?php echo $adminNo + $memberNo; ?></h6>
                <p>Increase by <span class="count-up-p"><?php echo $memberCompare+$adminCompare; ?></span></p>
                </div>
                <img src="https://cdn-icons-png.flaticon.com/512/1077/1077063.png">
            </div>
            <div class="summary" style="background-color:#FFF1DB; animation-delay: 0.5s;">
                <div>
                    <h5>Workout</h5>
                    <h6 class="count-up"><?php echo getCount($dbConn, 'workout'); ?></h6>
                    <p>Increase by <span class="count-up-p"><?php echo comparison($dbConn,'workout');?></span></p>
                </div>
                <img src="https://png.pngtree.com/png-vector/20230407/ourmid/pngtree-workout-line-icon-vector-png-image_6680960.png"  style="width:100px;height:100px; ">
            </div>
            <div class="summary" style="background-color:#FFDBDB; animation-delay: 0.8s;">
                <div>
                    <h5>Diet</h5>
                    <h6 class="count-up"><?php echo getCount($dbConn, 'diet'); ?></h6>
                    <p>Increase by <span class="count-up-p"><?php echo comparison($dbConn,'diet');?></span></p>
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
    </div>
</body>
</html>