const slide_page = document.querySelector(".slide_page");
const next_button = document.querySelector(".next_button");
const prev_button = document.querySelector(".previous");

next_button.addEventListener("click", function () {
  slide_page.style.marginLeft = "-100%";
});

prev_button.addEventListener("click", function () {
  if (slide_page.style.marginLeft == "0%") {
    window.history.back();
  } else {
    slide_page.style.marginLeft = "0%";
  }
});
