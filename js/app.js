import { fetchCountries } from './api.js';
import { elements, showScreen, updateScore, showFeedback } from './ui.js';

// --- ESTADO GLOBAL ---
const state = {
    countries: [],
    current: null,
    index: 0,
    mode: 'paises',
    score: { correct: 0, wrong: 0, total: 0 },
    isWaiting: false // Previene clics dobles y bucles durante las transiciones
};

// Helper: Normaliza texto (quita tildes, espacios extra y pasa a minúsculas)
const normalize = (s) => 
    s ? s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim() : "";

// --- INICIALIZACIÓN ---
async function init() {
    // Cargamos los datos de la API al arrancar
    state.countries = await fetchCountries();

    // Eventos de selección de modo (Home)
    document.getElementById('btn-mode-paises').onclick = () => startGame('paises');
    document.getElementById('btn-mode-capitales').onclick = () => startGame('capitales');

    // Botón Volver con confirmación para evitar pérdida de progreso accidental
    const btnBack = document.getElementById('btn-home-back');
    if (btnBack) {
        btnBack.onclick = () => {
            if (confirm("¿Seguro que quieres volver al inicio? Se perderá tu puntaje actual.")) {
                showScreen('home');
            }
        };
    }

    // Acciones de juego (Iconos: Tilde y X)
    document.getElementById('btn-check').onclick = checkAnswer;
    document.getElementById('btn-skip').onclick = handleFailure; // La X roja rinde la bandera actual

    // Soporte para tecla Enter en ambos inputs
    [elements.inputCountry, elements.inputCapital].forEach(input => {
        if (input) {
            input.onkeydown = (e) => { 
                if (e.key === 'Enter' && !state.isWaiting) checkAnswer(); 
            };
        }
    });
}

// --- LÓGICA DEL JUEGO ---

function startGame(mode) {
    state.mode = mode;
    state.score = { correct: 0, wrong: 0, total: 0 };
    // Mezclamos el array para que cada partida sea distinta
    state.countries.sort(() => Math.random() - 0.5);
    state.index = 0;
    state.isWaiting = false;

    // Ajustamos la UI según el modo
    elements.rowCapital.classList.toggle('hidden', mode === 'paises');
    document.getElementById('mode-label').textContent = mode.toUpperCase();
    
    showScreen('game');
    updateScore(state.score);
    renderQuestion();
}

function renderQuestion() {
    if (state.index >= state.countries.length) {
        alert("¡Felicidades! Completaste todos los países disponibles.");
        showScreen('home');
        return;
    }

    state.current = state.countries[state.index];
    state.isWaiting = false;

    // Actualizar Imagen y limpiar inputs
    elements.flagImg.src = state.current.flag;
    elements.inputCountry.value = '';
    elements.inputCapital.value = '';
    elements.feedback.classList.add('hidden');
    
    // Barra de progreso visual
    const progressPercent = (state.index / state.countries.length) * 100;
    const bar = document.getElementById('progress-fill');
    if (bar) bar.style.width = `${progressPercent}%`;

    elements.inputCountry.focus();
}

function checkAnswer() {
    if (state.isWaiting || !state.current) return;

    const userInput = normalize(elements.inputCountry.value);
    
    // Validamos contra todos los nombres posibles (alias) definidos en api.js
    const isCountryOk = state.current.allNames?.some(n => normalize(n) === userInput);
    
    let isCorrect = isCountryOk;

    // Si estamos en modo capital, ambas deben ser correctas
    if (state.mode === 'capitales') {
        const isCapitalOk = normalize(elements.inputCapital.value) === normalize(state.current.capital);
        isCorrect = isCountryOk && isCapitalOk;
    }

    if (isCorrect) {
        state.score.correct++;
        showFeedback("¡Correcto!", "correct");
        advance(1000); // Avanza tras 1 segundo de éxito
    } else {
        handleFailure();
    }
}

function handleFailure() {
    if (state.isWaiting) return;
    
    state.isWaiting = true;
    state.score.wrong++;
    state.score.total++;
    
    const message = state.mode === 'capitales' 
        ? `${state.current.name} — ${state.current.capital}` 
        : state.current.name;
    
    showFeedback(message, "wrong");
    updateScore(state.score);
    
    // Pausa de 1.5s para que el usuario pueda memorizar la respuesta correcta
    setTimeout(() => {
        state.index++;
        renderQuestion();
    }, 1500);
}

function advance(ms) {
    state.isWaiting = true;
    state.score.total++;
    updateScore(state.score);
    
    setTimeout(() => {
        state.index++;
        renderQuestion();
    }, ms);
}

// Arrancamos la aplicación
init();