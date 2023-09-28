var currentAnswer = [];
const problemText = document.getElementById("problem");
const answerForm = document.getElementById("answerform");
const responseText = document.getElementById("response");
const confettiHolder = document.getElementById("confettiholder");
const problemOptions = document.getElementById("problemoptions");
var lastRequestedProblem = "";
var currentType = 0;

const problemTypes = [["Buoyant Force Submerged", "Buoyant Force Floating"]];

function generateProblem() {
  const type = problemOptions.selectedIndex;
  var problemSet = problemTypes[currentType][type].replace(/ /g, "");
  problemSet = problemSet[0].toLowerCase() + problemSet.slice(1);
  getProblem(problemSet);
}

function getProblem(problemSet) {
  const problem = window[problemSet]();
  lastRequestedProblem = problemSet;
  answerForm.innerHTML = "";
  problemText.innerHTML = problem;
  for (var i = 0; i < currentAnswer.length; i++) {
    const input = document.createElement("input");
    const label = document.createElement("label");
    input.type = "number";
    input.classList += "answerinput";
    input.id = i;
    label.for = i;
    label.innerHTML = `Answer (${i + 1}): `;
    label.classList += "answerlabel";
    answerForm.appendChild(label);
    answerForm.appendChild(input);
  }
}

function checkAnswer() {
  var correct = true;
  if (answerForm.children.length != currentAnswer.length * 2) return;
  if (answerForm.children.length == 0) return;
  for (var i = 0; i < currentAnswer.length; i++) {
    if (answerForm.children[i * 2 + 1].value != currentAnswer[i]) correct = false;
  }

  if (correct) {
    responseText.innerHTML = "Correct!";
    spawnConfetti();
    getProblem(lastRequestedProblem);
  }
  else {
    responseText.innerHTML = "Incorrect. The answer is ";
    for (var i = 0; i < currentAnswer.length; i++) {
      if (i == currentAnswer.length - 1) responseText.innerHTML += currentAnswer[i] + ".";
      else responseText.innerHTML += currentAnswer[i] + " ";
    }
  }
}

function getRandomValue(mean, variance, decimals) {
  return Math.round((mean + (Math.random() - 0.5) * variance) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function setType(type) {
  currentType = type;
  problemOptions.innerHTML = "";
  for (var i = 0; i < problemTypes[type].length; i++) {
    const option = document.createElement("option");
    option.innerHTML = problemTypes[type][i];
    problemOptions.appendChild(option);
  }
}

function spawnConfetti() {
  confettiHolder.innerHTML = "";
  for (var i = Math.round(Math.random() * 100) + 50; i > 0; i--) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.width = ((Math.random() - 0.5) + 0.5) + "rem";
    confetti.style.height = ((Math.random() - 0.5) + 1) + "rem";
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.transition = `top ${(Math.random() - 0.5) * 2 + 5}s, left ${(Math.random() - 0.5) * 2 + 5}s, transform ${(Math.random() - 0.5) * 2 + 5}s`;
    confettiHolder.appendChild(confetti);
  }
  responseText.offsetHeight;
  for (var i = 0; i < confettiHolder.children.length; i++) {
    confettiHolder.children[i].style.top = "200vh";
    confettiHolder.children[i].style.transform = `rotate(${Math.random() * 360 - 180}deg)`;
    confettiHolder.children[i].style.left = (parseFloat(confettiHolder.children[i].style.left.split("%")[0]) + (Math.random() - 0.5) * 20) + "%";
  }
}

function buoyantForceSubmerged() {
  const mass = getRandomValue(200, 150, 2);
  const sideLength = getRandomValue(0.5, 0.2, 2);
  const density = getRandomValue(1000, 300, 1);
  currentAnswer = [Math.round(Math.abs(mass * 10 - sideLength * sideLength * sideLength * density * 10) * 100) / 100];
  return `There is a cube with a mass of ${mass}kg and side length ${sideLength}m submerged in a fluid of density ${density}kg/m3. Find the magnitude of the net force acting on the cube. (g = 10, round to 2 decimals)`;
}

function buoyantForceFloating() {
  const sideLength = getRandomValue(0.5, 0.2, 2);
  const density = getRandomValue(1000, 300, 1);
  const depth = getRandomValue(sideLength / 2, sideLength / 2, 2);
  currentAnswer = [Math.round(sideLength * sideLength * depth * density * 100) / 100];
  return `There is a cube with side length ${sideLength}m floating in a fluid of density ${density}kg/m3 with its bottom edge ${depth}m below the surface. Find the mass of the cube. (g = 10, round to 2 decimals)`;
}