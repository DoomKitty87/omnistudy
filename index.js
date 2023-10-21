var currentAnswer = [];
var currentPossibleAnswers = [];
var currentExplanation = "";
const problemText = document.getElementById("problem");
const answerForm = document.getElementById("answerform");
const responseText = document.getElementById("response");
const confettiHolder = document.getElementById("confettiholder");
const problemOptions = document.getElementById("problemoptions");
const problemExplanation = document.getElementById("explanation");
const profile = document.getElementById("profile");
const profileItems = document.getElementById("profileitems");
var lastRequestedProblem = "";
var currentType = 0;
var currentSettings = 0;
const types = document.getElementById("headerbuttons").children;
const settings = document.getElementById("headerbuttons2").children;
const mcq = document.getElementById("mcq");
var activePanel = 0;
const problemTypes = [["Buoyant Force Submerged", "Buoyant Force Floating", "Fluid Flow Conservation"], ["Power Rule"], ["P Value Conclusion", "Slope From Correlation", "Predicted Value"]];
var chartId;
var quizAllowedTypes;
var quizTimer;
var quizActive;
var quizCorrect;
var quizIncorrect;
var quizTime;
var quizLength;

function generateProblem(typeoverride = -1) {
  var type = problemOptions.selectedIndex - 1;
  if (typeoverride != -1) type = typeoverride;
  if (type == -1) random();
  else {
    var problemSet = problemTypes[currentType][type].replace(/ /g, "");
    problemSet = problemSet[0].toLowerCase() + problemSet.slice(1);
    getProblem(problemSet);
  }
}

function loadStorage() {
  for (var i = 0; i < problemTypes.length; i++) {
    for (var j = 0; j < problemTypes[i].length; j++) {
      var problemSet = problemTypes[i][j].replace(/ /g, "");
      problemSet = problemSet[0].toLowerCase() + problemSet.slice(1);
      if (!localStorage.getItem(problemSet)) localStorage.setItem(problemSet, 0);
      if (!localStorage.getItem(problemSet + "incorrect")) localStorage.setItem(problemSet + "incorrect", 0);
    }
  }
}

function openSettings() {
  currentSettings = 1;
  setSettingType();
  if (activePanel != 1) setActivePanel(1);
}

function openProfile() {
  if (currentSettings != 0  || activePanel != 1) reloadProfile();
  currentSettings = 0;
  setSettingType();
  if (activePanel != 1) setActivePanel(1);
}

function updateChecked() {
  for (var i = 0; i < types.length;  i++) {
    if (document.getElementById("selected" + types[i].innerHTML).checked) {
      for (var j = 0; j < problemTypes[i].length; j++) {
        document.getElementById("selected" + problemTypes[i][j].replace(/ /g, "")).checked = true;
      }
    }
    else {
      for (var j = 0; j < problemTypes[i].length; j++) {
        document.getElementById("selected" + problemTypes[i][j].replace(/ /g, "")).checked = false;
      }
    }
  }
}

function openQuiz() {
  if (activePanel != 2) {
    document.getElementById("openquiz").children[0].classList.add("selected");
    setActivePanel(2);
  }
  document.getElementById("quizsettings").style.display = "";
  document.getElementById("quizmain").style.display = "none";
  const typesForm = document.getElementById("chosentypes");
  typesForm.innerHTML = "";
  for (var i = 0; i < problemTypes.length; i++) {
    const type = document.createElement("input");
    type.type = "checkbox";
    type.onclick = updateChecked;
    type.classList.add("answerinput");
    type.id = "selected" + types[i].innerHTML;
    const label = document.createElement("label");
    label.innerHTML = types[i].innerHTML;
    label.classList.add("answerlabel");
    label.style.setProperty("margin-bottom", "0.5rem");
    if (i != 0) label.style.setProperty("margin-top", "0.5rem");
    label.appendChild(type);
    typesForm.appendChild(label);
    for (var j = 0; j < problemTypes[i].length; j++) {
      const problemSet = problemTypes[i][j].replace(/ /g, "");
      const problem = document.createElement("input");
      problem.type = "checkbox";
      problem.classList.add("answerinput");
      problem.id = "selected" + problemSet;
      const label = document.createElement("label");
      label.innerHTML = problemTypes[i][j];
      label.classList.add("answerlabel", "answerlabelsub");
      label.appendChild(problem);
      typesForm.appendChild(label);
    }
  }
}

