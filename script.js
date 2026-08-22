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

async function featchCurrencies() {
    const currencyCard = document.getElementById('.currency-card');

    try {
        renderLoading(currencyCard);

        const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');

        if(!response.ok) {
            throw new Error(`Falha na resposta do servidor (Status: ${response.status}`);
        }

        const data = response.json();
        renderCurrencyData(currencyCard, data);
    } catch (error) {
        console.error('Erro em fetchCurrencies: ', error.message);
        renderError(
            currencyCard,
            'Não foi possível obter as cotações financeiras.',
            featchCurrencies
        );
    }
}

async function renderCurrencyData(cardElement, data) {
    const contentArea = cardElement.querySelector('.card-content');
    if(!contentArea) return;

    const usd = data.USDBRL;
    const eur = data.EURBRL;

    const usdValue = Number(usd.bid).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
    const eurValue = Number(eur.bid).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

    // injeta o HTML formatado na tela
    contentArea.innerHTML = `
        <div>
            <span>🇺🇸 Dólar (${usd.code})</span>
            <span class="data-value">${usd.value}</span>
        </div>
        <div>
            <span>🇪🇺 Euro (${eur.code})</span>
            <span class="data-value">${eur.value}</span>
        </div>
    `
}