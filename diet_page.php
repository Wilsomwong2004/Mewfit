<?php
session_start();
if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    header("Location: index.php");
    exit;
}

include "conn.php";

$member_id = $_SESSION['member id'];
$sqlMember = "SELECT email_address FROM member WHERE member_id = ?";
$stmtMember = $dbConn->prepare($sqlMember);
$stmtMember->bind_param("i", $member_id);
$stmtMember->execute();
$resultMember = $stmtMember->get_result();
$member = $resultMember->fetch_assoc();
$email_address = $member['email_address'];
?>

<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mewfit</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Mogra&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.0/css/all.min.css">
    <link rel="icon" type="image/x-icon" href="./assets/icons/cat-logo-tabs.png">
    <link rel="stylesheet" href="./css/diet_page.css">
    <link rel="stylesheet" href="./css/navigation_bar.css">
    <link rel="stylesheet" href="./css/gemini_chatbot.css">
    <script src="./js/diet_page.js"></script>
    <script src="./js/navigation_bar.js"></script>
    <script src="./js/gemini_chatbot.js"></script>
</head>

<body>
    <div class="no-select">
        <nav class="navbar" id="navbar">
            <div class="nav-links" id="nav-links">
                <span class="workout-home"><a href="homepage.php">HOME</a></span>
                <span class="workout-navbar"><a href="workout_page.php">WORKOUT</a></span>
                <img src="./assets/icons/logo.svg" alt="logo" class="nav-logo" id="nav-logo">
                <span class="workout-dietplan"><a href="#" class="active">DIET PLAN</a></span>
                <span class="workout-settings"><a href="settings_page.php">SETTINGS</a></span>
            </div>
            <div class="header-right">
                <button id="hamburger-menu" aria-label="Menu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
            <img src="./assets/icons/logo.svg" alt="logo" class="nav-logo-responsive" id="nav-logo-responsive">
            <div class="profile">
                <div>
                    <?php
                    echo "
            <img src=\"./uploads/member/{$_SESSION["member pic"]}\" alt=\"Profile\" id=\"profile-pic\">
            ";
                    ?>
                </div>

                <div class="profile-dropdown" id="profile-dropdown">
                    <div class="profile-info">
                        <?php
                        echo "
                <img src=\"./uploads/member/{$_SESSION["member pic"]}\" alt=\"Profile\" id=\"profile-pic\">
                <div>
                    <h3>{$_SESSION["username"]}</h3>
                    <p>{$email_address}</p>
                </div>
                ";
                        ?>
                    </div>
                    <ul>
                        <li><a href="settings_page.php" class="settings-profile"><i class="fas fa-cog"></i>Settings</a></li>
                        <li>
                            <i class="fas fa-moon"></i> Dark Mode
                            <label class="switch">
                                <input type="checkbox" name="dark-mode-toggle" id="dark-mode-toggle">
                                <span class="slider round"></span>
                            </label>
                        </li>
                        <li><a href="FAQ_page.html" class="help-center-profile"><i class="fas fa-question-circle"></i>Help </a></li>
                        <li class="logout-profile" id="logout-profile"><i class="fas fa-sign-out-alt"></i> Logout</li>
                    </ul>
                </div>
            </div>
        </nav>

        <main class="main-content">
            <div class="content-header">
                <div class="content-title">
                    <h2 class="content-logo-name">MEWFIT</h2>
                    <h2 class="content-title-name">Diet Plan</h2>
                </div>
                <div class="search-bar">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search">
                </div>
                <div class="search-bar-small">
                    <i class="fas fa-search"></i>
                </div>
            </div>
        </main>

        <div class="diet-carousel">
            <div class="diet-track">
                <div class="diet-slides"></div>
            </div>
        </div>

        <section class="diet-body">
            <h2 class="section-title"><img src="./assets/icons/icons8-lightning-64.png">Categories</h2>
            <div class="activity-types">
                <div class="activity-card activity-card-all" id="default-selection">
                    <img src="./assets/icons/all diet.svg" alt="All">
                    <p>All</p>
                </div>
                <div class="activity-card activity-card-vegetarian">
                    <img src="./assets/icons/vegetarian.svg" alt="vegetarian">
                    <p>Vegetarian</p>
                </div>
                <div class="activity-card activity-card-vegan">
                    <img src="./assets/icons/vegan.svg" alt="Vegan">
                    <p>Vegan</p>
                </div>
                <div class="activity-card activity-card-meat">
                    <img src="./assets/icons/meat.svg" alt="Meat">
                    <p>Meat</p>
                </div>
            </div>
        </section>

        <section class="diet-body">
            <h2 class="section-title"><img src="./assets/icons/icons8-heart-50.png">Top Picks For You</h2>
            <div class="diet-grid"></div>
        </section>

        <section class="diet-body">
            <h2 class="section-title"><img src="./assets/icons/icons8-time-48.png">Recent Meals</h2>
            <div class="diet-history-grid"></div>
        </section>


        <!-- Chatbot Interface -->
        <div class="chatbot-container">
            <div class="chatbot-header">
                <div class="chatbot-header-left">
                    <img src="./assets/icons/cat-logo-tabs.png">
                    <h3>MEWAI</h3>
                </div>
                <button class="close-chat">&times;</button>
            </div>
            <div class="chatbot-transparent-top-down"></div>
            <div class="chatbot-messages"></div>
            <div class="chatbot-input">
                <input type="text" placeholder="Ask me about fitness...">
                <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
            </div>
        </div>
        <button class="chatbot-toggle">
            <img class="chatbot-img" src="./assets/icons/cat-logo-tabs.png">
        </button>

        <div class="container-side-transparent-left"></div>
        <div class="container-side-transparent-right"></div>
    </div>
