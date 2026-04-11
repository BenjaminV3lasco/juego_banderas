import { fetchCountries } from './api.js';
import * as ui from './ui.js';

const state = {
    countries: [],
    current: null,
    index: 0,
    mode: 'paises',
    score: { correct: 0, wrong: 0, total: 0 },
    stats: {}, // Para el desglose por continentes
    isWaiting: false
};

const normalize = (s) => s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

async function init() {
    state.countries = await fetchCountries();
    document.getElementById('btn-mode-paises').onclick = () => startGame('paises');
    document.getElementById('btn-mode-capitales').onclick = () => startGame('capitales');
    document.getElementById('btn-home-back').onclick = () => confirm("¿Volver?") && location.reload();
    document.getElementById('btn-check').onclick = checkAnswer;
    document.getElementById('btn-skip').onclick = () => handleAnswer(false);
    
    const inputs = [document.getElementById('input-pais'), document.getElementById('input-capital')];
    inputs.forEach(i => i.onkeydown = (e) => (e.key === 'Enter' && !state.isWaiting) && checkAnswer());
}

function startGame(mode) {
    state.mode = mode;
    state.score = { correct: 0, wrong: 0, total: 0 };
    state.stats = {};
    state.countries.sort(() => Math.random() - 0.5);
    state.index = 0;
    ui.setupGameUI(mode);
    renderQuestion();
}

function renderQuestion() {
    if (state.index >= state.countries.length) return ui.showFinalStats(state);
    state.current = state.countries[state.index];
    state.isWaiting = false;
    ui.updateFlag(state.current.flag);
}

function checkAnswer() {
    if (state.isWaiting) return;
    const userP = normalize(document.getElementById('input-pais').value);
    const userC = normalize(document.getElementById('input-capital').value);
    
    const isP = state.current.allNames.some(n => normalize(n) === userP);
    const isC = state.mode === 'capitales' ? state.current.allCapitals.some(c => normalize(c) === userC) : true;
    
    handleAnswer(isP && isC);
}

function handleAnswer(isCorrect) {
    state.isWaiting = true;
    
    // 1. ACTUALIZAR ESTADO (Contadores individuales)
    if (isCorrect) {
        state.score.correct++;
    } else {
        state.score.wrong++;
    }

    // 2. CÁLCULO ATÓMICO DEL TOTAL (El Fix)
    // No usamos ++, simplemente sumamos los dos estados actuales.
    state.score.total = state.score.correct + state.score.wrong;
    
    // 3. REGISTRAR ESTADÍSTICAS POR REGIÓN
    updateRegionalStats(isCorrect);
    
    // 4. ACTUALIZAR INTERFAZ
    ui.updateScore(state.score);

    // 5. FEEDBACK Y TRANSICIÓN
    const msg = isCorrect ? "¡Correcto!" : (state.mode === 'capitales' ? `${state.current.name} — ${state.current.capital}` : state.current.name);
    ui.showFeedback(msg, isCorrect ? 'correct' : 'wrong');
    
    setTimeout(() => { 
        state.index++; 
        renderQuestion(); 
    }, isCorrect ? 1000 : 1800);
}

function updateRegionalStats(isCorrect) {
    const { region, subregion } = state.current;
    if (!state.stats[region]) state.stats[region] = { total: 0, correct: 0, subs: {} };
    if (!state.stats[region].subs[subregion]) state.stats[region].subs[subregion] = { total: 0, correct: 0 };

    state.stats[region].total++;
    state.stats[region].subs[subregion].total++;
    
    if (isCorrect) {
        state.stats[region].correct++;
        state.stats[region].subs[subregion].correct++;
    }
}

init();