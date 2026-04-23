// ─────────────────────────────────────────────
//  app.js — punto de entrada
//  Solo registra eventos e inicializa la app
// ─────────────────────────────────────────────
import { state }                                from './state.js';
import { startGame, checkAnswer, handleFailure } from './game.js';
import { elements, showScreen, renderStats }                 from './ui/ui.js';
import { fetchCountries }                       from './api.js';
 
async function init() {
    // Carga los países desde la API antes de habilitar la UI
    state.countries = await fetchCountries();
 
    // Referencias a los modales
    const modalConfirm = document.getElementById('modal-confirm');
    const modalNick    = document.getElementById('modal-nickname');
    const inputNick    = document.getElementById('modal-input-nickname');

    let pendingMode = null; // Guardamos el modo elegido para activarlo tras el modal

    const openNickModal = (mode) => {
        pendingMode = mode;
        const savedNick = localStorage.getItem('juego_banderas_last_nick');
        if (savedNick) inputNick.value = savedNick;
        modalNick.classList.remove('hidden');
    };

    // Botón Jugar con Nickname
    document.getElementById('btn-modal-nick-confirm').onclick = () => {
        const nick = inputNick.value.trim();
        if (!nick) {
            alert('Por favor, ingresa un nickname o elige jugar como anónimo');
            inputNick.focus();
            return;
        }
        state.nickname = nick;
        localStorage.setItem('juego_banderas_last_nick', nick);
        modalNick.classList.add('hidden');
        startGame(pendingMode);
    };

    // Botón Jugar como Anónimo
    document.getElementById('btn-modal-nick-anon').onclick = () => {
        state.nickname = 'Anónimo';
        modalNick.classList.add('hidden');
        startGame(pendingMode);
    };

    // Selección de modo desde la pantalla de inicio
    document.getElementById('btn-mode-paises').onclick    = () => openNickModal('paises');
    document.getElementById('btn-mode-capitales').onclick = () => openNickModal('capitales');
    document.getElementById('btn-show-ranking').onclick   = () => renderStats();
 
    // Botón volver al inicio
    const btnModalConfirm = document.getElementById('btn-modal-confirm');
    const btnModalCancel  = document.getElementById('btn-modal-cancel');

    document.getElementById('btn-home-back').onclick = () => {
        modalConfirm.classList.remove('hidden');
    };

    btnModalConfirm.onclick = () => {
        modalConfirm.classList.add('hidden');
        showScreen('home');
    };

    btnModalCancel.onclick = () => {
        modalConfirm.classList.add('hidden');
    };

    // Botón reiniciar (después de terminar)
    document.getElementById('btn-restart').onclick = () => startGame(state.mode);

    // Cerrar modales al hacer clic fuera
    window.onclick = (e) => {
        if (e.target === modalConfirm) modalConfirm.classList.add('hidden');
        if (e.target === modalNick) modalNick.classList.add('hidden');
    };
 
    // Botones de acción durante el juego
    document.getElementById('btn-check').onclick = checkAnswer;
    document.getElementById('btn-skip').onclick  = () => { if (!state.isWaiting) handleFailure(); };
 
    // Confirmar con Enter en cualquiera de los dos inputs
    [elements.inputCountry, elements.inputCapital].forEach(input => {
        if (input) input.onkeydown = (e) => { if (e.key === 'Enter' && !state.isWaiting) checkAnswer(); };
    });
}
 
init();