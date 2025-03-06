<!DOCTYPE html>
<html lang="en">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MewFit Admin</title>
    <link rel="stylesheet" href="./css/navigation_bar.css">
    <link rel="stylesheet" href="./css/admin_homepage.css">
    <script src="js/navigation_bar.js"></script>
    <script src="js/admin_homepage.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

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
                    <div class="chart">
                        <div>
                            <h4>Gender vs Fitness Goal Distribution (Month)</h4>
                            <canvas id="CumulativeGenderChart"></canvas>
                        </div>
                        <div>
                            <h4>Age vs Fitness Goal Distribution</h4>
                            <canvas id="OverallAgeChart"></canvas>
                        </div>
                        <div>
                            <h4>BMI vs Weight Change Distribution</h4>
                            <canvas id="WeightChangeBmiChart"></canvas>
                        </div>
                    </div>
                    
                    <?php 
                        //---------------------------------- 1st CHART --------------------------------------------
                        $sql = "SELECT 
                            DATE_FORMAT(date_registered, '%b %Y') AS month_year, 
                            DATE_FORMAT(date_registered, '%b') AS month,
                            YEAR(date_registered) AS year,
                            MONTH(date_registered) AS month_num,
                            COUNT(CASE WHEN gender = 'Male' THEN 1 END) AS male_new, 
                            COUNT(CASE WHEN gender = 'Female' THEN 1 END) AS female_new,
                            SUM(CASE WHEN fitness_goal = 'Lose Weight' THEN 1 ELSE 0 END) AS lose_weight,
                            SUM(CASE WHEN fitness_goal = 'Gain Muscle' THEN 1 ELSE 0 END) AS gain_muscle
                        FROM member 
                        WHERE YEAR(date_registered) BETWEEN (YEAR(CURDATE()) - 2) AND YEAR(CURDATE()) 
                        GROUP BY month_year, month, year, month_num
                        ORDER BY year, month_num";

                        $result = $dbConn->query($sql);
                        $data = $result->fetch_all(MYSQLI_ASSOC);

                        $male_cumulative = 0;
                        $female_cumulative = 0;
                        $lose_weight_cumulative = 0;
                        $gain_muscle_cumulative = 0;

                        foreach ($data as &$row) {
                            $male_cumulative += intval($row['male_new']);
                            $female_cumulative += intval($row['female_new']);
                            $lose_weight_cumulative += intval($row['lose_weight']);
                            $gain_muscle_cumulative += intval($row['gain_muscle']);
                            
                            $row['male_total'] = $male_cumulative;
                            $row['female_total'] = $female_cumulative;
                            $row['lose_weight_total'] = $lose_weight_cumulative;
                            $row['gain_muscle_total'] = $gain_muscle_cumulative;
                        }

                        // ------------------------------2nd CHART: Age Distribution Data---------------------------------
                        $sql2 = "SELECT 
                            SUM(CASE WHEN age < 18 THEN 1 ELSE 0 END) AS under_18,
                            SUM(CASE WHEN age BETWEEN 18 AND 24 THEN 1 ELSE 0 END) AS age_18_24,
                            SUM(CASE WHEN age BETWEEN 25 AND 34 THEN 1 ELSE 0 END) AS age_25_34,
                            SUM(CASE WHEN age BETWEEN 35 AND 44 THEN 1 ELSE 0 END) AS age_35_44,
                            SUM(CASE WHEN age BETWEEN 45 AND 54 THEN 1 ELSE 0 END) AS age_45_54,
                            SUM(CASE WHEN age BETWEEN 55 AND 64 THEN 1 ELSE 0 END) AS age_55_64,
                            SUM(CASE WHEN age >= 65 THEN 1 ELSE 0 END) AS age_65_plus,
                            SUM(CASE WHEN age < 18 AND fitness_goal = 'Lose Weight' THEN 1 ELSE 0 END) AS under_18_lose_weight,
                            SUM(CASE WHEN age < 18 AND fitness_goal = 'Gain Muscle' THEN 1 ELSE 0 END) AS under_18_gain_muscle,
                            SUM(CASE WHEN age BETWEEN 18 AND 24 AND fitness_goal = 'Lose Weight' THEN 1 ELSE 0 END) AS age_18_24_lose_weight,
                            SUM(CASE WHEN age BETWEEN 18 AND 24 AND fitness_goal = 'Gain Muscle' THEN 1 ELSE 0 END) AS age_18_24_gain_muscle,
                            SUM(CASE WHEN age BETWEEN 25 AND 34 AND fitness_goal = 'Lose Weight' THEN 1 ELSE 0 END) AS age_25_34_lose_weight,
                            SUM(CASE WHEN age BETWEEN 25 AND 34 AND fitness_goal = 'Gain Muscle' THEN 1 ELSE 0 END) AS age_25_34_gain_muscle,
                            SUM(CASE WHEN age BETWEEN 35 AND 44 AND fitness_goal = 'Lose Weight' THEN 1 ELSE 0 END) AS age_35_44_lose_weight,
                            SUM(CASE WHEN age BETWEEN 35 AND 44 AND fitness_goal = 'Gain Muscle' THEN 1 ELSE 0 END) AS age_35_44_gain_muscle,
                            SUM(CASE WHEN age BETWEEN 45 AND 54 AND fitness_goal = 'Lose Weight' THEN 1 ELSE 0 END) AS age_45_54_lose_weight,
                            SUM(CASE WHEN age BETWEEN 45 AND 54 AND fitness_goal = 'Gain Muscle' THEN 1 ELSE 0 END) AS age_45_54_gain_muscle,
                            SUM(CASE WHEN age BETWEEN 55 AND 64 AND fitness_goal = 'Lose Weight' THEN 1 ELSE 0 END) AS age_55_64_lose_weight,
                            SUM(CASE WHEN age BETWEEN 55 AND 64 AND fitness_goal = 'Gain Muscle' THEN 1 ELSE 0 END) AS age_55_64_gain_muscle,
                            SUM(CASE WHEN age >= 65 AND fitness_goal = 'Lose Weight' THEN 1 ELSE 0 END) AS age_65_plus_lose_weight,
                            SUM(CASE WHEN age >= 65 AND fitness_goal = 'Gain Muscle' THEN 1 ELSE 0 END) AS age_65_plus_gain_muscle
                        FROM member";

                        $result2 = $dbConn->query($sql2);
                        $data2 = $result2->fetch_assoc();

                        //---------------------------------CHART 3----------------------------------------------
                        $sql3 = "SELECT height, weight, target_weight FROM member";
                        $result3 = $dbConn->query($sql3);
                        $data3 = $result3->fetch_all(MYSQLI_ASSOC);

                        // Process the data for BMI and weight change analysis
                        $memberData = [];

                        foreach ($data3 as $row) {
                            if ($row['height'] > 0 && $row['weight'] > 0 && $row['target_weight'] > 0) {
                                $height = $row['height'] / 100; // Convert to meters
                                $weight = $row['weight'];
                                $targetWeight = $row['target_weight'];
                                
                                // Calculate BMI
                                $bmi = $weight / ($height * $height);
                                
                                // Calculate weight change (target - current)
                                $weightChange = $targetWeight - $weight;
                                
                                // Store processed data
                                $memberData[] = [
                                    'bmi' => $bmi,
                                    'weightChange' => $weightChange
                                ];
                            }
                        }

                        // Create data structure for the BMI categories and weight change bins
                        $weightChangeBins = [
                            [-20, -15],
                            [-15, -10],
                            [-10, -5],
                            [-5, 0],
                            [0, 5],
                            [5, 10],
                            [10, 15],
                            [15, 20]
                        ];

                        $bmiCategories = [
                            ['name' => 'Underweight', 'min' => 0, 'max' => 18.5, 'color' => 'rgba(135, 185, 250, 0.7)'],
                            ['name' => 'Normal weight', 'min' => 18.5, 'max' => 25, 'color' => 'rgba(154, 255, 154, 0.7)'],
                            ['name' => 'Overweight', 'min' => 25, 'max' => 30, 'color' => 'rgba(255, 188, 64, 0.7)'],
                            ['name' => 'Obesity', 'min' => 30, 'max' => 100, 'color' => 'rgba(255, 122, 151, 0.7)']
                        ];

                        // Count members in each BMI category and weight change bin
                        $bmiWeightChangeData = [];

                        foreach ($bmiCategories as $category) {
                            $counts = [];
                            
                            foreach ($weightChangeBins as $bin) {
                                $count = 0;
                                foreach ($memberData as $member) {
                                    if ($member['bmi'] >= $category['min'] && 
                                        $member['bmi'] < $category['max'] && 
                                        $member['weightChange'] >= $bin[0] && 
                                        $member['weightChange'] < $bin[1]) {
                                        $count++;
                                    }
                                }
                                $counts[] = $count;
                            }
                            
                            $bmiWeightChangeData[] = [
                                'category' => $category['name'],
                                'color' => $category['color'],
                                'counts' => $counts
                            ];
                        }


                        // Convert the bins into readable labels
                        $weightChangeBinLabels = [];
                        foreach ($weightChangeBins as $bin) {
                            $weightChangeBinLabels[] = $bin[0] . ' to ' . $bin[1] . 'kg';
                        }
                        ?>

                    <script>
                    document.addEventListener("DOMContentLoaded", function() {
                        //--------------------------------1ST CHART------------------------------------------
                        const ctx1 = document.getElementById('CumulativeGenderChart').getContext('2d');
                        const data = <?php echo json_encode($data); ?>;
                        const labels = data.map(item => `${item.month} ${item.year}`);
                        
                        const maleTotalData = data.map(item => parseInt(item.male_total));
                        const femaleTotalData = data.map(item => parseInt(item.female_total));
                        const loseWeightTotalData = data.map(item => parseInt(item.lose_weight_total));
                        const gainMuscleTotalData = data.map(item => parseInt(item.gain_muscle_total));
                        
                        const maleNewData = data.map(item => parseInt(item.male_new));
                        const femaleNewData = data.map(item => parseInt(item.female_new));
                        const loseWeightNewData = data.map(item => parseInt(item.lose_weight));
                        const gainMuscleNewData = data.map(item => parseInt(item.gain_muscle));
                        

                        new Chart(ctx1, {
                            type: 'bar',
                            data: {
                                labels: labels,
                                datasets: [
                                    {
                                        label: 'Total Male',
                                        data: maleTotalData,
                                        type: 'line',
                                        borderColor: 'rgb(23, 193, 255)', 
                                        backgroundColor: 'rgba(0, 0, 255, 0)', 
                                        borderWidth: 2,
                                        pointRadius: 1, 
                                        pointHoverRadius: 7, 
                                        pointHoverBackgroundColor: 'rgb(23, 193, 255)',
                                        pointHoverBorderColor: 'white', 
                                        tension: 0.2,
                                        fill: true,
                                        newData: maleNewData
                                    },
                                    {
                                        label: 'Total Female',
                                        data: femaleTotalData,
                                        type: 'line',
                                        borderColor: 'rgb(255, 23, 185)',
                                        backgroundColor: 'rgba(0, 0, 255, 0)', 
                                        borderWidth: 2,
                                        pointRadius: 1, 
                                        pointHoverRadius: 7, 
                                        pointHoverBackgroundColor: 'rgb(255, 23, 185)',
                                        pointHoverBorderColor: 'white', 
                                        tension: 0.2,
                                        fill: true,
                                        newData: femaleNewData
                                    },
                                    {
                                        label: 'Total Lose Weight',
                                        data: loseWeightTotalData,
                                        type: 'bar', 
                                        backgroundColor: 'rgb(255, 155, 155)',
                                        newData: loseWeightNewData
                                    },
                                    {
                                        label: 'Total Gain Muscle',
                                        data: gainMuscleTotalData,
                                        type: 'bar', 
                                        backgroundColor: 'rgb(255, 223, 135)',
                                        newData: gainMuscleNewData
                                    }
                                ]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: function(tooltipItem) {
                                                let datasetLabel = tooltipItem.dataset.label;
                                                let totalValue = tooltipItem.raw; 
                                                let newValue = tooltipItem.dataset.newData[tooltipItem.dataIndex]; 
                                                
                                                return [
                                                    `Total: ${totalValue}`,
                                                    `This month: ${newValue}`
                                                ];
                                            }
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        ticks: {
                                            callback: function(value, index, values) {
                                                return (labels[index].includes("Jan") || labels[index].includes("Jun")) ? labels[index] : ''; 
                                            }
                                        }
                                    },
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }
                        });

                        //--------------------------------2ND CHART------------------------------------------
                        const ctx2 = document.getElementById('OverallAgeChart').getContext('2d');
                        const ageData = <?php echo json_encode($data2); ?>;

                        const ageCounts = [
                            parseInt(ageData.under_18) || 0,
                            parseInt(ageData.age_18_24) || 0,
                            parseInt(ageData.age_25_34) || 0,
                            parseInt(ageData.age_35_44) || 0,
                            parseInt(ageData.age_45_54) || 0,
                            parseInt(ageData.age_55_64) || 0,
                            parseInt(ageData.age_65_plus) || 0
                        ];

                        const loseWeightData = [
                            parseInt(ageData.under_18_lose_weight) || 0,
                            parseInt(ageData.age_18_24_lose_weight) || 0,
                            parseInt(ageData.age_25_34_lose_weight) || 0,
                            parseInt(ageData.age_35_44_lose_weight) || 0,
                            parseInt(ageData.age_45_54_lose_weight) || 0,
                            parseInt(ageData.age_55_64_lose_weight) || 0,
                            parseInt(ageData.age_65_plus_lose_weight) || 0
                        ];

                        const gainMuscleData = [
                            parseInt(ageData.under_18_gain_muscle) || 0,
                            parseInt(ageData.age_18_24_gain_muscle) || 0,
                            parseInt(ageData.age_25_34_gain_muscle) || 0,
                            parseInt(ageData.age_35_44_gain_muscle) || 0,
                            parseInt(ageData.age_45_54_gain_muscle) || 0,
                            parseInt(ageData.age_55_64_gain_muscle) || 0,
                            parseInt(ageData.age_65_plus_gain_muscle) || 0
                        ];

                        new Chart(ctx2, {
                            type: 'doughnut',
                            data: {
                                labels: ['Under 18', '18-24', '25-34', '35-44', '45-54', '55-64', '65 and over'],
                                datasets: [{
                                    label: 'Age Distribution',
                                    data: ageCounts,
                                    backgroundColor: [
                                        'rgb(255, 161, 182)',
                                        'rgb(255, 198, 132)',
                                        'rgb(255, 244, 149)',
                                        'rgb(156, 255, 158)',
                                        'rgb(167, 255, 254)',
                                        'rgb(195, 187, 255)',
                                        'rgb(255, 183, 245)'
                                    ],
                                    borderColor: ['rgba(255, 255, 255, 1)'],
                                    borderWidth: 2
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(tooltipItem) {
                                                const ageCategory = tooltipItem.label;
                                                const totalValue = tooltipItem.raw;
                                                const index = tooltipItem.dataIndex;

                                                const loseWeight = loseWeightData[index];
                                                const gainMuscle = gainMuscleData[index];

                                                return [
                                                    `Total: ${totalValue}`,
                                                    `Lose Weight: ${loseWeight}`,
                                                    `Gain Muscle: ${gainMuscle}`
                                                ];
                                            }
                                        }
                                    }
                                }
                            }
                        });

                        //---------------------CHART 3----------------------------------------------
                        const ctx3 = document.getElementById('WeightChangeBmiChart').getContext('2d');
                        const bmiData = <?php echo json_encode($bmiWeightChangeData); ?>;
                        
                        const weightChangeBinLabels = <?php echo json_encode($weightChangeBinLabels); ?>;
                        const datasets = bmiData.map(category => {
                            return {
                                label: category.category,
                                data: category.counts,
                                backgroundColor: category.color,
                                borderColor: category.color.replace('0.7', '1'),
                            };
                        });

                        new Chart(ctx3, {
                            type: 'bar',
                            data: {
                                labels: weightChangeBinLabels,
                                datasets: datasets
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    x: {
                                        stacked: true,
                                        title: {
                                            display: true,
                                            text: 'Weight Change (kg)'
                                        }
                                    },
                                    y: {
                                        stacked: true,
                                        beginAtZero: true,
                                        title: {
                                            display: true,
                                            text: 'Number of Members'
                                        }
                                    }
                                },
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: function(tooltipItem) {
                                                const bmiCategory = tooltipItem.dataset.label;
                                                const count = tooltipItem.raw;
                                                return `${bmiCategory}: ${count} members`;
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    });
                    </script>

                </div>
                <div class="containers">
                    <h3>User Activity</h3>
                    <div class="chart">
                        <div>
                            <h4>Fitness Goal vs Level Distribution</h4>
                            <canvas id="levelChart"></canvas>
                        </div>
                        <div>
                            <h4>Target Weight vs Day Streak Distribution</h4>
                            <canvas id="dayStreakChart"></canvas>
                        </div>
                        <div>
                            <h4>Age vs Level Distribution</h4>
                            <canvas id="ageChart"></canvas>
                        </div>
                    </div>
                    <?php 
                $sqlLevel = "SELECT 
                CASE 
                    WHEN level BETWEEN 1 AND 10 THEN '1-10'
                    WHEN level BETWEEN 11 AND 20 THEN '11-20'
                    WHEN level BETWEEN 21 AND 30 THEN '21-30'
                    WHEN level BETWEEN 31 AND 40 THEN '31-40'
                    WHEN level BETWEEN 41 AND 50 THEN '41-50'
                END AS level_range,
                SUM(CASE WHEN fitness_goal = 'Lose Weight' THEN 1 ELSE 0 END) AS lose_weight,
                SUM(CASE WHEN fitness_goal = 'Gain Muscle' THEN 1 ELSE 0 END) AS gain_muscle
            FROM 
                member
            WHERE 
                level BETWEEN 1 AND 50
            GROUP BY 
                level_range
            ORDER BY 
                level_range";
            
            $resultLevel = $dbConn->query($sqlLevel);
            $dataLevel = $resultLevel->fetch_all(MYSQLI_ASSOC);

            $sqlAgeLevel = "SELECT 
                    age,
                    level
                FROM 
                    member
                WHERE 
                    level BETWEEN 1 AND 50
                ORDER BY 
                    age";

            $resultAgeLevel = $dbConn->query($sqlAgeLevel);
            $dataAgeLevel = $resultAgeLevel->fetch_all(MYSQLI_ASSOC);

            // Prepare data for the area chart
            $ageData = [];
            $levelData = [];

            foreach ($dataAgeLevel as $row) {
                $ageData[] = $row['age'];
                $levelData[] = $row['level'];
            }
            ?>

            <script>
            document.addEventListener("DOMContentLoaded", function() {
                
                const ctxAge = document.getElementById('ageChart').getContext('2d');
                const ageData = <?php echo json_encode($ageData); ?>; // Convert PHP data to JavaScript
                const levelData = <?php echo json_encode($levelData); ?>; // Convert PHP data to JavaScript

                // Create the area chart
                new Chart(ctxAge, {
                    type: 'line', // Use 'line' type for area chart
                    data: {
                        labels: ageData,
                        datasets: [{
                            label: 'Level Distribution',
                            data: levelData,
                            fill: true, // Fill the area under the line
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                title: {
                                    display: true,
                                    text: 'Age' // Title for x-axis
                                }
                            },
                            y: {
                                title: {
                                    display: true,
                                    text: 'Level' // Title for y-axis
                                },
                                beginAtZero: true // Start y-axis at zero
                            }
                        }
                    }
                });
                // Level vs Fitness Goal Chart
                const ctxLevel = document.getElementById('levelChart').getContext('2d');
                const levelData = <?php echo json_encode($dataLevel); ?>;
                
                const levelLabels = levelData.map(item => item.level_range);
                const loseWeightData = levelData.map(item => parseInt(item.lose_weight) || 0);
                const gainMuscleData = levelData.map(item => parseInt(item.gain_muscle) || 0);
                
                new Chart(ctxLevel, {
                    type: 'bar',
                    data: {
                        labels: levelLabels,
                        datasets: [
                            {
                                label: 'Lose Weight',
                                data: loseWeightData,
                                backgroundColor: 'rgb(255, 155, 155)',
                            },
                            {
                                label: 'Gain Muscle',
                                data: gainMuscleData,
                                backgroundColor: 'rgb(255, 223, 135)',
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            x: {
                                stacked: true,
                                title: {
                                    display: true,
                                    text: 'Level Range'
                                }
                            },
                            y: {
                                stacked: true,
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: 'Number of Members'
                                }
                            }
                        }
                    }
                });
            });
            </script>
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