function startQuiz() {
  var selected = false;
  for (var i = 0; i < types.length;  i++) {
    if (document.getElementById("selected" + types[i].innerHTML).checked) selected = true;
  }
  if (!selected) return;
  quizTimer = Date.now();
  quizActive = true;
  quizCorrect = 0;
  quizIncorrect = 0;

  quizAllowedTypes = [];
  quizTime = document.getElementById("quiztime").value;
  quizLength = document.getElementById("quizlength").value;
  if (document.getElementById("apoverride").checked) {
    quizTime = 3600;
    quizLength = 55;
  }
  for (var i = 0; i < problemTypes.length; i++) {
    for (var j = 0; j < problemTypes[i].length; j++) {
      if (!document.getElementById("selected" + problemTypes[i][j].replace(/ /g, "")).checked) continue;
      quizAllowedTypes.push(problemTypes[i][j]);
    }
  }
  document.getElementById("quizsettings").style.display = "none";
  document.getElementById("quizmain").style.display = "";
  generateQuizProblem();
}

function generateQuizProblem() {
  if (Date.now() - quizTimer > quizTime * 1000 || quizCorrect + quizIncorrect >= quizLength) {
    document.getElementById("quizsettings").style.display = "";
    document.getElementById("quizmain").style.display = "none";
    document.getElementById("quizaccuracy").innerHTML = `Accuracy: ${Math.round(quizCorrect / (quizCorrect + quizIncorrect) * 100)}%`;
    document.getElementById("quizcorrect").innerHTML = `Correct: ${quizCorrect}`;
    document.getElementById("quizincorrect").innerHTML = `Incorrect: ${quizIncorrect}`;
  }
  document.getElementById("submitquiz").innerHTML = "Submit Answer";
  document.getElementById("submitquiz").onclick = submitQuizAnswer;
  var problemSet = quizAllowedTypes[Math.floor(Math.random() * quizAllowedTypes.length)].replace(/ /g, "");
  problemSet = problemSet[0].toLowerCase() + problemSet.slice(1);
  getQuizProblem(problemSet);
}

function getQuizProblem(problemSet) {
  const problem = window[problemSet](true);
  const quizAnswerForm = document.getElementById("quizanswerform");
  quizAnswerForm.innerHTML = "";
  document.getElementById("quizresponse").innerHTML = "";
  document.getElementById("quizproblem").innerHTML = problem;
  if (currentPossibleAnswers[0] == "shortresponse") for (var i = 0; i < currentAnswer.length; i++) {
    const input = document.createElement("input");
    const label = document.createElement("label");
    input.classList += "answerinput";
    input.id = i;
    label.for = i;
    label.innerHTML = `Answer (${i + 1}): `;
    label.classList += "answerlabel";
    quizAnswerForm.appendChild(label);
    quizAnswerForm.appendChild(input);
    quizAnswerForm.appendChild(document.createElement("br"));
  }
  else for (var i = 0; i < currentPossibleAnswers.length; i++) {
    const input = document.createElement("input");
    const label = document.createElement("label");
    input.classList += "answerinput";
    input.type = "radio";
    input.name = "answer";
    input.id = currentPossibleAnswers[i];
    label.for = i;
    label.innerHTML = currentPossibleAnswers[i];
    label.classList += "answerlabel";
    quizAnswerForm.appendChild(label);
    quizAnswerForm.appendChild(input);
    quizAnswerForm.appendChild(document.createElement("br"));
    quizAnswerForm.appendChild(document.createElement("br"));
  }
}

