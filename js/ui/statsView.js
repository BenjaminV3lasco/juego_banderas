// ─────────────────────────────────────────────
//  UI — pantalla de estadísticas finales
// ─────────────────────────────────────────────
 
import { elements } from './screens.js';
import { getLocalRanking } from '../storage.js';
 
// ── Traducciones ──────────────────────────────
 
const REGION_NAMES = {
    Europe:    'Europa',
    Americas:  'América',
    Africa:    'África',
    Asia:      'Asia',
    Oceania:   'Oceanía',
    Antarctic: 'Antártida',
    Other:     'Otros'
};
 
const SUBREGION_NAMES = {
    'Northern Europe':           'Norte de Europa',
    'Southern Europe':           'Sur de Europa',
    'Eastern Europe':            'Este de Europa',
    'Western Europe':            'Oeste de Europa',
    'Central Europe':            'Centro de Europa',
    'South America':             'América del Sur',
    'Central America':           'América Central',
    'North America':             'América del Norte',
    'Caribbean':                 'Caribe',
    'Northern Africa':           'Norte de África',
    'Southern Africa':           'Sur de África',
    'Eastern Africa':            'Este de África',
    'Western Africa':            'Oeste de África',
    'Middle Africa':             'Centro de África',
    'Eastern Asia':              'Asia Oriental',
    'Southern Asia':             'Asia Meridional',
    'South-Eastern Asia':        'Asia Sudoriental',
    'Western Asia':              'Asia Occidental',
    'Central Asia':              'Asia Central',
    'Australia and New Zealand': 'Australia y Nueva Zelanda',
    'Melanesia':                 'Melanesia',
    'Micronesia':                'Micronesia',
    'Polynesia':                 'Polinesia',
};
 
const REGION_ORDER = ['Europe', 'Americas', 'Africa', 'Asia', 'Oceania', 'Antarctic', 'Other'];
 
// ── Helpers ───────────────────────────────────
 
function pct(correct, total) {
    return total ? `${((correct / total) * 100).toFixed(1)}%` : '—';
}
 
function barColor(correct, total) {
    if (!total) return '#475569';
    const r = correct / total;
    if (r >= 0.75) return '#10b981';
    if (r >= 0.50) return '#fbbf24';
    return '#ef4444';
}
 
function barWidth(correct, total) {
    return total ? (correct / total) * 100 : 0;
}
 
// ── Constructores de HTML ─────────────────────
 
function buildSubregionHTML(subKey, sub) {
    const color = barColor(sub.correct, sub.total);
    return `
        <div class="sub-row">
            <div class="sub-header">
                <span class="sub-name">${SUBREGION_NAMES[subKey] || subKey}</span>
                <span class="sub-pct" style="color:${color}">${pct(sub.correct, sub.total)}</span>
            </div>
            <div class="sub-bar-track">
                <div class="sub-bar-fill" style="width:${barWidth(sub.correct, sub.total)}%;background:${color}"></div>
            </div>
            <div class="sub-detail">${sub.correct} de ${sub.total} países</div>
        </div>`;
}
 
function buildRegionHTML(key, data) {
    const color    = barColor(data.correct, data.total);
    const subsHTML = Object.entries(data.subs)
        .map(([subKey, sub]) => buildSubregionHTML(subKey, sub))
        .join('');
 
    return `
        <div class="region-card">
            <div class="region-header">
                <div class="region-left">
                    <span class="region-name">${REGION_NAMES[key] || key}</span>
                    <div class="region-bar-track">
                        <div class="region-bar-fill" style="width:${barWidth(data.correct, data.total)}%;background:${color}"></div>
                    </div>
                </div>
                <div class="region-right">
                    <span class="region-pct" style="color:${color}">${pct(data.correct, data.total)}</span>
                    <span class="region-detail">${data.correct} de ${data.total}</span>
                </div>
                <span class="region-chevron">▼</span>
            </div>
            <div class="region-body">
                <div class="subs-list">${subsHTML}</div>
            </div>
        </div>`;
}

