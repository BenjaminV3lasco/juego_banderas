export const elements = {
    home: document.getElementById('screen-home'),
    game: document.getElementById('screen-game'),
    flagImg: document.getElementById('flag-img'),
    inputCountry: document.getElementById('input-pais'),
    inputCapital: document.getElementById('input-capital'),
    rowCapital: document.getElementById('row-capital'),
    feedback: document.getElementById('feedback-box'),
    scoreCorrect: document.getElementById('score-correct'),
    scoreWrong: document.getElementById('score-wrong'),
    scoreTotal: document.getElementById('score-total')
};
 
export function showScreen(screen) {
    elements.home.classList.toggle('hidden', screen !== 'home');
    elements.game.classList.toggle('hidden', screen !== 'game');
    const stats = document.getElementById('screen-stats');
    if (stats) stats.classList.toggle('hidden', screen !== 'stats');
}
 
export function updateScore(score) {
    elements.scoreCorrect.textContent = score.correct;
    elements.scoreWrong.textContent = score.wrong;
    elements.scoreTotal.textContent = score.total;
}
 
export function showFeedback(msg, type) {
    elements.feedback.textContent = msg;
    elements.feedback.className = `feedback ${type}`;
    elements.feedback.classList.remove('hidden');
}
 
// ── Pantalla de estadísticas finales ──────────────────────────────────────
 
const REGION_NAMES = {
    'Europe':    'Europa',
    'Americas':  'América',
    'Africa':    'África',
    'Asia':      'Asia',
    'Oceania':   'Oceanía',
    'Antarctic': 'Antártida',
    'Other':     'Otros'
};
 
const SUBREGION_NAMES = {
    'Northern Europe': 'Norte de Europa',  'Southern Europe': 'Sur de Europa',
    'Eastern Europe':  'Este de Europa',   'Western Europe':  'Oeste de Europa',
    'Central Europe':  'Centro de Europa',
    'South America':   'América del Sur',  'Central America': 'América Central',
    'North America':   'América del Norte','Caribbean':       'Caribe',
    'Northern Africa': 'Norte de África',  'Southern Africa': 'Sur de África',
    'Eastern Africa':  'Este de África',   'Western Africa':  'Oeste de África',
    'Middle Africa':   'Centro de África',
    'Eastern Asia':    'Asia Oriental',    'Southern Asia':   'Asia Meridional',
    'South-Eastern Asia': 'Asia Sudoriental', 'Western Asia': 'Asia Occidental',
    'Central Asia':    'Asia Central',
    'Australia and New Zealand': 'Australia y Nueva Zelanda',
    'Melanesia': 'Melanesia', 'Micronesia': 'Micronesia', 'Polynesia': 'Polinesia',
};
 
const REGION_ORDER = ['Europe','Americas','Africa','Asia','Oceania','Antarctic','Other'];
 
function pct(correct, total) {
    return total ? ((correct / total) * 100).toFixed(1) + '%' : '—';
}
 
function barColor(correct, total) {
    if (!total) return '#e5e7eb';
    const p = correct / total;
    return p >= 0.75 ? '#10b981' : p >= 0.5 ? '#fbbf24' : '#ef4444';
}
 
function barWidth(correct, total) {
    return total ? (correct / total * 100) : 0;
}
 
export function renderStats(state) {
    elements.game.classList.add('hidden');
    document.getElementById('screen-stats').classList.remove('hidden');
 
    // ── Tarjeta global ──
    const gColor = barColor(state.score.correct, state.score.total);
    document.getElementById('stats-global').innerHTML = `
        <div class="sg-number" style="color:${gColor}">${pct(state.score.correct, state.score.total)}</div>
        <div class="sg-label">Acierto global — ${state.score.correct} de ${state.score.total} países</div>
        <div class="sg-bar-track"><div class="sg-bar-fill" style="width:${barWidth(state.score.correct,state.score.total)}%;background:${gColor}"></div></div>
    `;
 
    // ── Regiones ──
    let regHtml = '';
    for (const key of REGION_ORDER) {
        const data = state.stats[key];
        if (!data) continue;
        const rColor = barColor(data.correct, data.total);
 
        let subsHtml = '';
        for (const [subKey, sub] of Object.entries(data.subs)) {
            const sColor = barColor(sub.correct, sub.total);
            subsHtml += `
                <div class="sub-row">
                    <div class="sub-header">
                        <span class="sub-name">${SUBREGION_NAMES[subKey] || subKey}</span>
                        <span class="sub-pct" style="color:${sColor}">${pct(sub.correct, sub.total)}</span>
                    </div>
                    <div class="sub-bar-track"><div class="sub-bar-fill" style="width:${barWidth(sub.correct,sub.total)}%;background:${sColor}"></div></div>
                    <div class="sub-detail">${sub.correct} de ${sub.total} países</div>
                </div>`;
        }
 
        regHtml += `
            <div class="region-card">
                <div class="region-header">
                    <span class="region-name">${REGION_NAMES[key] || key}</span>
                    <span class="region-pct" style="color:${rColor}">${pct(data.correct, data.total)}</span>
                </div>
                <div class="region-bar-track"><div class="region-bar-fill" style="width:${barWidth(data.correct,data.total)}%;background:${rColor}"></div></div>
                <div class="region-detail">${data.correct} de ${data.total} países</div>
                <div class="subs-list">${subsHtml}</div>
            </div>`;
    }
    document.getElementById('stats-regions').innerHTML = regHtml;
 
    // ── Acierto de capitales (solo en modo capitales) ──
    const capEl = document.getElementById('stats-capitals');
    if (state.mode === 'capitales' && capEl) {
        const { correct, total } = state.capitalStats;
        const cColor = barColor(correct, total);
        capEl.classList.remove('hidden');
        capEl.innerHTML = `
            <div class="region-header">
                <span class="region-name">Acierto total de capitales</span>
                <span class="region-pct" style="color:${cColor}">${pct(correct, total)}</span>
            </div>
            <div class="region-bar-track"><div class="region-bar-fill" style="width:${barWidth(correct,total)}%;background:${cColor}"></div></div>
            <div class="region-detail">${correct} de ${total} capitales acertadas</div>
        `;
    } else if (capEl) {
        capEl.classList.add('hidden');
    }
}