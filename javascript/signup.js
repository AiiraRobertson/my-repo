// Select all input elements on the page
const inputs = document.querySelectorAll("input");

// Add an event listener to each input for responsiveness
inputs.forEach((input) => {
  input.addEventListener("input", (event) => {
    console.log(`Input changed: ${event.target.name} = ${event.target.value}`);
    // Add any additional logic for responsiveness here
  });

  input.addEventListener("focus", () => {
    input.style.borderColor = "blue"; // Highlight input on focus
  });

  input.addEventListener("blur", () => {
    input.style.borderColor = ""; // Reset border color on blur
  });
});

// Function to validate the form inputs
function validateForm() {
  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  // Simple validation checks
  if (
    username === "" ||
    email === "" ||
    password === "" ||
    confirmPassword === ""
  ) {
    alert("All fields are required!");
    return false;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return false;
  }

  // Add any additional validation logic here

  return true; // Form is valid
}

// Add a submit event listener to the form
const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent default form submission

  if (validateForm()) {
    alert("Welcome! Your form has been successfully submitted.");
    form.reset(); // Optionally reset the form after submission
  }
});

// Function to handle FizzBuzz logic
function fizzBuzz(number) {
  for (let i = 1; i <= number; i++) {
    if (i % 3 === 0 && i % 5 === 0) {
      console.log("FizzBuzz");
    } else if (i % 3 === 0) {
      console.log("Fizz");
    } else if (i % 5 === 0) {
      console.log("Buzz");
    } else {
      console.log(i);
    }
  }
}

// Example usage: Add an event listener to a button to trigger FizzBuzz
const fizzBuzzButton = document.getElementById("fizzbuzz-button");
fizzBuzzButton.addEventListener("click", () => {
  const numberInput = document.getElementById("fizzbuzz-number").value;
  const number = parseInt(numberInput, 10);

  if (!isNaN(number) && number > 0) {
    fizzBuzz(number);
  } else {
    alert("Please enter a valid positive number.");
  }
});
