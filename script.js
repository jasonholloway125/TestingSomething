let questions = [];
let currentQuestionIndex = 0;
let score = 0;

async function loadQuestions() {
  const res = await fetch('questions.json');
  questions = await res.json();
  console.log(questions);
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

  q.answers.forEach((answer, index) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = answer.text;
    btn.onclick = () => selectAnswer(answer.correct, btn);
    li.appendChild(btn);
    answersElement.appendChild(li);
  });
}

function selectAnswer(correct, btn) {
  const buttons = document.querySelectorAll('#answers button');
  buttons.forEach(b => b.disabled = true);

  if (correct) {
    btn.style.backgroundColor = '#4CAF50';
    score++;
  } else {
    btn.style.backgroundColor = '#f44336';
  }

  document.getElementById('next-btn').disabled = false;
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
