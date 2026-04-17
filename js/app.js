// ─────────────────────────────────────────────
//  app.js — punto de entrada
//  Solo registra eventos e inicializa la app
// ─────────────────────────────────────────────
import { state }                                from './state.js';
import { startGame, checkAnswer, handleFailure } from './game.js';
import { elements, showScreen }                 from './ui/ui.js';
import { fetchCountries }                       from './api.js';
 
async function init() {
    // Carga los países desde la API antes de habilitar la UI
    state.countries = await fetchCountries();
 
    // Selección de modo desde la pantalla de inicio
    document.getElementById('btn-mode-paises').onclick    = () => startGame('paises');
    document.getElementById('btn-mode-capitales').onclick = () => startGame('capitales');
 
    // Botón volver al inicio
    const modal        = document.getElementById('modal-confirm');
    const btnModalConfirm = document.getElementById('btn-modal-confirm');
    const btnModalCancel  = document.getElementById('btn-modal-cancel');

    document.getElementById('btn-home-back').onclick = () => {
        modal.classList.remove('hidden');
    };

    btnModalConfirm.onclick = () => {
        modal.classList.add('hidden');
        showScreen('home');
    };

    btnModalCancel.onclick = () => {
        modal.classList.add('hidden');
    };

    // Cerrar modal al hacer clic fuera del contenido
    modal.onclick = (e) => {
        if (e.target === modal) modal.classList.add('hidden');
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