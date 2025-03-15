<?php
session_start();
?>


<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mewfit</title>
    <link href="css/account.css" rel="stylesheet" />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Josefin+Sans:ital,wght@0,100..700;1,100..700&family=Mogra&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
      rel="stylesheet"
    />
    <link
      href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css"
      rel="stylesheet"
    />
  </head>
  <body>
    <?php
    if (!empty($_SESSION['error_message'])) {
      echo "
          <div class='error-popup'>
            <p>{$_SESSION['error_message']}</p>
            <button class='close-error' onclick='this.parentElement.style.display=\"none\"'>&times;</button>
          </div>
      ";
      unset($_SESSION['error_message']);
    }
    ?>

    <div class="outer-form">
      <div class="form-wrapper">
        <div class="create-header">
          <button class="previous"><i class="bx bxs-chevron-left"></i></button>
          <h2>Create an account</h2>
        </div>
        <form action="sign_up_member.php" method="post">
          <div class="sign-in-steps">

            <!-- First page -->
            <section class="pages slide_page">

              <div class="sign-in-description">
                <p>Let’s us know more about you.</p>
              </div>

              <!-- Username input -->
              <div class="inputs">
                <label for="username">Username</label>
                <input type="text" id="username" name="username"/>
              </div>

              <!-- Email-input -->
              <div class="inputs">
                <label for="e-mail">Email</label>
                <input type="email" id="e-mail" name="e-mail"/>
              </div>

              <!-- Password input -->
              <div class="inputs">
                <label for="password">Password</label>
                <input type="password" id="password" name="password"/>
              </div>

              <div class="half-input-wrapper">

                <!-- Age input -->
                <div class="half-inputs">
                  <label for="age">Your Age</label>
                  <input type="number" id="age" name="age"/>
                </div>

                <!-- Gender input -->
                <div class="gender-inputs">
                  <label for="gender">Your Gender</label>
                  <select id="gender" name="gender">
                    <option value="" disabled selected>
                      Select your gender
                    </option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

              </div>

              <!-- account rules -->
              <div class="account-rules">
                <ul>
                  <li>Use 8 or more characters</li>
                  <li>Use upper and lower case letters (e.g. Aa)</li>
                  <li>Use a number (e.g. 1234)</li>
                  <li>Use a symbol (e.g. !@#$)</li>
                </ul>
              </div>

              <!-- Next Button -->
              <div class="button-inputs next_button">
                <button type="button">Next</button>
              </div>

            </section>

            <!-- Second page -->
            <section class="pages slide_page">

              <div class="sign-in-description">
                <p>
                  We still need your information for let’s us more accuracy on
                  recommand
                </p>
              </div>

              <div class="half-input-wrapper">

                <!-- Weight input -->
                <div class="half-inputs">
                  <label for="weight">Your Weight</label>
                  <input 
                    type="number" 
                    id="weight" 
                    name="weight" 
                    oninput="calculateBMI()"
                  />
                  <select id="weight-unit" name="weight-unit">
                    <option value="kg">KG</option>
                    <option value="lbs">LBS</option>
                  </select>
                </div>

                <!-- Height input -->
                <div class="half-inputs">
                  <label for="height">Your Height</label>
                  <input 
                    type="number" 
                    id="height" 
                    name="height"
                    oninput="calculateBMI(); calculateTargetBMI()"
                  />
                  <select id="height-unit" name="height-unit">
                    <option value="cm">CM</option>
                    <option value="feet">FEET</option>
                  </select>
                </div>

              </div>

              <p>Current BMI: <span id="bmi">0</span></p>

              <!-- Fitness Goal -->
              <div class="select-inputs">
                <label for="fitness-goal">Fitness Goal:</label>
                <select id="fitness-goal" name="fitness-goal" onchange="calculateTargetBMI()">
                  <option value="" disabled selected>Pick a fitness goal</option>
                  <option value="Lose weight">Lose weight</option>
                  <option value="Gain weight">Gain weight</option>
                </select>
              </div>

              <div class="inputs">
                <label for="target-weight">Target Weight: <span id="target-warning"></span></label>
                <input
                  type="number"
                  id="target-weight"
                  name="target-weight"
                  oninput="calculateTargetBMI()"
                />
                <select id="target-weight-unit" name="target-weight-unit">
                  <option value="kg">KG</option>
                  <option value="lbs">LBS</option>
                </select>
              </div>

              <p>Target BMI: <span id="target-bmi">0</span></p>

              <!-- Sign up button -->
              <div class="button-inputs">
                <button type="submit">Sign up</button>
              </div>

            </section>
          </div>
        </form>
        <div class="policy">
          <p>
            By creating an account, you agree to the
            <a href="terms_condition_page.html">Terms of use</a> and
            <a href="privacy_policy_page.html"> Privacy Policy. </a>
          </p>
        </div>
      </div>
    </div>

    <script>
      function calculateBMI() {
        let weight = parseFloat(document.getElementById('weight').value) || 0;
        let height = parseFloat(document.getElementById('height').value) / 100 || 0;
        let bmi = (weight) / (height ** 2);

        if (bmi > 300 || bmi < 7) {
          document.getElementById("bmi").textContent = "Please enter appropriate weight and height";
        } else {
          document.getElementById("bmi").textContent = bmi.toFixed(2);
        }
      }

      function calculateTargetBMI() {
        // let fitness_goal = document.getElementById('fitness_goal').value;

        document.getElementById("target-warning").textContent = "";

        let weight = parseFloat(document.getElementById('weight').value) || 0;
        let height = parseFloat(document.getElementById('height').value) / 100 || 0;
        let target_weight = parseFloat(document.getElementById('target-weight').value) || 0;

        let target_bmi = (target_weight) / (height ** 2);

        if (target_weight - weight > 4) {
          document.getElementById("target-warning").textContent = "Gaining more than 4kg / 9lbs is dangerous in a span of one month";
        } else {
          document.getElementById("target-bmi").textContent = target_bmi.toFixed(2);
        }
      }
    </script>

    <script src="js/sign-in-steps.js"></script>
  </body>
</html>
