const slide_page = document.querySelector(".slide_page");
const next_button = document.querySelector(".next_button");
const prev_button = document.querySelector(".previous");

const close_error = document.querySelector(".close-error");
const error_popup = document.querySelector(".error-popup");

next_button.addEventListener("click", function () {
  slide_page.style.marginLeft = "-100%";
});

prev_button.addEventListener("click", function () {
  if (slide_page.style.marginLeft == "0%") {
    window.location.href = "login_page.html";
  } else {
    slide_page.style.marginLeft = "0%";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const close_error = document.querySelector(".close-error");
  const error_popup = document.querySelector(".error-popup");

  close_error.addEventListener("click", function () {
    error_popup.classList.add("active"); // This should add the class
    console.log(error_popup.classList); // Check if the class is actually added
  });
});
