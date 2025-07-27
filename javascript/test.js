const container = document.querySelector("#container");
const display = container.firstElementChild;
console.log(display);

const controls = document.querySelector(".controls");
const display = controls.previousElementSibling;
console.log(display);

const div = document.createElement("div");
div.style.color = "red";
div.style.cssText = "color: red; background-color: yellow; font-size: 20px;";
div.setAttribute(
  "style",
  "color: red; background-color: yellow; font-size: 20px;"
);

div.setAttribute("id", "theDiv");
