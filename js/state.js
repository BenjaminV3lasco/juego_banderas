
// ─────────────────────────────────────────────
//  Estado global de la partida
// ─────────────────────────────────────────────
 
export const state = {
    countries:    [],
    current:      null,
    index:        0,
    mode:         'paises',           // 'paises' | 'capitales'
    score:        { correct: 0, wrong: 0, total: 0 },
    stats:        {},                 // { region: { correct, total, subs: { subregion: {…} } } }
    capitalStats: { correct: 0, total: 0 },
    isWaiting:    false
};
 
export function resetState(mode) {
    state.mode         = mode;
    state.score        = { correct: 0, wrong: 0, total: 0 };
    state.stats        = {};
    state.capitalStats = { correct: 0, total: 0 };
    state.index        = 0;
    state.isWaiting    = false;
}
 
// Quita tildes, espacios extra y pasa a minúsculas para comparar respuestas
export const normalize = (s) =>
    s ? s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() : '';
// ── Cronómetro ────────────────────────────────
export const timer = {
    interval: null,
    seconds:  0
};
 
export function startTimer() {
    timer.seconds  = 0;
    clearInterval(timer.interval);
    const el = document.getElementById('game-timer');
    timer.interval = setInterval(() => {
        timer.seconds++;
        const m = String(Math.floor(timer.seconds / 60)).padStart(2, '0');
        const s = String(timer.seconds % 60).padStart(2, '0');
        if (el) el.textContent = `${m}:${s}`;
    }, 1000);
}
 
export function stopTimer() {
    clearInterval(timer.interval);
}
 
export function getTimerValue() {
    const m = String(Math.floor(timer.seconds / 60)).padStart(2, '0');
    const s = String(timer.seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
}