function renderRanking() {
    const ranking = getLocalRanking(); // Mostrar todo el historial
    const container = document.getElementById('stats-ranking');
    if (!container) return;

    if (ranking.length === 0) {
        container.innerHTML = '';
        return;
    }

    const itemsHTML = ranking.map((entry, i) => {
        let rankClass = '';
        if (i === 0) rankClass = 'gold';
        else if (i === 1) rankClass = 'silver';
        else if (i === 2) rankClass = 'bronze';

        return `
            <div class="ranking-item">
                <div class="rank-pos ${rankClass}">#${i + 1}</div>
                <div class="rank-info">
                    <div class="rank-mode">${entry.nickname} <span class="rank-mode-type">(${entry.mode === 'paises' ? 'Países' : 'P+C'})</span></div>
                    <div class="rank-date">${new Date(entry.date).toLocaleDateString()}</div>
                </div>
                <div class="rank-score">${entry.correct}/${entry.total}</div>
                <div class="rank-time">${entry.time}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <h2 class="ranking-title">Ranking</h2>
        <div class="ranking-list">${itemsHTML}</div>
    `;
}
 
// ── Acordeón ──────────────────────────────────
 
function initAccordion() {
    document.querySelectorAll('.region-header').forEach(header => {
        header.addEventListener('click', () => {
            const card = header.closest('.region-card');
            card.classList.toggle('open');
        });
    });
}
 
// ── Función principal ─────────────────────────
 
export function renderStats(state) {
    elements.home.classList.add('hidden');
    elements.game.classList.add('hidden');
    elements.stats.classList.remove('hidden');

    const globalCard = document.getElementById('stats-global');
    const regionsContainer = document.getElementById('stats-regions');
    const capEl = document.getElementById('stats-capitals');
    const restartBtn = document.getElementById('btn-restart');

    // Si no hay estado (se accede desde el inicio)
    if (!state || !state.score.total) {
        globalCard.classList.add('hidden');
        regionsContainer.classList.add('hidden');
        if (capEl) capEl.classList.add('hidden');
        if (restartBtn) restartBtn.classList.add('hidden');
        renderRanking();
        return;
    }

    // Si hay estado, mostramos todo
    globalCard.classList.remove('hidden');
    regionsContainer.classList.remove('hidden');
    if (restartBtn) restartBtn.classList.remove('hidden');
 
    // Tarjeta global
    const gColor = barColor(state.score.correct, state.score.total);
    globalCard.innerHTML = `
        <div class="sg-number" style="color:${gColor}">${pct(state.score.correct, state.score.total)}</div>
        <div class="sg-label">Acierto global — ${state.score.correct} de ${state.score.total} países</div>
        <div class="sg-time">Tiempo total: ${state.finalTime || '—'}</div>
        <div class="sg-bar-track">
            <div class="sg-bar-fill" style="width:${barWidth(state.score.correct, state.score.total)}%;background:${gColor}"></div>
        </div>`;
 
    // Ranking histórico
    renderRanking();
 
    // Tarjetas por región (acordeón)
    regionsContainer.innerHTML = REGION_ORDER
        .filter(key => state.stats[key])
        .map(key    => buildRegionHTML(key, state.stats[key]))
        .join('');
 
    initAccordion();
 
    // Tarjeta de capitales
    if (!capEl) return;
 
    if (state.mode === 'capitales') {
        const { correct, total } = state.capitalStats;
        const color = barColor(correct, total);
        capEl.classList.remove('hidden');
        capEl.innerHTML = `
            <div class="region-header" style="cursor:default">
                <div class="region-left">
                    <span class="region-name">Acierto de capitales</span>
                    <div class="region-bar-track">
                        <div class="region-bar-fill" style="width:${barWidth(correct, total)}%;background:${color}"></div>
                    </div>
                </div>
                <div class="region-right">
                    <span class="region-pct" style="color:${color}">${pct(correct, total)}</span>
                    <span class="region-detail">${correct} de ${total}</span>
                </div>
            </div>`;
    } else {
        capEl.classList.add('hidden');
    }
}