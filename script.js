const OPTIONS_COUNT = 4;

let questions = [];
let answersByCategory = {};
let currentQuestionIndex = 0;
let score = 0;

async function loadData() {
  const [qRes, aRes] = await Promise.all([
    fetch('questions.json'),
    fetch('answers.json')
  ]);
  questions = await qRes.json();
  answersByCategory = await aRes.json();

  shuffleArray(questions);
  showQuestion();
}

// Fisher–Yates shuffle
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function buildOptionsForQuestion(qObj) {
  const correctName = qObj.answ;
  const pools = qObj.pool || [];

  let candidates = [];
  pools.forEach(cat => {
    const list = answersByCategory[cat];
    if (Array.isArray(list)) {
      list.forEach(item => {
        if (item && item.name) candidates.push({ name: item.name });
      });
    }
  });

  // Deduplicate
  const seen = new Set();
  candidates = candidates.filter(c => {
    if (seen.has(c.name) || c.name === correctName) return false;
    seen.add(c.name);
    return true;
  });

  if (candidates.length < OPTIONS_COUNT - 1) {
    Object.keys(answersByCategory).forEach(cat => {
      answersByCategory[cat].forEach(item => {
        if (!seen.has(item.name) && item.name !== correctName) {
          candidates.push({ name: item.name });
          seen.add(item.name);
        }
      });
    });
  }

  shuffleArray(candidates);
  const chosenWrong = candidates.slice(0, OPTIONS_COUNT - 1);

  const options = chosenWrong.map(c => ({ text: c.name, correct: false }));
  options.push({ text: correctName, correct: true });
  shuffleArray(options);
  return options;
}

function showQuestion() {
  const questionElement = document.getElementById('question');
  const expandBtn = document.getElementById('expand-btn');
  const answersElement = document.getElementById('answers');
  const nextBtn = document.getElementById('next-btn');

  answersElement.innerHTML = '';
  nextBtn.disabled = true;

  const qObj = questions[currentQuestionIndex];
  if (!qObj) return showResult();

  // Show the full definition as question text
  questionElement.textContent = qObj.ques;

  // Enable expand/collapse if long
  questionElement.classList.remove('expanded');
  setTimeout(() => {
    if (questionElement.scrollHeight > questionElement.clientHeight + 5) {
      expandBtn.classList.remove('hidden');
      expandBtn.textContent = 'Show more';
    } else {
      expandBtn.classList.add('hidden');
    }
  }, 50);

  expandBtn.onclick = () => {
    if (questionElement.classList.contains('expanded')) {
      questionElement.classList.remove('expanded');
      expandBtn.textContent = 'Show more';
    } else {
      questionElement.classList.add('expanded');
      expandBtn.textContent = 'Show less';
    }
  };

  // Build answers
  const options = buildOptionsForQuestion(qObj);
  options.forEach(opt => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = opt.text;
    btn.dataset.correct = opt.correct ? "true" : "false";
    btn.addEventListener('click', () => selectAnswer(btn));
    li.appendChild(btn);
    answersElement.appendChild(li);
  });
}

function selectAnswer(selectedBtn) {
  const nextBtn = document.getElementById('next-btn');
  const buttons = document.querySelectorAll('#answers button');
  const correct = selectedBtn.dataset.correct === "true";

  buttons.forEach(button => {
    const isCorrect = button.dataset.correct === "true";
    button.disabled = true;
    if (isCorrect) {
      button.style.backgroundColor = "#4CAF50";
      button.style.color = "#fff";
    } else if (button === selectedBtn && !isCorrect) {
      button.style.backgroundColor = "#f44336";
      button.style.color = "#fff";
    } else {
      button.style.backgroundColor = "#ddd";
      button.style.color = "#000";
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
  shuffleArray(questions);
  document.getElementById('quiz').classList.remove('hidden');
  document.getElementById('result').classList.add('hidden');
  showQuestion();
});

loadData().catch(err => {
  console.error('Failed to load data:', err);
  document.getElementById('question').textContent = 'Error loading quiz data.';
});
