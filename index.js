var currentAnswer = [];
var currentPossibleAnswers = [];
const problemText = document.getElementById("problem");
const answerForm = document.getElementById("answerform");
const responseText = document.getElementById("response");
const confettiHolder = document.getElementById("confettiholder");
const problemOptions = document.getElementById("problemoptions");
var lastRequestedProblem = "";
var currentType = 0;

const problemTypes = [["Buoyant Force Submerged", "Buoyant Force Floating"], ["Power Rule"], ["P Value Conclusion"]];

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
  if (currentPossibleAnswers[0] == "shortresponse") for (var i = 0; i < currentAnswer.length; i++) {
    const input = document.createElement("input");
    const label = document.createElement("label");
    input.classList += "answerinput";
    input.id = i;
    label.for = i;
    label.innerHTML = `Answer (${i + 1}): `;
    label.classList += "answerlabel";
    answerForm.appendChild(label);
    answerForm.appendChild(input);
    answerForm.appendChild(document.createElement("br"));
  }
  else for (var i = 0; i < currentPossibleAnswers.length; i++) {
    const input = document.createElement("input");
    const label = document.createElement("label");
    input.classList += "answerinput";
    input.type = "radio";
    input.name = "answer";
    input.id = currentPossibleAnswers[i];
    label.for = i;
    label.innerHTML = currentPossibleAnswers[i].charAt(0).toUpperCase() + currentPossibleAnswers[i].slice(1);
    label.classList += "answerlabel";
    answerForm.appendChild(label);
    answerForm.appendChild(input);
    answerForm.appendChild(document.createElement("br"));
    answerForm.appendChild(document.createElement("br"));
  }
}

