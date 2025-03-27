<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
<?php
include "conn.php";

$member_id = 1; // Change this dynamically based on logged-in user

$sql = "
(
    SELECT 
        dh.diet_history_id AS id,
        dh.date,
        d.diet_name,
        d.diet_type,
        d.preparation_min,
        d.picture,
        IFNULL(SUM(n.calories), 0) AS total_calories,
        'regular' AS meal_type
    FROM diet_history dh
    JOIN diet d ON dh.diet_id = d.diet_id
    LEFT JOIN diet_nutrition dn ON d.diet_id = dn.diet_id
    LEFT JOIN nutrition n ON dn.nutrition_id = n.nutrition_id
    WHERE dh.member_id = ?
    GROUP BY dh.diet_history_id, dh.date, d.diet_name, d.diet_type, d.preparation_min, d.picture
)
UNION ALL
(
    SELECT 
        cd.custom_diet_id AS id,
        cd.date,
        cd.custom_diet_name AS diet_name,
        'Custom' AS diet_type,
        NULL AS preparation_min,
        NULL AS picture,
        cd.calories AS total_calories,
        'custom' AS meal_type
    FROM custom_diet cd
    WHERE cd.member_id = ?
)
ORDER BY date DESC
LIMIT 5";  // Show only the latest 5 meals

$stmt = $dbConn->prepare($sql);
$stmt->bind_param("ii", $member_id, $member_id);
$stmt->execute();
$result = $stmt->get_result();

// Debugging: Check if query returns anything
if (!$result) {
    die("Query Error: " . $stmt->error);
}

if ($result->num_rows == 0) {
    echo "<p>No meals found.</p>";
} else {
    while ($row = $result->fetch_assoc()) {
        $diet_id = $row['id'];  
        $diet_name = $row['diet_name'];
        $diet_type = $row['diet_type']; 
        $preparation_min = isset($row['preparation_min']) ? "{$row['preparation_min']} min" : "N/A";
        $total_calories = $row['total_calories'];
        $picture = !empty($row['picture']) ? "./uploads/diet/{$row['picture']}" : "./uploads/default.jpg";
        $meal_date = $row['date'];

        echo "<div class='workout-date'>
                <p>{$meal_date}</p>
              </div>
              <div class='workout-record' data-diet-id='{$diet_id}'>
                <img class='picture' src='{$picture}' alt='{$diet_name}' />
                <p class='name'>{$diet_name}</p>
                <p class='type'>{$diet_type}</p>
                <p class='time'>{$preparation_min}</p>
                <p class='calories'>{$total_calories} kcal</p>
              </div>";
    }
}
?>


</body>
</html>