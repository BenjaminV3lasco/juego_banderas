// ─────────────────────────────────────────────
//  UI — pantallas, marcador y feedback
// ─────────────────────────────────────────────
 
// Referencias cacheadas al DOM (evita querySelector repetidos)
export const elements = {
    home:         document.getElementById('screen-home'),
    game:         document.getElementById('screen-game'),
    stats:        document.getElementById('screen-stats'),
    flagImg:      document.getElementById('flag-img'),
    inputCountry: document.getElementById('input-pais'),
    inputCapital: document.getElementById('input-capital'),
    rowCapital:   document.getElementById('row-capital'),
    feedback:     document.getElementById('feedback-box'),
    scoreCorrect: document.getElementById('score-correct'),
    scoreWrong:   document.getElementById('score-wrong'),
    scoreTotal:   document.getElementById('score-total')
};
 
// Muestra una pantalla y oculta las demás
export function showScreen(screen) {
    elements.home.classList.toggle('hidden',  screen !== 'home');
    elements.game.classList.toggle('hidden',  screen !== 'game');
    elements.stats.classList.toggle('hidden', screen !== 'stats');
}
 
// Actualiza los tres contadores del marcador
export function updateScore({ correct, wrong, total }) {
    elements.scoreCorrect.textContent = correct;
    elements.scoreWrong.textContent   = wrong;
    elements.scoreTotal.textContent   = total;
}
 
// Muestra el banner de feedback (correcto / incorrecto)
export function showFeedback(msg, type) {
    elements.feedback.textContent = msg;
    elements.feedback.className   = `feedback ${type}`;
    elements.feedback.classList.remove('hidden');
}