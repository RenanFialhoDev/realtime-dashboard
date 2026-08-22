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
    const currencyCard = document.getElementById('currency-card');

    try {
        renderLoading(currencyCard);

        const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');

        if(!response.ok) {
            throw new Error(`Falha na resposta do servidor (Status: ${response.status}`);
        }

        const data = await response.json();
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
            <span class="data-value">${usdValue}</span>
        </div>
        <div>
            <span>🇪🇺 Euro (${eur.code})</span>
            <span class="data-value">${eurValue}</span>
        </div>
    `
}

async function fetchWeather() {
    const weatherCard = document.getElementById('weather-card');

    const lat = -23.5505;
    const lon = -46.6333;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

    try {
        renderLoading(weatherCard);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro ao conectar com Open-Meteo (Status: ${response.status})`);
        }

        const data = await response.json();
        renderWeatherData(weatherCard, data);

    } catch (error) {
        console.error('Erro em fetchWeather()', error.message);
        renderError(
            weatherCard,
            'Não foi possível obter a previsão do tempo.',
            fetchWeather
        );
    }
}

function renderWeatherData(cardElement, data) {
    const contentArea = cardElement.querySelector('.card-content');
    if(!contentArea) return;

    const {temperature, windspeed} = data.current_weather;

    contentArea.innerHTML = `
        <div class="data-row">
            <span>📍Localização</span>
            <span class="data-value">São Paulo, BR</span>
        </div>
        <div class="data-row">
            <span>🌡️Temperatura</span>
            <span class="data-value">${temperature}˚C</span>
        </div>
        <div class="data-row">
            <span>💨Vento</span>
            <span class="data-value">${windspeed}</span>
        </div>
    `
}

async function initDashboard() {
    const refreshBtn = document.getElementById('btn-refresh');

    try {
        if(refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.textContent = '⏳ Carregando...';
        }

        await Promise.all([
            featchCurrencies(),
            fetchWeather()
        ])
    } catch (error) {
        console.error('Erro geral durante a atualização do Dashboard:', error);
    } finally {
        if(refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '&#8635; Atualizar'
        }
    }
}

const refreshBtn = document.getElementById('btn-refresh');
if(refreshBtn) {
    refreshBtn.addEventListener('click', ()=> {
        initDashboard();
    })
}

initDashboard();