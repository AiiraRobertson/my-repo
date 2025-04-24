const button = document.querySelector("button");

function greet() {
  const name = prompt("What is your name?");
  const greeting = document.querySelector("#greeting");
  greeting.textContent = `Hello ${name}, nice to see you!`;
}

function handleLogin() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  if (username && password) {
    alert(`Welcome, ${username}!`);
  } else {
    alert("Please enter both username and password.");
  }
}

function handleSignUp() {
  alert("Redirecting to sign-up page...");
  // Add redirection logic here if needed
}

document.querySelector(".button-one").addEventListener("click", function () {
  document.getElementById(
    "greeting"
  ).textContent = `Welcome to my recipe collection! Here, you'll find a variety of
        delicious recipes that I have gathered over the years. Whether you're
        looking for a quick weeknight dinner or a special dish for a
        celebration, I've got you covered. Each recipe includes step-by-step
        instructions and tips to help you create a fantastic meal. Enjoy
        cooking!`;
});
