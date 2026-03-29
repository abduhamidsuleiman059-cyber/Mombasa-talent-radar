// Get elements
var modal = document.getElementById("talentModal");
var btn = document.getElementById("viewTalentBtn");
var close = document.getElementById("closeModal");

// Open modal
btn.onclick = function() {
  modal.style.display = "block";
}

// Close modal
close.onclick = function() {
  modal.style.display = "none";
}
const modal = document.getElementById("talentModal");
const modalImg = document.getElementById("modalImage");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const closeBtn = document.querySelector(".close");

const buttons = document.querySelectorAll(".view-btn");

buttons.forEach(button => {
  button.addEventListener("click", () => {
    modal.style.display = "block";

    modalTitle.textContent = button.getAttribute("data-name");
    modalDesc.textContent = button.getAttribute("data-desc");
    modalImg.src = button.getAttribute("data-img");
  });
});

closeBtn.onclick = () => {
  modal.style.display = "none";
};

window.onclick = (e) => {
  if (e.target == modal) {
    modal.style.display = "none";
  }
};