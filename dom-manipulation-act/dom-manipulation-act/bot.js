// =============================== INSERT YOUR CODE HERE ===============================
// -----
// -----
// -----
// -----
// -----

// =============================== DO NOT TOUCH THE CODE BELOW ===============================
function complete(id) {
  let tag = document.getElementById(id);

  tag.textContent = "Done";

  tag.classList.add("done");
}

function checkTasks() {
  // Task 1

  if (
    document.getElementById("robotName").textContent !== "Unnamed Robot" &&
    document.getElementById("robotName").textContent !== ""
  )
    complete("task1");

  // Task 2

  let eye = document.querySelector(".eye");

  if (eye.style.background !== "") complete("task2");

  // Task 3

  let robot = document.getElementById("robot");

  if (
    robot.classList.contains("happy") ||
    robot.classList.contains("sad") ||
    robot.classList.contains("excited")
  )
    complete("task3");

  // Task 4

  if (document.getElementById("speech").textContent.trim() !== "...")
    complete("task4");

  // Task 5

  let clone = robot.cloneNode(true);

  if (robot.onclick !== null) complete("task5");

  // Task 6

  if (robot.children.length > 5) complete("task6");

  // Bonus

  if (document.querySelectorAll("*").length > 40) complete("task7");
}
