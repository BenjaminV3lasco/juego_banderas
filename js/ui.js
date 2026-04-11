// js/ui.js

export function updateScore(s) {
    document.getElementById('score-correct').textContent = s.correct;
    document.getElementById('score-wrong').textContent = s.wrong;
    document.getElementById('score-total').textContent = s.total;
}

// ... resto de funciones de UI (setupGameUI, updateFlag, showFeedback, etc.) ...

export function setupGameUI(mode) {
    document.getElementById('screen-home').classList.add('hidden');
    document.getElementById('screen-game').classList.remove('hidden');
    document.getElementById('row-capital').classList.toggle('hidden', mode === 'paises');
    document.getElementById('mode-label').textContent = mode.toUpperCase();
}

export function updateFlag(src) {
    document.getElementById('flag-img').src = src;
    document.getElementById('input-pais').value = '';
    document.getElementById('input-capital').value = '';
    document.getElementById('feedback-box').classList.add('hidden');
    document.getElementById('input-pais').focus();
}

export function updateScore(s) {
    document.getElementById('score-correct').textContent = s.correct;
    document.getElementById('score-wrong').textContent = s.wrong;
    document.getElementById('score-total').textContent = s.total;
}

export function showFeedback(m, t) {
    const f = document.getElementById('feedback-box');
    f.textContent = m;
    f.className = `feedback ${t}`;
    f.classList.remove('hidden');
}

export function showFinalStats(state) {
    document.getElementById('screen-game').classList.add('hidden');
    document.getElementById('screen-stats').classList.remove('hidden');
    const container = document.getElementById('stats-content');
    
    const globalEfficacy = state.score.total > 0 ? ((state.score.correct / state.score.total) * 100).toFixed(1) : 0;
    
    let html = `<div class="global-result">Eficacia Global: ${globalEfficacy}%</div>`;
    
    // Generar tarjetas por región
    for (const [reg, data] of Object.entries(state.stats)) {
        const regPerc = ((data.correct / data.total) * 100).toFixed(1);
        html += `
            <div class="stat-card">
                <h3>${reg}: ${regPerc}%</h3>
                <div class="sub-grid">`;
        
        for (const [sub, subData] of Object.entries(data.subs)) {
            const subPerc = ((subData.correct / subData.total) * 100).toFixed(1);
            html += `<p><span>${sub}:</span> ${subPerc}%</p>`;
        }
        
        html += `</div></div>`;
    }
    container.innerHTML = html;
}