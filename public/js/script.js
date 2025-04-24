// public/js/script.js
const roleScreen = document.getElementById('role-screen');
const teacherScreen = document.getElementById('teacher-screen');
const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const resultsScreen = document.getElementById('results-screen');
const leaderboardScreen = document.getElementById('leaderboard-screen');
const teacherForm = document.getElementById('teacher-form');
const numQuestionsInput = document.getElementById('num-questions');
const questionsContainer = document.getElementById('questions-container');
const teacherPasscodeInput = document.getElementById('teacher-passcode');
const usernameForm = document.getElementById('username-form');
const usernameInput = document.getElementById('username-input');
const passcodeInput = document.getElementById('passcode-input');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progress-bar');
const timer = document.getElementById('timer');
const questionText = document.getElementById('question');
const categoryText = document.getElementById('category');
const answersDiv = document.getElementById('answer-buttons');
const nextBtn = document.getElementById('next-btn');
const hintBtn = document.getElementById('hint-btn');
const scoreText = document.getElementById('score');
const saveScoreBtn = document.getElementById('save-score-btn');
const viewLeaderboardBtn = document.getElementById('view-leaderboard');
const viewFullLeaderboardBtn = document.getElementById('view-full-leaderboard');
const restartBtn = document.getElementById('restart-quiz');
const backToQuizBtn = document.getElementById('back-to-quiz');
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const completeSound = document.getElementById('complete-sound');
const clickSound = document.getElementById('click-sound');
const backgroundMusic = document.getElementById('background-music');

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let totalQuestions = 0;
let hintsRemaining = 1;
let timerInterval;

// Set volume for gentle sounds
correctSound.volume = 0.5;
wrongSound.volume = 0.5;
completeSound.volume = 0.5;
clickSound.volume = 0.3;
backgroundMusic.volume = 0.2;

// Load leaderboard preview on page load
window.addEventListener('load', loadLeaderboardPreview);

// Role selection
document.getElementById('teacher-btn').addEventListener('click', () => {
    clickSound.play();
    roleScreen.classList.remove('active');
    teacherScreen.classList.add('active');
    generateQuestionInputs();
});

document.getElementById('student-btn').addEventListener('click', () => {
    clickSound.play();
    roleScreen.classList.remove('active');
    startScreen.classList.add('active');
});

// Handle number of questions input
numQuestionsInput.addEventListener('change', () => {
    generateQuestionInputs();
});

function generateQuestionInputs() {
    const numQuestions = parseInt(numQuestionsInput.value);
    questionsContainer.innerHTML = '';
    for (let i = 0; i < numQuestions; i++) {
        const questionBlock = document.createElement('div');
        questionBlock.classList.add('question-block');
        questionBlock.innerHTML = `
            <h4>Question ${i + 1}</h4>
            <div class="input-group">
                <input type="text" name="question-${i}" placeholder="Enter question" required>
            </div>
            <div class="input-group">
                <input type="text" name="option1-${i}" placeholder="Option 1" required>
            </div>
            <div class="input-group">
                <input type="text" name="option2-${i}" placeholder="Option 2" required>
            </div>
            <div class="input-group">
                <input type="text" name="option3-${i}" placeholder="Option 3" required>
            </div>
            <div class="input-group">
                <input type="text" name="option4-${i}" placeholder="Option 4" required>
            </div>
            <div class="input-group">
                <input type="text" name="correct_answer-${i}" placeholder="Correct Answer" required>
            </div>
            <div class="input-group">
                <input type="text" name="category-${i}" placeholder="Category (optional)">
            </div>
            <div class="input-group">
                <input type="text" name="hint-${i}" placeholder="Hint (optional)">
            </div>
        `;
        questionsContainer.appendChild(questionBlock);
    }
}

