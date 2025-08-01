const container = document.querySelector("#container");
const display = container.firstElementChild;
console.log(display);

const controls = document.querySelector(".controls");

const div = document.createElement("div");
div.style.color = "red";
div.style.cssText = "color: red; background-color: yellow; font-size: 20px;";
div.setAttribute(
  "style",
  "color: red; background-color: yellow; font-size: 20px;"
);

div.setAttribute("id", "theDiv");
div.getAttribute("id");
div.classList.add("new");
div.textContent = "This is a new div element.";
div.innerHTML = "<strong>This is a new div element.</strong>";