</body>

</html>
<?php
// Fetch the latest 6 standard diets and sum the calories from the nutrition table
$sql = "SELECT diet_id, diet_name, difficulty, preparation_min, total_calories, diet_type, date
        FROM (
            SELECT d.diet_id, d.diet_name, d.difficulty, d.preparation_min, SUM(n.calories) AS total_calories, 'standard' AS diet_type, dh.date
            FROM diet_history dh
            JOIN diet d ON dh.diet_id = d.diet_id
            LEFT JOIN diet_nutrition dn ON dn.diet_id = d.diet_id
            LEFT JOIN nutrition n ON n.nutrition_id = dn.nutrition_id
            WHERE dh.member_id = ?
            GROUP BY d.diet_id, dh.date
        ) AS combined_diets
        ORDER BY date DESC, COALESCE(diet_id) DESC";

$stmt = $dbConn->prepare($sql);
$stmt->bind_param("i", $member_id);
$stmt->execute();
$result = $stmt->get_result();

$diets = [];
while ($row = $result->fetch_assoc()) {
    $diets[] = $row;
}

$response = [
    'diets' => !empty($diets) ? $diets : ['no_data' => true]
];

json_encode($response);
?>

<script>
    const response = <?php echo json_encode($response); ?>;

    const createCard = (item) => {
        const imageSrc = item.image || './assets/icons/error.svg';
        return `
            <div class="diet-card-content" data-id="${item.diet_id}" data-type="${item.diet_type}">
                <div>
                    <img src="${imageSrc}" alt="${item.diet_name}" class="diet-image">
                </div>
                <div class="diet-info">
                    <h3 class="diet-title">${item.diet_name}</h3>
                    <span class="diet-level">${item.difficulty || ''}</span>
                    <div class="diet-stats">
                        <span><i class="fas fa-clock"></i> ${item.preparation_min || '-'}</span>
                        <span><i class="fas fa-fire"></i> ${item.total_calories || 0} kcal</span>
                    </div>
                </div>
            </div>
        `;
    };

    const dietGrid = document.querySelector('.diet-history-grid');

    if (response.diets && !response.diets.no_data) {
        dietGrid.innerHTML = response.diets.map(diet => createCard(diet)).join('');

        const dietCards = dietGrid.querySelectorAll('.diet-card-content');
        dietCards.forEach(card => {
            card.addEventListener('click', () => {
                const dietId = card.getAttribute('data-id');
                window.location.href = `subdiet_page.php?diet_id=${dietId}`;
            });
            card.style.cursor = 'pointer';
        });
    } else {
        dietGrid.innerHTML = '<div class="no-history">No diet available.</div>';
    }
</script>
