document.addEventListener("DOMContentLoaded", function () {
  const records = document.querySelectorAll(".diet-record");

  records.forEach((record) => {
    record.addEventListener("click", function () {
      const dietId = this.getAttribute("data-diet-id");
      const mealType = this.getAttribute("data-meal-type");

      if (dietId && mealType !== "custom") {
        window.location.href = `subdiet_page.php?diet_id=${dietId}`;
      }
    });
  });
});

function type_filter() {
  let selectedType = document.getElementById("type-filter").value.toLowerCase();
  let records = document.querySelectorAll(".record-wrapper");

  records.forEach((wrapper) => {
    let record = wrapper.querySelector(".diet-record");
    let mealType = record.getAttribute("data-meal-type").toLowerCase().trim();

    if (selectedType === "all" || mealType === selectedType) {
      wrapper.style.display = "block";
    } else {
      wrapper.style.display = "none";
    }
  });
}
