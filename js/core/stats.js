// ─────────────────────────────────────────────
//  Registro y cálculo de estadísticas
// ─────────────────────────────────────────────
 
import { state } from './state.js';
 
// Registra el resultado de la pregunta actual en state.stats y state.capitalStats
export function recordStat(isCorrect) {
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
 
    if (state.mode === 'capitales') {
        state.capitalStats.total++;
        if (isCorrect) state.capitalStats.correct++;
    }
}