// ─────────────────────────────────────────────
//  Gestión de almacenamiento local (localStorage)
// ─────────────────────────────────────────────

const STORAGE_KEY = 'juego_banderas_ranking';

/**
 * Guarda el resultado de una partida en el ranking local.
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
    
    // Ordenar: Primero por más aciertos, luego por menos tiempo
    history.sort((a, b) => {
        if (b.correct !== a.correct) {
            return b.correct - a.correct;
        }
        return a.seconds - b.seconds;
    });

    // Guardar solo los top 10 o todos (por ahora todos para no perder info)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
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
