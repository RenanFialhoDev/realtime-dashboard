// Renderiza a animação de carregamento (spinner) dentro do container do card
function renderLoading(cardElement) {
    const contentArea = cardElement.querySelector('.card-content');
    if (!contentArea) return;

    contentArea.innerHTML = `
        <div class="loading-box">
            <div class="spinner"></div>
            <span>Buscando dados atrualizados…</span>
        </div>
    `
}

function renderError(cardElement, message, retryCallBack) {
    const contentArea = cardElement.querySelector('.card-content');
    if (!contentArea) return;

    contentArea.innerHTML = `
        <div class="error-box">
            <p>⚠️ ${message}</p>
            <button class="btn-retry"> Tentar Novamente</button>
        </div>
    `;

    const retryBtn = contentArea.querySelector('.btn-retry');
    if(retryBtn && typeof retryCallBack === 'function') {
        retryBtn.addEventListener('click', ()=> {
            retryCallBack()
        }, {once: true}); // '{once: true}' remove o ouvinte após ser clicado uma vez
    }
}