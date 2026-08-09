// =============================== insert your code here ===============================

// task 1: give it a name using getelementbyid and textcontent
const robotName = document.getElementById("robotName");
robotName.textContent = "BeepBot";

// task 2: recolor the eyes using queryselectorall, foreach, and style
const eyes = document.querySelectorAll(".eye");
eyes.forEach(function (eye) {
  eye.style.background = "#00e5ff";
});

// task 3: change the mood by adding a mood class
const robot = document.getElementById("robot");
robot.classList.add("happy");

// task 4: make it talk by updating speech
const speech = document.getElementById("speech");
speech.textContent = "hello! i am beepbot!";

// task 5: react to clicks by changing speech
robot.onclick = function () {
  speech.textContent = "beep boop! thanks for clicking me!";
};

// task 6: add accessories to append to the robot
const accessory1 = document.createElement("div");
accessory1.className = "accessory";
accessory1.textContent = ":crown:";
accessory1.style.fontSize = "24px";
accessory1.style.textAlign = "center";
accessory1.style.marginTop = "-20px";
robot.appendChild(accessory1);

const accessory2 = document.createElement("div");
accessory2.className = "accessory";
accessory2.textContent = ":star:";
accessory2.style.fontSize = "20px";
accessory2.style.textAlign = "center";
robot.appendChild(accessory2);

// check 
checkTasks();

// =============================== do not touch the code below ===============================
function complete(id) {
  let tag = document.getElementById(id);

  tag.textContent = "Done";

  tag.classList.add("done");
}

function checkTasks() {
  // task 1

  if (
    document.getElementById("robotName").textContent !== "Unnamed Robot" &&
    document.getElementById("robotName").textContent !== ""
  )
    complete("task1");

  // task 2

  let eye = document.querySelector(".eye");

  if (eye.style.background !== "") complete("task2");

  // task 3

  let robot = document.getElementById("robot");

  if (
    robot.classList.contains("happy") ||
    robot.classList.contains("sad") ||
    robot.classList.contains("excited")
  )
    complete("task3");

  // task 4

  if (document.getElementById("speech").textContent.trim() !== "...")
    complete("task4");

  // task 5

  let clone = robot.cloneNode(true);

  if (robot.onclick !== null) complete("task5");

  // task 6

  if (robot.children.length > 5) complete("task6");

  // bonus

  if (document.querySelectorAll("*").length > 40) complete("task7");
}

