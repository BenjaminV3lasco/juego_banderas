export const elements = {
    home: document.getElementById('screen-home'),
    game: document.getElementById('screen-game'),
    flagImg: document.getElementById('flag-img'),
    inputCountry: document.getElementById('input-pais'),
    inputCapital: document.getElementById('input-capital'),
    rowCapital: document.getElementById('row-capital'),
    feedback: document.getElementById('feedback-box'),
    scoreCorrect: document.getElementById('score-correct'),
    scoreWrong: document.getElementById('score-wrong'),
    scoreTotal: document.getElementById('score-total')
};

export function showScreen(screen) {
    elements.home.classList.toggle('hidden', screen !== 'home');
    elements.game.classList.toggle('hidden', screen !== 'game');
}

export function updateScore(score) {
    elements.scoreCorrect.textContent = score.correct;
    elements.scoreWrong.textContent = score.wrong;
    elements.scoreTotal.textContent = score.total;
}

export function showFeedback(msg, type) {
    elements.feedback.textContent = msg;
    elements.feedback.className = `feedback ${type}`;
    elements.feedback.classList.remove('hidden');
}