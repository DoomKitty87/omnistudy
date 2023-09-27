var currentAnswer = [];
const answerForm = document.getElementById("answerform");
const responseText = document.getElementById("response");

function getProblem(problemSet) {
  const problem = window[problemSet]();
  answerForm.innerHTML = "";
  for (var i = 0; i < currentAnswer.length; i++) {
    const input = document.createElement("input");
    const label = document.createElement("label");
    input.type = "number";
    input.id = i;
    label.for = i;
    label.innerHTML = `Answer (${i + 1}): `;
    answerForm.appendChild(label);
    answerForm.appendChild(input);
  }
  return problem;
}

function checkAnswer() {
  var correct = true;
  for (var i = 0; i < currentAnswer.length; i++) {
    if (answerForm.children[i * 2 + 1].value != currentAnswer[i]) correct = false;
  }

  if (correct) responseText.innerHTML = "Correct.";
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

function buoyantForceSubmerged() {
  const mass = getRandomValue(200, 150, 2);
  const sideLength = getRandomValue(0.5, 0.2, 2);
  const density = getRandomValue(1000, 300, 1);
  currentAnswer = [Math.round(Math.abs(mass * 10 - sideLength * sideLength * sideLength * density * 10) * 100) / 100];
  return `There is a cube with a mass of ${mass}kg and side length ${sideLength}m submerged in a fluid of density ${density}kg/m3. Find the magnitude of the net force acting on the cube. (g = 10, round to 2 decimals)`;
}

//function buoyantForce