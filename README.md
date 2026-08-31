# Documentação do Código - Dashboard Interativo

Este código é responsável por construir um painel (dashboard) interativo que exibe cotações de moedas estrangeiras (dólar e euro) e informações climáticas para uma cidade específica, como temperatura, localização e velocidade do vento. Ele utiliza múltiplas APIs para buscar os dados em tempo real e apresenta tudo de forma visual e dinâmica.

---

## Funcionalidades Principais
1. **Atualização das cotações de moedas estrangeiras (USD e EUR)**:
   - Requisição para a API pública [AwesomeAPI](https://docs.awesomeapi.com.br/) para buscar as taxas de câmbio em relação ao Real Brasileiro (BRL).

2. **Previsão do tempo para uma cidade**:
   - Utilização da API pública [Open-Meteo](https://open-meteo.com/) para obter dados de clima (temperatura, direção e velocidade do vento).
   - Geolocalização da cidade com a API de Geocodificação do Open-Meteo.

3. **Animações de carregamento e mensagens de erro**:
   - Exibe uma animação de "loading" enquanto os dados são buscados.
   - Mostra mensagens de erro contextuais e fornece um botão para "Tentar Novamente".

4. **Filtro de busca com debounce**:
   - Permite buscar a previsão do tempo de uma cidade enquanto o usuário digita no campo de busca, minimizando chamadas desnecessárias para a API.

---

## Estrutura de Funções

### 1. **Funções Utilitárias**
#### `renderLoading(cardElement)`
- Exibe uma animação de carregamento dentro de um card específico.
- Atualiza o conteúdo do card com uma animação e texto informativo.

```javascript
function renderLoading(cardElement) {
    const contentArea = cardElement.querySelector('.card-content');
    if (!contentArea) return;

    contentArea.innerHTML = `
        <div class="loading-box">
            <div class="spinner"></div>
            <span>Buscando dados atrualizados…</span>
        </div>
    `;
}
```

#### `renderError(cardElement, message, retryCallBack)`
- Exibe uma mensagem de erro no card alvo.
- Adiciona um botão "Tentar Novamente", que executa uma função de callback passada como parâmetro.

```javascript
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
    if (retryBtn && typeof retryCallBack === 'function') {
        retryBtn.addEventListener('click', () => {
            retryCallBack();
        }, {once: true});
    }
}
```

#### `debounce(func, delay = 500)`
- Implementa um sistema de "debounce" para evitar múltiplas chamadas consecutivas à mesma função em um curto período.

```javascript
function debounce(func, delay = 500) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}
```

---

### 2. **Funções de Dados**
#### `featchCurrencies()`
- Busca as cotações de moedas USD-BRL e EUR-BRL utilizando a API `AwesomeAPI`.
- Atualiza o card de moeda com os valores obtidos.
- Em caso de erro, exibe uma mensagem de erro usando `renderError`.

```javascript
async function featchCurrencies() {
    const currencyCard = document.getElementById('currency-card');

    try {
        renderLoading(currencyCard);

        const response = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL');

        if (!response.ok) {
            throw new Error(`Falha na resposta do servidor (Status: ${response.status})`);
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
```

#### `renderCurrencyData(cardElement, data)`
- Processa e exibe no card os valores de câmbio do dólar e euro.

```javascript
async function renderCurrencyData(cardElement, data) {
    const contentArea = cardElement.querySelector('.card-content');
    if (!contentArea) return;

    const usd = data.USDBRL;
    const eur = data.EURBRL;

    const usdValue = Number(usd.bid).toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    });

    const eurValue = Number(eur.bid).toLocaleString('pt-BR', {
        style: 'currency', currency: 'BRL'
    });

    contentArea.innerHTML = `
        <div>
            <span>🇺🇸 Dólar (${usd.code})</span>
            <span class="data-value">${usdValue}</span>
        </div>
        <div>
            <span>🇪🇺 Euro (${eur.code})</span>
            <span class="data-value">${eurValue}</span>
        </div>
    `;
}
```

#### `fetchWeather(cityName = 'São Paulo')`
- Busca a previsão do tempo de uma cidade utilizando a API Open-Meteo.
- Suporta argumentos opcionais para cidade.
- Em caso de erro, exibe uma mensagem de erro usando `renderError`.

```javascript
async function fetchWeather(cityName = 'São Paulo') {
    const weatherCard = document.getElementById('weather-card');

    try {
        renderLoading(weatherCard);

        const location = await searchCityGeo(cityName);

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}&current_weather=true`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erro ao conectar com Open-Meteo (Status: ${response.status})`);
        }

        const data = await response.json();
        renderWeatherData(weatherCard, {
            ...data,
            cityName: `${location.name}, ${location.country}`
        });

    } catch (error) {
        console.error('Erro em fetchWeather()', error.message);
        renderError(
            weatherCard,
            'Não foi possível obter a previsão do tempo.',
            fetchWeather
        );
    }
}
```

#### `searchCityGeo(cityName)`
- Realiza a geolocalização da cidade informada usando a API Open-Meteo Geocoding.
- Retorna um objeto com nome, país, latitude e longitude.

```javascript
async function searchCityGeo(cityName) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=pt`;

    const response = await fetch(url);

    if (!response.ok) throw new Error('Falha ao buscar localização');

    const data = await response.json();

    if (!data.results || data.results.length === 0) throw new Error('Cidade não encontrada!');

    return {
        name: data.results[0].name,
        country: data.results[0].country_code,
        lat: data.results[0].latitude,
        lon: data.results[0].longitude
    };
}
```

---

### 3. **Funções de Renderização**
#### `renderWeatherData(cardElement, data)`
- Atualiza o card com as informações de clima obtidas pela API Open-Meteo.

```javascript
function renderWeatherData(cardElement, data) {
    const contentArea = cardElement.querySelector('.card-content');
    if (!contentArea) return;

    const { temperature, windspeed } = data.current_weather;

    contentArea.innerHTML = `
        <div class="data-row">
            <span>📍Localização</span>
            <span class="data-value">${data.cityName}</span>
        </div>
        <div class="data-row">
            <span>🌡️Temperatura</span>
            <span class="data-value">${temperature}˚C</span>
        </div>
        <div class="data-row">
            <span>💨Vento</span>
            <span class="data-value">${windspeed}</span>
        </div>
    `;
}
```

---

## Configuração e Inicialização

### **`initDashboard()`**
- Função principal que executa as atualizações do painel.
- Carrega simultaneamente as cotações de moeda e as informações do clima.

```javascript
async function initDashboard() {
    const refreshBtn = document.getElementById('btn-refresh');
    cityInput.value = '';

    try {
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.textContent = '⏳ Carregando...';
        }

        await Promise.all([
            featchCurrencies(),
            fetchWeather()
        ]);
    } catch (error) {
        console.error('Erro geral durante a atualização do Dashboard:', error);
    } finally {
        if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = '&#8635; Atualizar';
        }
    }
}
```

---

## Resumo Técnico
- **APIs Consumidas**:
  - [AwesomeAPI](https://docs.awesomeapi.com.br): Cotações financeiras de moedas.
  - [Open-Meteo](https://open-meteo.com/): Previsão do tempo e geolocalização.

- **Tecnologias Utilizadas**:
  - JavaScript (ES6+)
  - API Fetch para requisições HTTP.
  - Manipulação do DOM para renderização dinâmica.

- **Requisitos**:
  - Navegador compatível com ES6 e Fetch API.
  - Ambiente com conexão ativa à internet para acessar as APIs públicas.

---

Com este README, é possível compreender a estrutura e as funcionalidades do código, bem como mantê-lo e ajustá-lo conforme necessário.