// Handle teacher form submission
teacherForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clickSound.play();
    const numQuestions = parseInt(numQuestionsInput.value);
    const passcode = teacherPasscodeInput.value.trim();

    if (!passcode) {
        alert('Please set a quiz passcode');
        return;
    }

    const questionsToAdd = [];
    for (let i = 0; i < numQuestions; i++) {
        const question = document.querySelector(`input[name="question-${i}"]`).value.trim();
        const option1 = document.querySelector(`input[name="option1-${i}"]`).value.trim();
        const option2 = document.querySelector(`input[name="option2-${i}"]`).value.trim();
        const option3 = document.querySelector(`input[name="option3-${i}"]`).value.trim();
        const option4 = document.querySelector(`input[name="option4-${i}"]`).value.trim();
        const correct_answer = document.querySelector(`input[name="correct_answer-${i}"]`).value.trim();
        const category = document.querySelector(`input[name="category-${i}"]`).value.trim();
        const hint = document.querySelector(`input[name="hint-${i}"]`).value.trim();

        if (!question || !option1 || !option2 || !option3 || !option4 || !correct_answer) {
            alert(`Please fill all fields for Question ${i + 1}`);
            return;
        }

        questionsToAdd.push({
            question,
            option1,
            option2,
            option3,
            option4,
            correct_answer,
            category: category || 'General',
            passcode,
            hint: hint || ''
        });
    }

    try {
        const response = await fetch('/api/questions/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ questions: questionsToAdd })
        });

        const data = await response.json();
        if (data.success) {
            alert('Questions added successfully! Students can now use the passcode to take the quiz.');
            teacherScreen.classList.remove('active');
            roleScreen.classList.add('active');
        } else {
            alert(data.message || 'Failed to add questions');
        }
    } catch (error) {
        console.error('Error adding questions:', error);
        alert('Failed to add questions: Network or server error');
    }
});

