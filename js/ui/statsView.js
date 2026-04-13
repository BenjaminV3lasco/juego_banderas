// ─────────────────────────────────────────────
//  UI — pantalla de estadísticas finales
// ─────────────────────────────────────────────
 
import { elements } from './screens.js';
 
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
    elements.game.classList.add('hidden');
    elements.stats.classList.remove('hidden');
 
    // Tarjeta global
    const gColor = barColor(state.score.correct, state.score.total);
    document.getElementById('stats-global').innerHTML = `
        <div class="sg-number" style="color:${gColor}">${pct(state.score.correct, state.score.total)}</div>
        <div class="sg-label">Acierto global — ${state.score.correct} de ${state.score.total} países</div>
        <div class="sg-bar-track">
            <div class="sg-bar-fill" style="width:${barWidth(state.score.correct, state.score.total)}%;background:${gColor}"></div>
        </div>`;
 
    // Tarjetas por región (acordeón)
    document.getElementById('stats-regions').innerHTML = REGION_ORDER
        .filter(key => state.stats[key])
        .map(key    => buildRegionHTML(key, state.stats[key]))
        .join('');
 
    initAccordion();
 
    // Tarjeta de capitales
    const capEl = document.getElementById('stats-capitals');
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