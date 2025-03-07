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
    <style>
        h3 {
        font-size: 20px !important;
        color: #795858 !important;
        margin-bottom: 20px;
        text-align: left !important;
        }
    </style>
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
        <!-- greetings -->
        <div style="display:flex;">
        <h1 id="type">Hello, <span style="color:#FF9F39">admin</span></h1>
        <h1 class="cursor">|</h1>
        </div>
        
        <!-- summary -->
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
                <p style="font-weight:bold;padding-bottom:10px;">Member: <?php echo $memberNo; ?> Admin: <?php echo $adminNo?></p>
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

        <!-- member analysis -->
        <section>
            <h2>Member Analysis</h2>
            <div>
                <div class="containers">
                    <h3>Member Personal Information</h3>
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
                    <h3>Member Activity</h3>
                    <div class="chart">
                        <div>
                            <h4>Fitness Goal vs Level Distribution</h4>
                            <canvas id="levelChart"></canvas>
                        </div>
                        <div>
                            <h4>Member vs Activity Performance Distribution</h4>
                            <canvas id="performanceChart"></canvas>
                        </div>
                        <div>
                            <h4>Age vs Level Distribution</h4>
                            <canvas id="ageChart"></canvas>
                        </div>
                        <div>
                            <h4>Performance Distribution</h4>
                            <canvas id="memberPerformanceChart"></canvas>
                        </div>
                    </div>
            
                    <?php 
                        //-------------------------CHART 1----------------------------------------
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

                        //--------------------------------------------CHART 2----------------------------
                        $sqlRegistered1 = "SELECT 
                            CONCAT(YEAR(date_registered), '-', LPAD(((MONTH(date_registered)-1) DIV 4)*4 + 1, 2, '0')) AS period, 
                            COUNT(*) AS registered_count
                        FROM member
                        GROUP BY period
                        ORDER BY period";

                        $resultRegistered = $dbConn->query($sqlRegistered1);
                        $registeredData = [];
                        while ($row = $resultRegistered->fetch_assoc()) {
                            $registeredData[$row['period']] = $row['registered_count'];
                        }

                        // Fetch performance data
                        $sqlPerformance = "SELECT 
                            CONCAT(YEAR(weeks_date_mon), '-', LPAD(((MONTH(weeks_date_mon)-1) DIV 4)*4 + 1, 2, '0')) AS period, 
                            SUM(workout_history_count + diet_history_count) AS total_performance
                        FROM member_performance
                        GROUP BY period
                        ORDER BY period";

                        $resultPerformance = $dbConn->query($sqlPerformance);
                        $performanceData = [];
                        while ($row = $resultPerformance->fetch_assoc()) {
                            $performanceData[$row['period']] = $row['total_performance'];
                        }

                        $periods = array_unique(array_merge(array_keys($registeredData), array_keys($performanceData)));
                        sort($periods);

                        $registeredCounts = [];
                        $cumulativeCount = 0; 

                        foreach ($periods as $period) {
                            $cumulativeCount += $registeredData[$period] ?? 0; 
                            $registeredCounts[] = $cumulativeCount; 
                        }

                        $performanceCounts = [];
                        foreach ($periods as $period) {
                            $performanceCounts[] = $performanceData[$period] ?? 0; 
                        }

                        $performanceCounts = array_map(function($value) {
                            return $value / 10;
                        }, $performanceCounts);
                        //------------------------------------------CHART 3-------------------------------
                        $sqlAgeLevel = "SELECT 
                            CASE 
                                WHEN age < 18 THEN 'Under 18'
                                WHEN age BETWEEN 18 AND 29 THEN '18-29'
                                WHEN age BETWEEN 30 AND 49 THEN '30-49'
                                ELSE '50+' 
                            END AS age_group,
                            CASE 
                                WHEN level BETWEEN 1 AND 10 THEN '1-10'
                                WHEN level BETWEEN 11 AND 20 THEN '11-20'
                                WHEN level BETWEEN 21 AND 30 THEN '21-30'
                                WHEN level BETWEEN 31 AND 40 THEN '31-40'
                                ELSE '41-50'
                            END AS level_range,
                            COUNT(*) AS count
                        FROM 
                            member
                        GROUP BY 
                            age_group, level_range
                        ORDER BY 
                            FIELD(age_group, 'Under 18', '18-29', '30-49', '50+'), 
                            FIELD(level_range, '1-10', '11-20', '21-30', '31-40', '41-50')";

                        $resultAgeLevel = $dbConn->query($sqlAgeLevel);
                        $dataAgeLevel = $resultAgeLevel->fetch_all(MYSQLI_ASSOC);

                        $ageGroups = ['Under 18', '18-29', '30-49', '50+'];
                        $levelRanges = ['1-10', '11-20', '21-30', '31-40', '41-50'];

                        $chartData = [];

                        foreach ($ageGroups as $ageGroup) {
                            $chartData[$ageGroup] = array_fill(0, count($levelRanges), 0);
                        }

                        foreach ($dataAgeLevel as $row) {
                            $ageIndex = array_search($row['age_group'], $ageGroups);
                            $levelIndex = array_search($row['level_range'], $levelRanges);
                            if ($ageIndex !== false && $levelIndex !== false) {
                                $chartData[$row['age_group']][$levelIndex] = $row['count'];
                            }
                        }

                        //-------------------------------------------------------CHART 4-------------------------------
                        $sqlDistinctRegistrationPeriods = "SELECT DISTINCT CONCAT(YEAR(date_registered), '-', LPAD(((MONTH(date_registered)-1) DIV 4)*4 + 1, 2, '0')) AS period 
                                    FROM member ORDER BY period";
                        $resultDistinctRegistrationPeriods = $dbConn->query($sqlDistinctRegistrationPeriods);
                        $uniqueRegistrationPeriods = []; 

                        while ($row = $resultDistinctRegistrationPeriods->fetch_assoc()) {
                            $uniqueRegistrationPeriods[] = $row['period'];
                        }

                        $performanceDataByPeriod = []; 
                        foreach ($uniqueRegistrationPeriods as $currentRegPeriod) {
                            $sqlPerformanceData = "SELECT 
                                                        CONCAT(YEAR(weeks_date_mon), '-', LPAD(((MONTH(weeks_date_mon)-1) DIV 4)*4 + 1, 2, '0')) AS period,
                                                        SUM(workout_history_count + diet_history_count) AS total_performance
                                                    FROM member_performance
                                                    WHERE member_id IN (
                                                        SELECT member_id FROM member WHERE 
                                                        CONCAT(YEAR(date_registered), '-', LPAD(((MONTH(date_registered)-1) DIV 4)*4 + 1, 2, '0')) = '$currentRegPeriod'
                                                    )
                                                    GROUP BY period
                                                    ORDER BY period";

                            $resultPerformanceData = $dbConn->query($sqlPerformanceData);
                            
                            $performanceDataByPeriod[$currentRegPeriod] = [];
                            while ($row = $resultPerformanceData->fetch_assoc()) {
                                $performanceDataByPeriod[$currentRegPeriod][$row['period']] = $row['total_performance'] / 20;
                            }
                        }

                        $allUniquePeriods = []; 
                        foreach ($performanceDataByPeriod as $data) {
                            $allUniquePeriods = array_merge($allUniquePeriods, array_keys($data));
                        }
                        $allUniquePeriods = array_unique($allUniquePeriods);
                        sort($allUniquePeriods);

                        // Prepare datasets for output
                        $chartDatasets = []; // Renamed from $datasets
                        foreach ($uniqueRegistrationPeriods as $currentRegPeriod) {
                            $dataPointsForPeriod = []; // Renamed from $dataPoints
                            foreach ($allUniquePeriods as $currentPeriod) {
                                $dataPointsForPeriod[] = $performanceDataByPeriod[$currentRegPeriod][$currentPeriod] ?? 0; 
                            }
                            $chartDatasets[] = [
                                "label" => "Member registered " . $currentRegPeriod,
                                "data" => $dataPointsForPeriod
                            ];
                        }
                        ?>

                    <script>
                    document.addEventListener("DOMContentLoaded", function() {
                        //------------------------CHART 1------------------------------
                        const ctxLevel = document.getElementById('levelChart').getContext('2d');
                        const levelData3 = <?php echo json_encode($dataLevel); ?>;
                        
                        const levelLabels = levelData3.map(item => item.level_range);
                        const loseWeightData = levelData3.map(item => parseInt(item.lose_weight) || 0);
                        const gainMuscleData = levelData3.map(item => parseInt(item.gain_muscle) || 0);
                        
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

                        
                        //------------------------CHART 2-----------------------------
                        const ctx6 = document.getElementById('performanceChart').getContext('2d');

                        const periods = <?php echo json_encode($periods); ?>;
                        const registeredData = <?php echo json_encode($registeredCounts, JSON_NUMERIC_CHECK); ?>; 
                        const performanceData = <?php echo json_encode($performanceCounts, JSON_NUMERIC_CHECK); ?>;

                        new Chart(ctx6, {
                            type: 'line', 
                            data: {
                                labels: periods,
                                datasets: [
                                    {
                                        label: 'Member Performance',
                                        data: performanceData,
                                        backgroundColor: 'rgba(255, 197, 210, 0)',
                                        borderColor: 'rgb(255, 131, 158)',
                                        borderWidth: 2,
                                        pointStyle: false,
                                    },
                                    {
                                        label: 'Total Member Registrations',
                                        data: registeredData,
                                        backgroundColor: 'rgb(159, 247, 255)',
                                        borderColor: 'rgb(159, 247, 255)',
                                        borderWidth: 2,
                                        pointStyle: false,
                                        fill: true
                                    }
                                ]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    x: {
                                        title: { display: true, text: 'Date Range' }
                                    },
                                    y: {
                                        title: { display: true, text: 'Number of Members' },
                                        beginAtZero: true
                                    }
                                }
                            }
                        });
                        
                        //-----------------------------CHART 3----------------------------------
                        const ctxBar = document.getElementById('ageChart').getContext('2d');
            
                        const levelLabels2 = <?php echo json_encode($levelRanges); ?>;
                        const ageGroupData = <?php echo json_encode(array_values($chartData), JSON_NUMERIC_CHECK); ?>;
                        const ageGroupLabels = <?php echo json_encode(array_keys($chartData)); ?>;

                        const customColors = {
                            'Under 18': 'rgb(255, 206, 241)',
                            '18-29': 'rgb(255, 210, 151)',
                            '30-49': 'rgb(192, 228, 255)',
                            '50+': 'rgb(215, 197, 255)'
                        };

                        new Chart(ctxBar, {
                            type: 'bar',
                            data: {
                                labels: levelLabels2,
                                datasets: ageGroupLabels.map((ageGroup) => ({
                                    label: ageGroup,
                                    data: ageGroupData[ageGroupLabels.indexOf(ageGroup)],
                                    backgroundColor: customColors[ageGroup],
                                    borderColor: customColors[ageGroup].replace('0.5', '1'), // Make border color opaque
                                    borderWidth: 1
                                }))
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: 'Level Ranges'
                                        }
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: 'Number of member'
                                        },
                                        beginAtZero: true
                                    }
                                },
                                plugins: {
                                    legend: {
                                        position: 'top'
                                    }
                                }
                            }
                        });

                        //--------------------------------CHART 4----------------------------------
                        const ctxMemberPerformance = document.getElementById('memberPerformanceChart').getContext('2d');

                        const performancePeriods = <?php echo json_encode($allUniquePeriods); ?>; // Renamed from periods
                        const performanceDatasets = <?php echo json_encode($chartDatasets, JSON_NUMERIC_CHECK); ?>; // Renamed from datasets

                        function generateColor(index) {
                            const colorPalette = [ // Renamed from colors
                                'rgb(255, 160, 180)', 'rgb(128, 204, 255)', 
                                'rgb(255, 207, 86)', 'rgb(179, 255, 156)', 
                                'rgb(212, 191, 255)', 'rgb(255, 160, 64)'
                            ];
                            return colorPalette[index % colorPalette.length];
                        }

                        new Chart(ctxMemberPerformance, {
                            type: 'line', 
                            data: {
                                labels: performancePeriods,
                                datasets: performanceDatasets.map((dataset, index) => ({
                                    ...dataset,
                                    borderColor: generateColor(index),
                                    backgroundColor: "rgba(179, 255, 156, 0)",
                                    borderWidth: 2,
                                    tension: 0.05,
                                    pointRadius: 1,
                                    pointHoverRadius: 5,
                                    pointHoverBackgroundColor: generateColor(index),
                                    fill: true
                                }))
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    x: {
                                        title: { display: true, text: 'Date' }
                                    },
                                    y: {
                                        title: { display: true, text: 'Performance Score' },
                                        beginAtZero: true
                                    }
                                },
                                plugins: {
                                    legend: { position: 'top' }
                                }
                            }
                        });
                    });
                    </script>        
                </div>
            </div>
        </section>

        <!-- workout analysis -->
        <section>
            <h2>Workout Analysis</h2>
            <div>
                <div class="containers">
                    <div class="chart">
                        <div>
                            <h4>Members' Favourite on Workout Type</h4>
                            <canvas id="workoutPopularityChart"></canvas>
                        </div>
                        <div>
                            <h4>Member's Preference on Duration</h4>
                            <div>
                                <canvas id="durationChart" width="500" height="300"></canvas>
                            </div>
                        </div>
                        <div>
                            <h4>Member's Preference on Calories</h4>
                            <div>
                                <canvas id="caloriesChart" width="500" height="300"></canvas>
                            </div>
                        </div>
                        <div>
                            <h4>Workout vs Member Performance</h4> 
                            <canvas id="workoutPerformanceChart"></canvas>
                        </div>
                    </div>
                </div>
                <!-- ----------------------------CHART 1---------------------- -->
                <?php
                $sqlWorkoutTypes = "SELECT DISTINCT workout_type FROM workout";
                $resultWorkoutTypes = $dbConn->query($sqlWorkoutTypes);

                $workoutTypes = [];
                while ($row = $resultWorkoutTypes->fetch_assoc()) {
                    $workoutTypes[] = $row['workout_type'];
                }

                $workoutData = [];
                foreach ($workoutTypes as $type) {
                    $sqlHistory = "SELECT COUNT(workout_history_id) AS workout_count
                                FROM workout_history
                                WHERE workout_id IN (
                                    SELECT workout_id FROM workout WHERE workout_type = '$type'
                                )";

                    $resultHistory = $dbConn->query($sqlHistory);
                    $workoutData[$type] = $resultHistory->fetch_assoc()['workout_count'] ?? 0;
                }

                $colors = [
                    "Cardio" => "rgba(255, 154, 176, 0.84)", 
                    "Weighted" => "rgba(104, 195, 255, 0.85)", 
                    "Weight-Free" => "rgba(255, 217, 122, 0.84)", 
                    "Yoga" => "rgba(180, 255, 139, 0.85)"
                ];

                $dataset = [
                    "labels" => array_keys($workoutData),
                    "data" => array_values($workoutData),
                    "backgroundColor" => array_values($colors),
                ];

                //CHART 2 and 3

                $sqlWorkoutData = "SELECT 
                w.workout_type,
                w.calories,
                w.duration,
                COUNT(wh.workout_id) AS workout_count
                FROM workout w
                LEFT JOIN workout_history wh ON w.workout_id = wh.workout_id
                WHERE w.workout_type IN ('weighted', 'yoga', 'weight-free', 'cardio')
                GROUP BY w.workout_type, w.calories, w.duration";

                $resultWorkoutData = $dbConn->query($sqlWorkoutData);

                $workoutData = [
                    'weighted' => [],
                    'yoga' => [],
                    'weight-free' => [],
                    'cardio' => []
                ];

                while ($row = $resultWorkoutData->fetch_assoc()) {
                    $workoutType = $row['workout_type'];
                    $workoutData[$workoutType][] = [
                        'calories' => $row['calories'],
                        'duration' => $row['duration'],
                        'workout_count' => $row['workout_count']
                    ];
                }

                // CHART 4
                $sqlDistinctWorkoutTypes = "SELECT DISTINCT workout_type FROM workout";
                $resultDistinctWorkoutTypes = $dbConn->query($sqlDistinctWorkoutTypes);

                $allWorkoutTypes = []; 
                while ($row = $resultDistinctWorkoutTypes->fetch_assoc()) {
                    $allWorkoutTypes[] = $row['workout_type'];
                }

                $workoutCountsByType = [];
                $performanceDataByPeriod = []; 
                $allTimePeriods = []; 

                $cumulativeWorkoutCountsByType = []; 
                foreach ($allWorkoutTypes as $currentWorkoutType) {
                    $sqlWorkoutHistoryByType = "SELECT 
                                                    CONCAT(YEAR(date), '-', LPAD(((MONTH(date)-1) DIV 6)*6 + 1, 2, '0')) AS period,
                                                    COUNT(workout_history_id) AS total_workout_count
                                                FROM workout_history
                                                WHERE workout_id IN (
                                                    SELECT workout_id FROM workout WHERE workout_type = '$currentWorkoutType'
                                                )
                                                GROUP BY period
                                                ORDER BY period";

                    $resultWorkoutHistory = $dbConn->query($sqlWorkoutHistoryByType);
                    
                    $workoutCountsByType[$currentWorkoutType] = [];
                    $cumulativeWorkoutCount = 0;
                    while ($row = $resultWorkoutHistory->fetch_assoc()) {
                        $cumulativeWorkoutCount += $row['total_workout_count']; 
                        $workoutCountsByType[$currentWorkoutType][$row['period']] = $cumulativeWorkoutCount;
                        $allTimePeriods[] = $row['period'];
                    }
                }

                $sqlMemberPerformance = "SELECT 
                                            CONCAT(YEAR(weeks_date_mon), '-', LPAD(((MONTH(weeks_date_mon)-1) DIV 6)*6 + 1, 2, '0')) AS period,
                                            SUM(workout_history_count + diet_history_count) AS total_performance
                                        FROM member_performance
                                        GROUP BY period
                                        ORDER BY period";

                $resultMemberPerformance = $dbConn->query($sqlMemberPerformance);
                while ($row = $resultMemberPerformance->fetch_assoc()) {
                    $performanceDataByPeriod[$row['period']] = $row['total_performance'] / 10; 
                }

                $allTimePeriods = array_unique($allTimePeriods);
                sort($allTimePeriods);

                $chartDataSets = []; 
                $performanceDataPoints = [];
                foreach ($allTimePeriods as $currentPeriod) {
                    $performanceDataPoints[] = $performanceDataByPeriod[$currentPeriod] ?? 0;
                }
                $chartDataSets[] = [
                    "label" => "Member Performance",
                    "type" => "line",
                    "data" => $performanceDataPoints,
                    "backgroundColor" => "rgb(235, 61, 61)",
                    "borderColor" => "rgb(235, 61, 61)",
                    "pointRadius" => 1,
                    "pointHoverRadius" => 4,
                    "borderWidth" => 2,
                    "fill" => false
                ];

                $workoutTypeColors = [
                    "cardio" => "rgb(255, 149, 172)", 
                    "weighted" => "rgb(132, 206, 255)", 
                    "weight-free" => "rgb(255, 219, 128)", 
                    "yoga" => "rgb(201, 255, 119)"
                ];

                foreach ($allWorkoutTypes as $currentWorkoutType) {
                    $dataPointsForCurrentType = [];
                    $cumulativeValueForCurrentType = 0; 

                    foreach ($allTimePeriods as $currentPeriod) {
                        if (isset($workoutCountsByType[$currentWorkoutType][$currentPeriod])) {
                            $cumulativeValueForCurrentType = $workoutCountsByType[$currentWorkoutType][$currentPeriod]; 
                        }
                        $dataPointsForCurrentType[] = $cumulativeValueForCurrentType;
                    }

                    $chartDataSets[] = [
                        "label" => ucfirst($currentWorkoutType), 
                        "type" => "bar",
                        "data" => $dataPointsForCurrentType,
                        "backgroundColor" => $workoutTypeColors[strtolower($currentWorkoutType)],
                        "borderColor" => str_replace("0.6", "1", $workoutTypeColors[strtolower($currentWorkoutType)]),
                        "borderWidth" => 1
                    ];
                }
                ?>
                <script>
                document.addEventListener("DOMContentLoaded", function() {
                    //-----------------------------------CHART 1-----------------------------------
                    const ctx = document.getElementById('workoutPopularityChart').getContext('2d');

                    new Chart(ctx, {
                        type: 'polarArea',
                        data: {
                            labels: <?php echo json_encode($dataset["labels"]); ?>,
                            datasets: [{
                                label: "Workout Popularity",
                                data: <?php echo json_encode($dataset["data"], JSON_NUMERIC_CHECK); ?>,
                                backgroundColor: <?php echo json_encode($dataset["backgroundColor"]); ?>
                            }]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: { position: 'top' }
                            }
                        }
                    });

                    //-----------------------------CHART 2 and 3----------------------------------------
                    const workoutData = <?php echo json_encode($workoutData); ?>;

                    function createScatterChart(canvasId, xAxisLabel, xAxisDataKey, data) {
                        const ctx = document.getElementById(canvasId).getContext('2d');

                        const scatterChart = new Chart(ctx, {
                            type: 'scatter',
                            data: {
                                datasets: [
                                    {
                                        label: 'Weighted',
                                        data: data.weighted.map(workout => ({
                                            x: workout[xAxisDataKey],
                                            y: workout.workout_count
                                        })),
                                        backgroundColor: 'rgb(255, 72, 111)',
                                        borderColor: 'rgb(255, 72, 111)',
                                        pointRadius: 4,
                                        pointHoverRadius: 6
                                    },
                                    {
                                        label: 'Yoga',
                                        data: data.yoga.map(workout => ({
                                            x: workout[xAxisDataKey],
                                            y: workout.workout_count
                                        })),
                                        backgroundColor: 'rgb(111, 197, 255)',
                                        borderColor: 'rgb(111, 197, 255)',
                                        pointRadius: 4,
                                        pointHoverRadius: 6
                                    },
                                    {
                                        label: 'Weight-Free',
                                        data: data['weight-free'].map(workout => ({
                                            x: workout[xAxisDataKey],
                                            y: workout.workout_count
                                        })),
                                        backgroundColor: 'rgb(255, 169, 255)', 
                                        borderColor: 'rgb(255, 169, 255)',
                                        pointRadius: 4,
                                        pointHoverRadius: 6
                                    },
                                    {
                                        label: 'Cardio',
                                        data: data.cardio.map(workout => ({
                                            x: workout[xAxisDataKey],
                                            y: workout.workout_count
                                        })),
                                        backgroundColor: 'rgb(188, 154, 255)', 
                                        borderColor: 'rgb(188, 154, 255)',
                                        pointRadius: 4,
                                        pointHoverRadius: 6
                                    }
                                ]
                            },
                            options: {
                                responsive: true,
                                scales: {
                                    x: {
                                        title: {
                                            display: true,
                                            text: xAxisLabel
                                        },
                                        type: 'linear',
                                        position: 'bottom'
                                    },
                                    y: {
                                        title: {
                                            display: true,
                                            text: 'Number of Clicks'
                                        }
                                    }
                                },
                                plugins: {
                                    legend: {
                                        display: true,
                                        position: 'top'
                                    }
                                }
                            }
                        });
                    }

                    createScatterChart('durationChart', 'Duration (minutes)', 'duration', workoutData);
                    createScatterChart('caloriesChart', 'Calories', 'calories', workoutData);

                    //-----------------------------CHART 4----------------------------------------

                    const ctx9 = document.getElementById('workoutPerformanceChart').getContext('2d');

                    const allTimeLabels = <?php echo json_encode($allTimePeriods); ?>; // Updated variable name
                    const chartDataSets = <?php echo json_encode($chartDataSets, JSON_NUMERIC_CHECK); ?>; // Updated variable name

                    new Chart(ctx9, {
                        type: 'bar',
                        data: {
                            labels: allTimeLabels,
                            datasets: chartDataSets
                        },
                        options: {
                            responsive: true,
                            scales: {
                                x: {
                                    title: { display: true, text: 'Date' }
                                },
                                y: {
                                    title: { display: true, text: 'Total Number of Workouts' },
                                    beginAtZero: true
                                }
                            },
                            plugins: {
                                legend: { position: 'top' }
                            }
                        }
                    });
                });
                </script>

            </div>
        </section>

        <!-- meal analysis -->
        <section>
            <h2>Meal Analysis</h2>
            <div>
                <div class="containers">
                    <h3>Diet Analysis</h3>
                    <div class="chart">
                        <div>
                            <h4>Members' Favourite on Diet Type</h4>
                            <canvas id="dietPopularityChart"></canvas>
                        </div>
                        <div>
                            <h4>Member's Preference on Preparation Time</h4>
                            <div>
                                <canvas id="preparationTimeChart" width="500" height="300"></canvas>
                            </div>
                        </div>
                        <div>
                            <h4>Member's Preference on Calories</h4>
                            <div>
                                <canvas id="dietCalorieChart" width="500" height="300"></canvas>
                            </div>
                        </div>
                        <div>
                            <h4>Diet vs Member Performance</h4> 
                            <canvas id="worormanceChart"></canvas>
                        </div>
                    </div>
                </div>
                <!-- ----------------------------------CHART 1-------------------------- -->
                    <?php
                    $sqlDistinctDietTypes = "SELECT DISTINCT diet_type FROM diet";
                    $resultDistinctDietTypes = $dbConn->query($sqlDistinctDietTypes);

                    $allDietTypes = []; 
                    while ($row = $resultDistinctDietTypes->fetch_assoc()) {
                        $allDietTypes[] = $row['diet_type'];
                    }

                    $dietCountsByType = [];
                    foreach ($allDietTypes as $currentDietType) {
                        $sqlDietHistory = "SELECT COUNT(diet_history_id) AS total_diet_count
                                        FROM diet_history
                                        WHERE diet_id IN (
                                            SELECT diet_id FROM diet WHERE diet_type = '$currentDietType'
                                        )";

                        $resultDietHistory = $dbConn->query($sqlDietHistory);
                        $dietCountsByType[$currentDietType] = $resultDietHistory->fetch_assoc()['total_diet_count'] ?? 0;
                    }

                    $dietColors = [
                        "all" => "rgba(255, 99, 132, 0.85)", 
                        "vegetarian" => "rgba(54, 162, 235, 0.85)", 
                        "vegan" => "rgba(75, 192, 192, 0.85)", 
                        "meat" => "rgba(255, 206, 86, 0.85)", 
                    ];

                    $dietChartDataset = [
                        "labels" => array_keys($dietCountsByType),
                        "data" => array_values($dietCountsByType),
                        "backgroundColor" => array_values($dietColors),
                    ];
                    ?>
                    <script>
                    document.addEventListener("DOMContentLoaded", function() {
                        console.log("loading");
                        const ctxDietChart = document.getElementById('dietPopularityChart').getContext('2d');

                        new Chart(ctxDietChart, {
                            type: 'polarArea',
                            data: {
                                labels: <?php echo json_encode($dietChartDataset["labels"]); ?>,
                                datasets: [{
                                    label: "Diet Popularity",
                                    data: <?php echo json_encode($dietChartDataset["data"], JSON_NUMERIC_CHECK); ?>,
                                    backgroundColor: <?php echo json_encode($dietChartDataset["backgroundColor"]); ?>
                                }]
                            },
                            options: {
                                responsive: true,
                                plugins: {
                                    legend: { position: 'top' }
                                }
                            }
                        });
                    });
                    </script>

                    <?php
                    // Modified SQL query to correctly calculate total calories for each diet
                    $sqlDietStatistics = "SELECT 
                                            d.diet_type,
                                            SUM(n.calories) AS total_calories,
                                            d.preparation_min,
                                            COUNT(dh.diet_id) AS total_diet_count
                                        FROM diet d
                                        LEFT JOIN diet_nutrition dn ON d.diet_id = dn.diet_id
                                        LEFT JOIN nutrition n ON dn.nutrition_id = n.nutrition_id
                                        LEFT JOIN diet_history dh ON d.diet_id = dh.diet_id
                                        GROUP BY d.diet_type, d.diet_id, d.preparation_min";

                    $resultDietStatistics = $dbConn->query($sqlDietStatistics);

                    // Initializing diet statistics with correct categories from your data
                    $dietStatistics = [
                        'Vegetarian' => [],
                        'Vegan' => [],
                        'Ketogenic' => [],
                        'Paleo' => [],
                        'Mediterranean' => [],
                        'Pescatarian' => [],
                        'High Protein' => [],
                        'Low Carb' => [],
                        'Gluten Free' => [],
                        'Heart Healthy' => [],
                        'Anti-Inflammatory' => []
                    ];

                    while ($row = $resultDietStatistics->fetch_assoc()) {
                        $currentDietType = $row['diet_type'];
                        
                        // Make sure the diet type exists in our array
                        if (!isset($dietStatistics[$currentDietType])) {
                            $dietStatistics[$currentDietType] = [];
                        }
                        
                        $dietStatistics[$currentDietType][] = [
                            'calories' => (int)$row['total_calories'],
                            'preparation_min' => (int)$row['preparation_min'],
                            'total_diet_count' => (int)$row['total_diet_count']
                        ];
                    }

                    // Create JavaScript-friendly variable names
                    $jsVariableNames = [
                        'Vegetarian' => 'vegetarian',
                        'Vegan' => 'vegan', 
                        'Meat' => 'meat',
                        'All' => 'all',
                    ];

                    // Convert PHP array keys to match JavaScript expected keys
                    $jsDietStatistics = [];
                    foreach ($dietStatistics as $dietType => $data) {
                        $jsKey = isset($jsVariableNames[$dietType]) ? $jsVariableNames[$dietType] : strtolower(str_replace(' ', '', $dietType));
                        $jsDietStatistics[$jsKey] = $data;
                    }
                    ?>

                    <script>
                    document.addEventListener("DOMContentLoaded", function() {
                        // Get data from PHP
                        const dietStatistics = <?php echo json_encode($jsDietStatistics); ?>;
                        
                        function createScatterChart(canvasId, xAxisLabel, xAxisDataKey, data) {
                            const ctx = document.getElementById(canvasId).getContext('2d');
                            
                            // Prepare datasets dynamically based on available data
                            const datasets = [];
                            const colors = {
                                'vegetarian': 'rgb(197, 236, 113)',
                                'vegan': 'rgb(140, 184, 255)',
                                'meat': 'rgb(255, 154, 154)',
                                'all': 'rgb(220, 167, 255)',
                            };
                            
                            // Only create datasets for diet types that have data
                            Object.keys(data).forEach(dietType => {
                                if (data[dietType] && data[dietType].length > 0) {
                                    const displayName = dietType.charAt(0).toUpperCase() + dietType.slice(1)
                                        .replace(/([A-Z])/g, ' $1').trim(); // Convert camelCase to Title Case with spaces
                                    
                                    datasets.push({
                                        label: displayName,
                                        data: data[dietType].map(diet => ({
                                            x: diet[xAxisDataKey],
                                            y: diet.total_diet_count
                                        })),
                                        backgroundColor: colors[dietType] || `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
                                        borderColor: colors[dietType] || `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`,
                                        pointRadius: 4,
                                        pointHoverRadius: 6
                                    });
                                }
                            });
                            
                            const scatterChart = new Chart(ctx, {
                                type: 'scatter',
                                data: {
                                    datasets: datasets
                                },
                                options: {
                                    responsive: true,
                                    scales: {
                                        x: {
                                            title: {
                                                display: true,
                                                text: xAxisLabel
                                            },
                                            type: 'linear',
                                            position: 'bottom'
                                        },
                                        y: {
                                            title: {
                                                display: true,
                                                text: 'Number of Times Prepared'
                                            }
                                        }
                                    },
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'top'
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    return `${context.dataset.label}: (${context.parsed.x}, ${context.parsed.y})`;
                                                }
                                            }
                                        }
                                    }
                                }
                            });
                        }

                        // Create the charts if data exists
                        if (document.getElementById('preparationTimeChart')) {
                            createScatterChart('preparationTimeChart', 'Preparation Time (minutes)', 'preparation_min', dietStatistics);
                        }
                        
                        if (document.getElementById('dietCalorieChart')) {
                            createScatterChart('dietCalorieChart', 'Calories', 'calories', dietStatistics);
                        }
                    });
                    </script>
            </div>
        </section>
    </div>
</body>
</html>