function submitQuizAnswer() {
  const quizAnswerForm = document.getElementById("quizanswerform");
  const quizResponse = document.getElementById("quizresponse");
  var correct = true;
  if (currentPossibleAnswers[0] == "shortresponse") {
    var answered = false;
    for (var i = 0; i < currentAnswer.length; i++) {
      if (quizAnswerForm.children[i * 4 + 1].value != "") answered = true;
    }
    if (!answered) return;
    for (var i = 0; i < currentAnswer.length; i++) {
      if (quizAnswerForm.children[i * 4 + 1].value.replace(/\s/g, '') != currentAnswer[i].replace(/\s/g, '')) correct = false;
    }
  }
  else {
    var answered = false;
    for (var i = 0; i < currentPossibleAnswers.length; i++) {
      if (quizAnswerForm.children[i * 4 + 1].checked) answered = true;
    }
    if (!answered) return;
    for (var i = 0; i < currentPossibleAnswers.length; i++) {
      if (quizAnswerForm.children[i * 4 + 1].checked && quizAnswerForm.children[i * 4 + 1].id != currentAnswer[0]) correct = false;
    }
  }

  if (correct) {
    quizResponse.innerHTML = "Correct!";
    quizCorrect += 1;
    spawnConfetti();
  }
  else {
    quizResponse.innerHTML = "Incorrect.";
    quizIncorrect += 1;
  }
  document.getElementById("submitquiz").innerHTML = "Next";
  document.getElementById("submitquiz").onclick = generateQuizProblem;
}

function reloadProfile() {
  if (chartId) chartId.destroy();
  chartId = new Chart(document.getElementById("chart").getContext("2d"), {
    type: "radar",
    data: {
      labels: [],
      datasets: [{
        label: "Percentage Correct",
        backgroundColor: "#101218a0",
        data: []
      }]
    },
    options: {
      events: [],
      plugins: {
        legend: {
          display: false
        }
      },
      elements: {
        line: {
          borderWidth: 0
        },
        point: {
          radius: 0
        }
      },
      title: {
        display: false,
        text: "Problem Type Performance"
      },
      scales: {
        r: {
          pointLabels: {
            color: "#101218",
            font: {
              size: 24,
              family: "Open Sans"
            }
          },
          grid: {
            color: "#10121840"
          },
          angleLines: {
            display: false
          },
          ticks: {
            display: false
          },
          min: 0,
          max: 100
        }
      }
    }
  });
  const chartLabels = [];
  const chartData = [];
  profileItems.innerHTML = "";
  for (var i = 0; i < problemTypes.length; i++) {
    
    var typeTitle = document.createElement("h1");
    typeTitle.classList.add("stattitle");
    typeTitle.innerHTML = types[i].innerHTML;
    var typeData = 0;
    var exempt = 0;
    for (var j = 0; j < problemTypes[i].length; j++) {
      var problemSet = problemTypes[i][j].replace(/ /g, "");
      problemSet = problemSet[0].toLowerCase() + problemSet.slice(1);
      if (localStorage.getItem(problemSet) + localStorage.getItem(problemSet + "incorrect") != 0) {
        const stat = document.createElement("h2");
        stat.classList.add("stat");
        stat.innerHTML = problemTypes[i][j] + ": " + localStorage.getItem(problemSet) + "/" + (parseInt(localStorage.getItem(problemSet)) + parseInt(localStorage.getItem(problemSet + "incorrect")));
        typeTitle.appendChild(stat);
      }
      var percentage = localStorage.getItem(problemSet) / (parseInt(localStorage.getItem(problemSet)) + parseInt(localStorage.getItem(problemSet + "incorrect")));
      if ((parseInt(localStorage.getItem(problemSet)) + parseInt(localStorage.getItem(problemSet + "incorrect"))) == 0) exempt += 1;
      else typeData += percentage;
    }
    if (typeTitle.children.length > 0) profileItems.appendChild(typeTitle);
    else typeTitle.remove();
    typeData /= problemTypes[i].length - exempt;
    chartLabels.push(types[i].innerHTML);
    chartData.push(Math.round(typeData * 100));
  }
  chartId.data.labels = chartLabels;  
  chartId.data.datasets[0].data = chartData;
}

