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
