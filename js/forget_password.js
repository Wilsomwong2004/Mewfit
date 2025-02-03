const open_modal_buttons = document.querySelectorAll("[data-modal-target]");
const close_modal_buttons = document.querySelectorAll("[data-close-button]");
const overlay = document.getElementById("overlay");

open_modal_buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = document.querySelector(button.dataset.modalTarget);
    open_modal(modal);
  });
});

close_modal_buttons.forEach((button) => {
  button.addEventListener("click", () => {
    const modal = button.closest(".forget-password-modal");
    close_modal(modal);
  });
});

overlay.addEventListener("click", () => {
  const modals = document.querySelectorAll(".forget-password-modal.active");
  modals.forEach((modal) => {
    close_modal(modal);
  });
});

function open_modal(modal) {
  if (modal == null) return;
  modal.classList.add("active");
  overlay.classList.add("active");
}

function close_modal(modal) {
  if (modal == null) return;
  modal.classList.remove("active");
  overlay.classList.remove("active");
}