function checkAnswer() {
  var correct = true;
  if (currentPossibleAnswers[0] == "shortresponse") {
    var answered = false;
    for (var i = 0; i < currentAnswer.length; i++) {
      if (answerForm.children[i * 4 + 1].value != "") answered = true;
    }
    if (!answered) return;
    for (var i = 0; i < currentAnswer.length; i++) {
      if (answerForm.children[i * 4 + 1].value.replace(/\s/g, '') != currentAnswer[i].replace(/\s/g, '')) correct = false;
    }
  }
  else {
    var answered = false;
    for (var i = 0; i < currentPossibleAnswers.length; i++) {
      if (answerForm.children[i * 4 + 1].checked) answered = true;
    }
    if (!answered) return;
    for (var i = 0; i < currentPossibleAnswers.length; i++) {
      if (answerForm.children[i * 4 + 1].checked && answerForm.children[i * 4 + 1].id != currentAnswer[0]) correct = false;
    }
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
  generateProblem();
}

async function spawnConfetti() {
  const confettiTemp = document.createElement("div");
  confettiHolder.appendChild(confettiTemp);
  for (var i = Math.round(Math.random() * 100) + 50; i > 0; i--) {
    const confetti = document.createElement("div");
    confetti.classList.add("confetti");
    confetti.style.width = ((Math.random() - 0.5) + 0.5) + "rem";
    confetti.style.height = ((Math.random() - 0.5) + 1) + "rem";
    confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.transition = `top ${(Math.random() - 0.5) * 2 + 5}s, left ${(Math.random() - 0.5) * 2 + 5}s, transform ${(Math.random() - 0.5) * 2 + 5}s`;
    confettiTemp.appendChild(confetti);
  }
  responseText.offsetHeight;
  for (var i = 0; i < confettiTemp.children.length; i++) {
    confettiTemp.children[i].style.top = "200vh";
    confettiTemp.children[i].style.transform = `rotate(${Math.random() * 360 - 180}deg)`;
    confettiTemp.children[i].style.left = (parseFloat(confettiTemp.children[i].style.left.split("%")[0]) + (Math.random() - 0.5) * 20) + "%";
  }
  await new Promise(resolve => setTimeout(resolve, 5000));
  confettiTemp.remove();
}

function buoyantForceSubmerged() {
  const mass = getRandomValue(200, 150, 2);
  const sideLength = getRandomValue(0.5, 0.2, 2);
  const density = getRandomValue(1000, 300, 1);
  currentAnswer = [(Math.round(Math.abs(mass * 10 - sideLength * sideLength * sideLength * density * 10) * 100) / 100).toString()];
  currentPossibleAnswers = ["shortresponse"];
  return `There is a cube with a mass of ${mass}kg and side length ${sideLength}m submerged in a fluid of density ${density}kg/m<sup>3</sup>. Find the magnitude of the net force acting on the cube. (g = 10, round to 2 decimals)`;
}

function buoyantForceFloating() {
  const sideLength = getRandomValue(0.5, 0.2, 2);
  const density = getRandomValue(1000, 300, 1);
  const depth = getRandomValue(sideLength / 2, sideLength / 2, 2);
  currentAnswer = [(Math.round(sideLength * sideLength * depth * density * 100) / 100).toString()];
  currentPossibleAnswers = ["shortresponse"];
  return `There is a cube with side length ${sideLength}m floating in a fluid of density ${density}kg/m3 with its bottom edge ${depth}m below the surface. Find the mass of the cube. (g = 10, round to 2 decimals)`;
}

function pValueConclusion() {
  const pValue = getRandomValue(0.2, 0.3999, 3);
  const alphaValue = [0.01, 0.05, 0.1, 0.15][getRandomValue(2, 2, 0)];
  currentAnswer = [pValue > alphaValue ? "true" : "false"];
  currentPossibleAnswers = ["true", "false"];
  return `An experiment's z/t-score resulted in a p-value of ${pValue}, and the designers of the experiment chose to use an alpha value of ${alphaValue}. Is there enough evidence to reject the null hypothesis? (true or false)`;
}

function powerRule() {
  const terms = getRandomValue(3, 4, 0);
  var coefficients = [];
  var exponents = [];
  var expression = "";
  var answer = "";
  for (var i = 0; i < terms; i++) {
    coefficients[i] = getRandomValue(0, 10, 0);
    exponents[i] = getRandomValue(0, 8, 0);
    while (coefficients[i] == 0) coefficients[i] = getRandomValue(0, 10, 0);
    while (exponents[i] == 0) exponents[i] = getRandomValue(0, 8, 0);
    
    if (i == 0) {
      if (Math.abs(coefficients[i]) == 1) {
        expression += (Math.sign(coefficients[i]) == 1 ? "" : "-") + "x" + (exponents[i] == 1 ? "" : "<sup>" + exponents[i] + "</sup>");
        if (exponents[i] == 1) answer += coefficients[i];
        else answer += (coefficients[i] * exponents[i]) + "x^" + (exponents[i] - 1);
      }
      else {
        expression += coefficients[i] + "x" + (exponents[i] == 1 ? "" : "<sup>" + exponents[i] + "</sup>");
        if (exponents[i] == 1) answer += coefficients[i];
        else answer += coefficients[i] * exponents[i] + "x^" + (exponents[i] - 1);
      }
    }
    else {
      if (Math.abs(coefficients[i]) == 1) {
        expression += (Math.sign(coefficients[i]) == 1 ? " + " : " - ") + "x" + (exponents[i] == 1 ? "" : "<sup>" + exponents[i] + "</sup>");
        if (exponents[i] == 1) answer += coefficients[i];
        else answer += (Math.sign(exponents[i]) == 1 ? " + " : " - ") + Math.abs(exponents[i]) + "x" + (exponents[i] - 1 == 1 ? "" : "^" + (exponents[i] - 1));
      }
      else {
        expression += (Math.sign(coefficients[i]) == 1 ? " + " : " - ") + Math.abs(coefficients[i]) + "x" + (exponents[i] == 1 ? "" : "<sup>" + exponents[i] + "</sup>");
        if (exponents[i] == 1) answer += (Math.sign(coefficients[i]) == 1 ? " + " : " - ") + Math.abs(coefficients[i]);
        else answer += (Math.sign(coefficients[i] * exponents[i]) == 1 ? " + " : " - ") + Math.abs(coefficients[i] * exponents[i]) + "x" + (exponents[i] - 1 == 1 ? "" : "^" + (exponents[i] - 1));
      }
    }
  }

  const tailing = getRandomValue(0, 20, 0);
  if (tailing != 0) {
    if (expression.length > 0) expression += " " + (Math.sign(tailing) ? "+" : "-") + " " + Math.abs(tailing);
    else expression += (Math.sign(tailing) ? "" : "-") + Math.abs(tailing);
  }

  expression = "f(x) = " + expression + ". Find f'(x).";
  currentAnswer = [answer];
  currentPossibleAnswers = ["shortresponse"];
  return expression;
}