// ─────────────────────────────────────────────
//  Gestión de almacenamiento local (localStorage)
// ─────────────────────────────────────────────

import { saveGlobalRanking } from './firebase.js';

const STORAGE_KEY = 'juego_banderas_ranking';

/**
 * Guarda el resultado de una partida en local y en la nube.
 * @param {Object} gameData - Datos de la partida finalizada.
 */
export function saveGameResult(gameData) {
    const history = getLocalRanking();
    
    const entry = {
        nickname: gameData.nickname || 'Anónimo',
        date: new Date().toISOString(),
        mode: gameData.mode,
        correct: gameData.score.correct,
        total: gameData.score.total,
        time: gameData.finalTime,
        seconds: gameData.seconds // Para ordenar numéricamente mejor
    };

    history.push(entry);
    
    // Ordenar localmente
    history.sort((a, b) => {
        if (b.correct !== a.correct) return b.correct - a.correct;
        return a.seconds - b.seconds;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    // Guardar en la nube (Firebase)
    saveGlobalRanking(gameData);
}

/**
 * Recupera el ranking guardado.
 * @returns {Array} Lista de partidas guardadas.
 */
export function getLocalRanking() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

/**
 * Borra todo el historial (opcional, para mantenimiento).
 */
export function clearRanking() {
    localStorage.removeItem(STORAGE_KEY);
}
