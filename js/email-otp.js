function sendOTP() {
  const email = document.getElementById("email-verify");
  const otpVerify = document.getElementById("email-otp")[0];

  let otpValue = Math.floor(Math.random() * 10000);

  let emailbody = `<h2>Your OTP is </h2><p>${otpValue}</p>`;

  Email.send({
    SecureToken: "903c017d-aa20-4252-ae06-9a237f4d683f",
    To: email.value,
    From: "TP074890@mail.apu.edu.my",
    Subject: "MewFit Password Recovery",
    Body: emailbody,
  }).then((message) => {
    if (message === "OK") {
      alert("OTP sent to your email " + email.value);

      otpVerify.style.display = "flex";
      const otp_inp = document.getElementById("email-otp");
      const otp_btn = document.getElementById("otp-button");

      otp_btn.addEventListener("click", () => {
        if (otp_inp.value == otpValue) {
          alert("Email address verified");
        } else {
          alert("OTP invalid, Email verification failed");
        }
      });
    }
  });
}