// Student quiz start
usernameForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clickSound.play();
    const username = usernameInput.value.trim();
    const passcode = passcodeInput.value.trim();
    if (!username) {
        alert('Please enter your name');
        return;
    }
    if (!passcode) {
        alert('Please enter a passcode');
        return;
    }

    localStorage.setItem('quiz-username', username);

    try {
        console.log(`Fetching questions with passcode: ${passcode}`);
        const response = await fetch(`/api/questions?passcode=${encodeURIComponent(passcode)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error:', errorData);
            alert(`Failed to start quiz: ${errorData.message || 'Unknown error'} (Status: ${response.status})`);
            return;
        }

        const data = await response.json();
        if (!data.success || !data.data || data.data.length === 0) {
            console.warn('No questions returned:', data);
            alert(data.message || 'No questions available for this passcode');
            return;
        }

        questions = data.data;
        totalQuestions = questions.length;
        hintsRemaining = 1;
        console.log('Questions loaded:', questions);
        startScreen.classList.remove('active');
        questionScreen.classList.add('active');
        backgroundMusic.play(); // Start background music
        startQuiz();
    } catch (error) {
        console.error('Fetch error:', error.message);
        alert(`Failed to start quiz: Network or server error - ${error.message}`);
    }
});

function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    nextBtn.classList.add('hide');
    hintBtn.classList.add('hide');
    showQuestion();
}

function showQuestion() {
    resetState();
    const question = questions[currentQuestionIndex];
    progress.textContent = `Question ${currentQuestionIndex + 1}/${totalQuestions}`;
    updateProgressBar();
    questionText.textContent = question.question;
    categoryText.textContent = question.category || 'General';
    
    if (question.hint && hintsRemaining > 0) {
        hintBtn.classList.remove('hide');
    }

    const options = [question.option1, question.option2, question.option3, question.option4];
    options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('btn', 'btn-option');
        button.addEventListener('click', () => {
            clickSound.play();
            selectAnswer(button, option, question.correct_answer);
        });
        answersDiv.appendChild(button);
    });

    startTimer(45);
}

function resetState() {
    nextBtn.classList.add('hide');
    hintBtn.classList.add('hide');
    while (answersDiv.firstChild) {
        answersDiv.removeChild(answersDiv.firstChild);
    }
    clearInterval(timerInterval);
    questionText.classList.remove('fade-in');
    void questionText.offsetWidth;
    questionText.classList.add('fade-in');
}

function updateProgressBar() {
    const percentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;
    const progressBarFill = progressBar.querySelector('.progress-bar-fill') || document.createElement('div');
    if (!progressBarFill.parentNode) {
        progressBarFill.classList.add('progress-bar-fill');
        progressBar.appendChild(progressBarFill);
    }
    progressBarFill.style.width = `${percentage}%`;
}

function startTimer(seconds) {
    let time = seconds;
    timer.textContent = `${time}`;
    timerInterval = setInterval(() => {
        time--;
        timer.textContent = `${time}`;
        if (time <= 0) {
            clearInterval(timerInterval);
            selectAnswer(null, null, questions[currentQuestionIndex].correct_answer);
        }
    }, 1000);
}

function selectAnswer(button, selected, correct) {
    clearInterval(timerInterval);
    const isCorrect = selected === correct;
    if (isCorrect) {
        score++;
        correctSound.play();
        launchConfettiForAnswer();
        if (button) button.classList.add('correct');
    } else {
        wrongSound.play();
        if (button) button.classList.add('wrong');
        Array.from(answersDiv.children).forEach(btn => {
            if (btn.textContent === correct) btn.classList.add('correct');
        });
    }
    nextBtn.classList.remove('hide');
}

hintBtn.addEventListener('click', () => {
    clickSound.play();
    if (hintsRemaining > 0) {
        const question = questions[currentQuestionIndex];
        if (question.hint) {
            alert(`Hint: ${question.hint}`);
            hintsRemaining--;
            if (hintsRemaining === 0) {
                hintBtn.classList.add('hide');
            }
        }
    } else {
        alert('No hints remaining!');
    }
});

nextBtn.addEventListener('click', () => {
    clickSound.play();
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestions) {
        showQuestion();
    } else {
        questionScreen.classList.remove('active');
        resultsScreen.classList.add('active');
        scoreText.textContent = `${score}/${totalQuestions}`;
        completeSound.play();
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        launchConfetti();
    }
});

saveScoreBtn.addEventListener('click', async () => {
    clickSound.play();
    try {
        const username = localStorage.getItem('quiz-username');
        const response = await fetch('/api/leaderboard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, score })
        });
        const data = await response.json();
        if (data.success) {
            alert('Score saved successfully!');
        } else {
            alert(data.message || 'Failed to save score');
        }
    } catch (error) {
        console.error('Error saving score:', error);
        alert('Failed to save score: Network or server error');
    }
});

viewLeaderboardBtn.addEventListener('click', () => {
    clickSound.play();
    showLeaderboard();
});
viewFullLeaderboardBtn.addEventListener('click', () => {
    clickSound.play();
    showLeaderboard();
});

backToQuizBtn.addEventListener('click', () => {
    clickSound.play();
    leaderboardScreen.classList.remove('active');
    startScreen.classList.add('active');
});

restartBtn.addEventListener('click', () => {
    clickSound.play();
    resultsScreen.classList.remove('active');
    startScreen.classList.add('active');
});

async function showLeaderboard() {
    startScreen.classList.remove('active');
    resultsScreen.classList.remove('active');
    leaderboardScreen.classList.add('active');
    const tbody = leaderboardScreen.querySelector('tbody');
    tbody.innerHTML = '';
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        if (data.success && data.data) {
            data.data.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.username}</td>
                    <td>${entry.score}</td>
                    <td>${new Date(entry.date).toLocaleDateString()}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="4">No scores available</td></tr>';
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        alert('Failed to load leaderboard');
    }
}

async function loadLeaderboardPreview() {
    const tbody = document.querySelector('#preview-leaderboard tbody');
    const loadingDiv = document.querySelector('.preview-loading');
    const leaderboardTable = document.getElementById('preview-leaderboard');
    try {
        const response = await fetch('/api/leaderboard');
        const data = await response.json();
        loadingDiv.classList.add('hide');
        leaderboardTable.classList.remove('hide');
        if (data.success && data.data && data.data.length > 0) {
            data.data.slice(0, 3).forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.username}</td>
                    <td>${entry.score}</td>
                `;
                tbody.appendChild(row);
            });
        } else {
            tbody.innerHTML = '<tr><td colspan="3">No scores yet</td></tr>';
        }
    } catch (error) {
        console.error('Error loading leaderboard preview:', error);
        loadingDiv.classList.add('hide');
        leaderboardTable.classList.remove('hide');
        tbody.innerHTML = '<tr><td colspan="3">Error loading leaderboard</td></tr>';
    }
}

function launchConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
    });
}

function launchConfettiForAnswer() {
    confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 }
    });
}