function setSettingType() {
  for (var i = 0; i < types.length;  i++) {
    types[i].classList.remove("selected");
  }
  for (var i = 0; i < settings.length;  i++) {
    settings[i].classList.remove("selected");
  }
  settings[currentSettings].classList.add("selected");
  if (currentSettings == 0) {
    profile.style.display = "block";
    document.getElementById("settings").style.display = "none";
  }
  else if (currentSettings == 1) {
    profile.style.display = "none";
    document.getElementById("settings").style.display = "block";
  }
}

function setActivePanel(section) {
  document.documentElement.style.setProperty("--main-text-color", ["#000000", "#fffeff", "#fffeff"][section]);
  activePanel = section;
  if (section == 0) {
    document.getElementById("openquiz").children[0].classList.remove("selected");
    document.getElementById("quizpanel").style.display = "none";
    document.getElementById("problempanel").style.display = "block";
    document.getElementById("settingspanel").style.display = "none";
  }
  else if (section == 1) {
    document.getElementById("openquiz").children[0].classList.remove("selected");
    document.getElementById("quizpanel").style.display = "none";
    document.getElementById("problempanel").style.display = "none";
    document.getElementById("settingspanel").style.display = "block";
  }
  else {
    for (var i = 0; i < types.length;  i++) {
      types[i].classList.remove("selected");
    }
    for (var i = 0; i < settings.length;  i++) {
      settings[i].classList.remove("selected");
    }
    document.getElementById("quizpanel").style.display = "block";
    document.getElementById("problempanel").style.display = "none";
    document.getElementById("settingspanel").style.display = "none";
  }
}

function clearSaved() {
  localStorage.clear();
  location.reload();
}

function getProblem(problemSet) {
  currentExplanation = "";
  const problem = window[problemSet](mcq.checked);
  problemExplanation.style.display = "none";
  lastRequestedProblem = problemSet;
  answerForm.innerHTML = "";
  responseText.innerHTML = "";
  problemExplanation.innerHTML = "";
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
    label.innerHTML = currentPossibleAnswers[i];
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
    localStorage.setItem(lastRequestedProblem, parseInt(localStorage.getItem(lastRequestedProblem)) + 1);
    getProblem(lastRequestedProblem);
  }
  else {
    localStorage.setItem(lastRequestedProblem + "incorrect", parseInt(localStorage.getItem(lastRequestedProblem + "incorrect")) + 1);
    responseText.innerHTML = "Incorrect. The answer is ";
    problemExplanation.innerHTML = currentExplanation;
    if (currentExplanation != "") problemExplanation.style.display = "block";
    for (var i = 0; i < currentAnswer.length; i++) {
      if (i == currentAnswer.length - 1) responseText.innerHTML += currentAnswer[i] + ".";
      else responseText.innerHTML += currentAnswer[i] + " ";
    }
  }
}

