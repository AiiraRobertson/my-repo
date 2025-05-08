var left = 0;

function frame() {
  var element = document.querySelector(".item-relative");
  left += 2;
  element.style.left = left + "px";
  if (left >= 300) {
    clearInterval(id);
  }
}

var id = setInterval(frame, 10);

window.onload = function () {
  alert(
    "Thank you for coming! We hope you enjoy your stay. \n\nPlease note that this is a demo version of the website. \n\nIf you have any questions or need assistance, feel free to reach out to us. \n\nHave a great day!"
  );
};
