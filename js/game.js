// ─────────────────────────────────────────────
//  Lógica del juego
// ─────────────────────────────────────────────
 
import { state, resetState, normalize, startTimer, stopTimer, getTimerValue } from './state.js';
import { recordStat }                   from './stats.js';
import { elements, showScreen, updateScore, showFeedback, renderStats } from './ui/ui.js';
 
// ── Arranque de partida ───────────────────────
 
export function startGame(mode) {
    resetState(mode);
    state.countries.sort(() => Math.random() - 0.5);
 
    elements.rowCapital.classList.toggle('hidden', mode === 'paises');
    document.getElementById('mode-label').textContent = mode.toUpperCase();
 
    showScreen('game');
    updateScore(state.score);
    startTimer();
    renderQuestion();
}
 
// ── Ciclo de preguntas ────────────────────────
 
export function renderQuestion() {
    if (state.index >= state.countries.length) {
        stopTimer();
        state.finalTime = getTimerValue();
        renderStats(state);
        return;
    }
 
    state.current   = state.countries[state.index];
    state.isWaiting = false;
 
    elements.flagImg.src          = state.current.flag;
    elements.inputCountry.value   = '';
    elements.inputCapital.value   = '';
    elements.feedback.classList.add('hidden');
 
    const bar = document.getElementById('progress-fill');
    if (bar) bar.style.width = `${(state.index / state.countries.length) * 100}%`;
}
 
// ── Evaluación de respuesta ───────────────────
 
export function checkAnswer() {
    if (state.isWaiting || !state.current) return;
 
    const userCountry = normalize(elements.inputCountry.value);
    const isCountryOk = state.current.allNames?.some(n => normalize(n) === userCountry);
 
    let isCorrect = isCountryOk;
 
    if (state.mode === 'capitales') {
        const userCapital = normalize(elements.inputCapital.value);
        const isCapitalOk = state.current.allCapitals?.some(c => normalize(c) === userCapital);
        isCorrect = isCountryOk && isCapitalOk;
    }
 
    if (isCorrect) {
        state.score.correct++;
        showFeedback('¡Correcto!', 'correct');
        advance(1000);
    } else {
        handleFailure();
    }
}
 
export function handleFailure() {
    if (state.isWaiting) return;
 
    state.isWaiting = true;
    state.score.wrong++;
    state.score.total++;
    recordStat(false);
 
    const message = state.mode === 'capitales'
        ? `${state.current.name} — ${state.current.capital}`
        : state.current.name;
 
    showFeedback(message, 'wrong');
    updateScore(state.score);
 
    setTimeout(() => { state.index++; renderQuestion(); }, 1500);
}
 
// ── Avance tras respuesta correcta ───────────
 
function advance(ms) {
    state.isWaiting = true;
    state.score.total++;
    recordStat(true);
    updateScore(state.score);
 
    setTimeout(() => { state.index++; renderQuestion(); }, ms);
}