function getRandomValue(mean, variance, decimals) {
  return Math.round((mean + (Math.random() - 0.5) * variance) * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function generateMCQAnswers(answer, text = false) {
  answers = [];

  answers[Math.floor(Math.random() * 4)] = answer;
  for (var i = 0; i < 4; i++) {
    if (answers[i] == null) {
      if (!text) answers[i] = (Math.round(answer * getRandomValue(1, 1, 2) * 100) / 100).toString();
      else answers[i] = answer.substr(Math.floor(Math.random() * answer.length));
    }
  }

  return answers;
}

function setType(type) {
  if (activePanel != 0) setActivePanel(0);
  currentType = type;
  problemOptions.innerHTML = "";
  for (var i = 0; i < types.length;  i++) {
    types[i].classList.remove("selected");
  }
  for (var i = 0; i < settings.length;  i++) {
    settings[i].classList.remove("selected");
  }
  types[type].classList.add("selected");
  const rand = document.createElement("option");
  rand.innerHTML = "Random";
  problemOptions.appendChild(rand);
  for (var i = 0; i < problemTypes[type].length; i++) {
    const option = document.createElement("option");
    option.innerHTML = problemTypes[type][i];
    problemOptions.appendChild(option);
  }
  document.documentElement.style.setProperty("--main-text-color", ["#39c1ad", "#fece50", "#f74d51"][type]);
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

function toggleBoxes() {
  document.getElementById("quizlength").value = "3600";
  document.getElementById("quiztime").value = "55";
  document.getElementById("quizlength").toggleAttribute("disabled");
  document.getElementById("quiztime").toggleAttribute("disabled");
}

function random() {
  generateProblem(Math.floor(Math.random() * problemTypes[currentType].length));
}

function buoyantForceSubmerged(mcq) {
  const mass = getRandomValue(200, 150, 2);
  const sideLength = getRandomValue(0.5, 0.2, 2);
  const density = getRandomValue(1000, 300, 1);
  const answer = Math.round(Math.abs(mass * 10 - sideLength * sideLength * sideLength * density * 10) * 100) / 100;
  currentAnswer = [answer.toString()];
  if (mcq) currentPossibleAnswers = generateMCQAnswers(answer);
  else currentPossibleAnswers = ["shortresponse"];
  currentExplanation = `We want to find the net force acting on the cube, which will be the forces in one direction subtracted from the forces in the opposite, as we do not have any horizontal forces. The force down is equal to the weight of the cube, or m * g (${mass} * 10). The force up is equal to the buoyant force, or p<sub>fluid</sub> * g * V<sub>submerged</sub>. Since we know all of the cube is submerged, we can calculate the buoyant force as ${density} * 10 * ${Math.round(sideLength * sideLength * sideLength * 1000) / 1000}. Subtracting the two gives us the net force of ${currentAnswer[0]}N.`;
  return `There is a cube with a mass of ${mass}kg and side length ${sideLength}m submerged in a fluid of density ${density}kg/m<sup>3</sup>. Find the magnitude of the net force acting on the cube in N. (g = 10, round to 2 decimals)`;
}

function buoyantForceFloating(mcq) {
  const sideLength = getRandomValue(0.5, 0.2, 2);
  const density = getRandomValue(1000, 300, 1);
  const depth = getRandomValue(sideLength / 2, sideLength / 2, 2);
  const answer = Math.round(sideLength * sideLength * depth * density * 100) / 100;
  currentAnswer = [answer.toString()];
  if (mcq) currentPossibleAnswers = generateMCQAnswers(answer);
  else currentPossibleAnswers = ["shortresponse"];
  currentExplanation = `We know the buoyant force here is equal to the weight of the cube, because it is floating in equilibrium. Because the buoyant force is equal to the g * p<sub>fluid</sub> * V<sub>submerged</sub>, we can set these two forces equal to each other, which gives us g * m<sub>cube</sub> = g * p<sub>fluid</sub> * V<sub>submerged</sub>. Dividing out g from both sides leaves us with the mass of the cube on the left, and we just need to find the submerged volume. Since we know the side length, the cross-sectional area of the cube is ${sideLength} * ${sideLength} = ${Math.round(sideLength * sideLength * 100) / 100}m<sup>2</sup>, and we can multiply that by the depth to get ${Math.round(sideLength * sideLength * depth * 100) / 100}m<sup>3</sup> of submerged volume. Multiplying that value by the density of the fluid gives us the mass, which is ${Math.round(sideLength * sideLength * depth * density * 100) / 100}kg.`;
  return `There is a cube with side length ${sideLength}m floating in a fluid of density ${density}kg/m3 with its bottom edge ${depth}m below the surface. Find the mass of the cube in kg. (g = 10, round to 2 decimals)`;
}

function fluidFlowConservation(mcq) {
  const dia1 = getRandomValue(2, 2, 1);
  const dia2 = getRandomValue(2, 2, 1);
  const vel1 = getRandomValue(10, 12, 1);
  const answer = Math.round(vel1 * (Math.pow(dia1 / 2, 2) / Math.pow(dia2 / 2, 2)) * 100) / 100;
  currentAnswer = [answer.toString()];
  if (mcq) currentPossibleAnswers = generateMCQAnswers(answer);
  else currentPossibleAnswers = ["shortresponse"];
  currentExplanation = `According to the conservation of flow rate, the total volume flow rate (for an incompressible fluid) at one point in a pipe must equal the flow rate at another point. We can calculate the ratio between the cross-sectional area of A and B by (d<sub>A</sub> / 2)<sup>2</sup> / (d<sub>B</sub> / 2)<sup>2</sup>, which equals ${Math.round(Math.pow(dia1 / 2, 2) / Math.pow(dia2 / 2, 2) * 100) / 100}. We can then multiply the velocity of point A by this value to give us the velocity at point B, which is ${currentAnswer[0]}cm/s.`;
  return `A fluid is moving through a pipe from location A to location B. At location A, the pipe's diameter is ${dia1}cm, and the fluid flows at ${vel1}cm/s. At location B, the pipe's diameter is ${dia2}cm. Find the velocity of the fluid at location B in cm/s.`;
}

function pValueConclusion(mcq) {
  const pValue = getRandomValue(0.2, 0.3999, 3);
  const alphaValue = [0.01, 0.05, 0.1, 0.15][getRandomValue(2, 2, 0)];
  currentAnswer = [pValue > alphaValue ? "true" : "false"];
  currentPossibleAnswers = ["true", "false"];
  currentExplanation = `Because the alpha value chosen was ${alphaValue}, the p value must be greater than ${alphaValue} for a rejection of the null hypothesis. Seeing as ${pValue} ${pValue > alphaValue ? '>' : '<'} ${alphaValue}, the answer is ${currentAnswer[0]}.`
  return `An experiment's z/t-score resulted in a p-value of ${pValue}, and the designers of the experiment chose to use an alpha value of ${alphaValue}. Is there enough evidence to reject the null hypothesis? (true or false)`;
}

function slopeFromCorrelation(mcq) {
  const r = getRandomValue(0, 2, 2);
  const sx = getRandomValue(15, 20, 1);
  const sy = getRandomValue(30, 15, 1);
  const answer = Math.round(sy / sx * r * 100) / 100; 
  currentAnswer = [answer.toString()];
  if (mcq) currentPossibleAnswers = generateMCQAnswers(answer);
  else currentPossibleAnswers = ["shortresponse"];
  currentExplanation = `The slope of the least-squares line can be determined by the equation b = r(Sy/Sx). Using that here gives us b = ${r}(${sy}/${sx}), which evaluates to ${answer}.`;
  return `A set of explanatory and response variables has been found to have an Sx of ${sx}, an Sy of ${sy}, and a correlation of r = ${r}. Based on these values, what is the slope of the least-squares line for the data?`;
}

function predictedValue(mcq) {
  const a = getRandomValue(0, 2000, 2);
  const b = getRandomValue(50, 50, 2);
  const x = getRandomValue(25, 10, 1);
  const answer = Math.round((a + b * x) * 100) / 100;
  currentAnswer = [answer.toString()];
  if (mcq) currentPossibleAnswers = generateMCQAnswers(answer);
  else currentPossibleAnswers = ["shortresponse"];
  currentExplanation = `The predicted y value is computed by using the x value given in the regression line. We simply need to evaluate the equation as ${a} + ${b} * ${x}, which gives ${answer}.`;
  return `A linear regression was computed for variables x and y, and the resultant line was y&#770; = ${a} + ${b}x. If a given x value is ${x}, what is the predicted y value?`;
}

function powerRule(mcq) {
  const terms = getRandomValue(3, 4, 0);
  var coefficients = [];
  var exponents = [];
  var expression = "";
  var answer = "";
  var formattedAnswer = "";
  for (var i = 0; i < terms; i++) {
    coefficients[i] = getRandomValue(0, 10, 0);
    exponents[i] = getRandomValue(0, 8, 0);
    while (coefficients[i] == 0) coefficients[i] = getRandomValue(0, 10, 0);
    while (exponents[i] == 0) exponents[i] = getRandomValue(0, 8, 0);
    
    if (i == 0) {
      if (Math.abs(coefficients[i]) == 1) {
        expression += (Math.sign(coefficients[i]) == 1 ? "" : "-") + "x" + (exponents[i] == 1 ? "" : ("<sup>" + exponents[i] + "</sup>"));
        if (exponents[i] == 1) {
          answer += coefficients[i];
          formattedAnswer += coefficients[i];
        }
        else {
          answer += (coefficients[i] * exponents[i]) + "x^" + (exponents[i] - 1);
          formattedAnswer += (coefficients[i] * exponents[i]) + "x<sup>" + (exponents[i] - 1) + "</sup>";
        }
      }
      else {
        expression += coefficients[i] + "x" + (exponents[i] == 1 ? "" : ("<sup>" + exponents[i] + "</sup>"));
        if (exponents[i] == 1) {
          answer += coefficients[i];
          formattedAnswer += coefficients[i];
        }
        else {
          answer += coefficients[i] * exponents[i] + "x" + (exponents[i] - 1 == 1 ? "" : ("^" + (exponents[i] - 1)));
          formattedAnswer += coefficients[i] * exponents[i] + "x" + (exponents[i] - 1 == 1 ? "" : ("<sup>" + (exponents[i] - 1) + "</sup>"));
        }
      }
    }
    else {
      if (Math.abs(coefficients[i]) == 1) {
        expression += (Math.sign(coefficients[i]) == 1 ? " + " : " - ") + "x" + (exponents[i] == 1 ? "" : ("<sup>" + exponents[i] + "</sup>"));
        if (exponents[i] == 1) {
          answer += coefficients[i];
          formattedAnswer += coefficients[i];
        }
        else {
          answer += (Math.sign(exponents[i]) == 1 ? " + " : " - ") + Math.abs(exponents[i]) + "x" + (exponents[i] - 1 == 1 ? "" : ("^" + (exponents[i] - 1)));
          formattedAnswer += (Math.sign(exponents[i]) == 1 ? " + " : " - ") + Math.abs(exponents[i]) + "x" + (exponents[i] - 1 == 1 ? "" : ("<sup>" + (exponents[i] - 1) + "</sup>"));
        }
      }
      else {
        expression += (Math.sign(coefficients[i]) == 1 ? " + " : " - ") + Math.abs(coefficients[i]) + "x" + (exponents[i] == 1 ? "" : ("<sup>" + exponents[i] + "</sup>"));
        if (exponents[i] == 1) {
          answer += (Math.sign(coefficients[i]) == 1 ? " + " : " - ") + Math.abs(coefficients[i]);
          formattedAnswer += (Math.sign(coefficients[i]) == 1 ? " + " : " - ") + Math.abs(coefficients[i]);
        }
        else {
          answer += (Math.sign(coefficients[i] * exponents[i]) == 1 ? " + " : " - ") + Math.abs(coefficients[i] * exponents[i]) + "x" + (exponents[i] - 1 == 1 ? "" : ("^" + (exponents[i] - 1)));
          formattedAnswer += (Math.sign(coefficients[i] * exponents[i]) == 1 ? " + " : " - ") + Math.abs(coefficients[i] * exponents[i]) + "x" + (exponents[i] - 1 == 1 ? "" : ("<sup>" + (exponents[i] - 1) + "</sup>"));
        }
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
  if (mcq) currentPossibleAnswers = generateMCQAnswers(answer, true);
  else currentPossibleAnswers = ["shortresponse"];
  currentExplanation = `We can use the power rule to find the derivative of each term, then add them together. The power rule states that the derivative of x<sup>n</sup> is n * x<sup>n - 1</sup>. Therefore, f'(x) = ${formattedAnswer}.`;
  return expression;
}