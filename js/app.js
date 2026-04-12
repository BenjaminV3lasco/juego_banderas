import { fetchCountries } from './api.js';
import { elements, showScreen, updateScore, showFeedback, renderStats } from './ui.js';
 
// --- ESTADO GLOBAL ---
const state = {
    countries: [],
    current: null,
    index: 0,
    mode: 'paises',
    score: { correct: 0, wrong: 0, total: 0 },
    stats: {},                              // por región/subregión
    capitalStats: { correct: 0, total: 0 }, // solo en modo capitales
    isWaiting: false
};
 
const normalize = (s) =>
    s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";
 
// --- INICIALIZACIÓN ---
async function init() {
    state.countries = await fetchCountries();
 
    document.getElementById('btn-mode-paises').onclick   = () => startGame('paises');
    document.getElementById('btn-mode-capitales').onclick = () => startGame('capitales');
 
    const btnBack = document.getElementById('btn-home-back');
    if (btnBack) {
        btnBack.onclick = () => {
            if (confirm("¿Seguro que quieres volver al inicio? Se perderá tu puntaje actual.")) {
                showScreen('home');
            }
        };
    }
 
    document.getElementById('btn-check').onclick = checkAnswer;
    document.getElementById('btn-skip').onclick  = () => { if (!state.isWaiting) handleFailure(); };
 
    [elements.inputCountry, elements.inputCapital].forEach(input => {
        if (input) input.onkeydown = (e) => { if (e.key === 'Enter' && !state.isWaiting) checkAnswer(); };
    });
}
 
// --- LÓGICA DEL JUEGO ---
 
function startGame(mode) {
    state.mode = mode;
    state.score = { correct: 0, wrong: 0, total: 0 };
    state.stats = {};
    state.capitalStats = { correct: 0, total: 0 };
    state.countries.sort(() => Math.random() - 0.5);
    state.index = 0;
    state.isWaiting = false;
 
    elements.rowCapital.classList.toggle('hidden', mode === 'paises');
    document.getElementById('mode-label').textContent = mode.toUpperCase();
 
    showScreen('game');
    updateScore(state.score);
    renderQuestion();
}
 
function renderQuestion() {
    if (state.index >= state.countries.length) {
        renderStats(state);
        return;
    }
 
    state.current = state.countries[state.index];
    state.isWaiting = false;
 
    elements.flagImg.src = state.current.flag;
    elements.inputCountry.value = '';
    elements.inputCapital.value = '';
    elements.feedback.classList.add('hidden');
 
    const bar = document.getElementById('progress-fill');
    if (bar) bar.style.width = `${(state.index / state.countries.length) * 100}%`;
}
 
function checkAnswer() {
    if (state.isWaiting || !state.current) return;
 
    const userCountry  = normalize(elements.inputCountry.value);
    const isCountryOk  = state.current.allNames?.some(n => normalize(n) === userCountry);
 
    let isCorrect  = isCountryOk;
    let isCapitalOk = true;
 
    if (state.mode === 'capitales') {
        const userCapital = normalize(elements.inputCapital.value);
        // FIX: usa allCapitals para aceptar alias en español (Varsovia, Roma, etc.)
        isCapitalOk = state.current.allCapitals?.some(c => normalize(c) === userCapital);
        isCorrect   = isCountryOk && isCapitalOk;
    }
 
    if (isCorrect) {
        state.score.correct++;
        if (state.mode === 'capitales') state.capitalStats.correct++;
        showFeedback("¡Correcto!", "correct");
        advance(1000);
    } else {
        handleFailure();
    }
}
 
function handleFailure() {
    if (state.isWaiting) return;
    state.isWaiting = true;
    state.score.wrong++;
    state.score.total++;
    if (state.mode === 'capitales') state.capitalStats.total++;
    recordStat(false);
 
    const message = state.mode === 'capitales'
        ? `${state.current.name} — ${state.current.capital}`
        : state.current.name;
 
    showFeedback(message, "wrong");
    updateScore(state.score);
 
    setTimeout(() => { state.index++; renderQuestion(); }, 1500);
}
 
function advance(ms) {
    state.isWaiting = true;
    state.score.total++;
    if (state.mode === 'capitales') state.capitalStats.total++;
    recordStat(true);
    updateScore(state.score);
 
    setTimeout(() => { state.index++; renderQuestion(); }, ms);
}
 
function recordStat(isCorrect) {
    const region    = state.current.region    || 'Other';
    const subregion = state.current.subregion || 'Other';
 
    if (!state.stats[region])
        state.stats[region] = { correct: 0, total: 0, subs: {} };
    if (!state.stats[region].subs[subregion])
        state.stats[region].subs[subregion] = { correct: 0, total: 0 };
 
    state.stats[region].total++;
    state.stats[region].subs[subregion].total++;
    if (isCorrect) {
        state.stats[region].correct++;
        state.stats[region].subs[subregion].correct++;
    }
}
 
init();