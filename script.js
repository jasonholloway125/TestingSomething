let questions = [];
let currentQuestionIndex = 0;
let score = 0;

async function loadQuestions() {
  const res = await fetch('questions.json');
  questions = await res.json();
  showQuestion();
}

function showQuestion() {
  const questionElement = document.getElementById('question');
  const answersElement = document.getElementById('answers');
  const nextBtn = document.getElementById('next-btn');

  answersElement.innerHTML = '';
  nextBtn.disabled = true;

  const q = questions[currentQuestionIndex];
  questionElement.textContent = q.question;

  q.answers.forEach((answer) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = answer.text;
    btn.dataset.correct = answer.correct;
    btn.addEventListener('click', () => selectAnswer(btn));
    li.appendChild(btn);
    answersElement.appendChild(li);
  });
}

function selectAnswer(selectedBtn) {
  const nextBtn = document.getElementById('next-btn');
  const buttons = document.querySelectorAll('#answers button');
  const correct = selectedBtn.dataset.correct === "true";

  // Highlight correct and incorrect answers
  buttons.forEach((button) => {
    const isCorrect = button.dataset.correct === "true";
    button.disabled = true;
    if (isCorrect) {
      button.style.backgroundColor = "#4CAF50"; // green
    } else if (button === selectedBtn && !isCorrect) {
      button.style.backgroundColor = "#f44336"; // red
    } else {
      button.style.backgroundColor = "#ddd"; // grey others
    }
  });

  if (correct) score++;
  nextBtn.disabled = false;
}

document.getElementById('next-btn').addEventListener('click', () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
});

function showResult() {
  document.getElementById('quiz').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('score').textContent = `${score} / ${questions.length}`;
}

document.getElementById('restart-btn').addEventListener('click', () => {
  score = 0;
  currentQuestionIndex = 0;
  document.getElementById('quiz').classList.remove('hidden');
  document.getElementById('result').classList.add('hidden');
  showQuestion();
});

loadQuestions();
