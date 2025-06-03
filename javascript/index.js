const button = document.querySelector(".button-one");

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function createBubble() {
  const bubble = document.createElement("div");
  bubble.style.position = "absolute";
  bubble.style.width = "100px";
  bubble.style.height = "100px";
  bubble.style.borderRadius = "50%";
  bubble.style.background = getRandomColor();
  bubble.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
  bubble.style.top = `${Math.random() * (window.innerHeight - 40)}px`;
  bubble.style.zIndex = 1000;
  bubble.style.opacity = 0.7;
  document.body.appendChild(bubble);

  setTimeout(() => {
    bubble.remove();
  }, 2000);
}

button.addEventListener("click", (draw) => {
  let count = 0;
  const maxBubbles = 10;
  const interval = setInterval(() => {
    createBubble();
    count++;
    if (count >= maxBubbles) {
      clearInterval(interval);
    }
  }, 200 + Math.random() * 300); // random interval between 200-500ms
});

function handleLogin() {
  window.location.href = "distrohome.html";
}

const loginButton = document.querySelector(".login-button");
if (loginButton) {
  loginButton.addEventListener("click", handleLogin);
}
