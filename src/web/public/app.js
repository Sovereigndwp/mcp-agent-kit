// Global variables
let currentTab = 'dashboard';
let recentActivity = [];
let sovereigntyPathLoaded = false;

// API base URL
const API_BASE = window.location.origin;

// Utility functions
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading"></div>';
    }
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<div class="text-red-600">${message}</div>`;
    }
}

function formatCurrency(amount, currency = 'USD') {
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
        return '—';
    }

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    } catch {
        return `${amount.toLocaleString('en-US')} ${currency}`;
    }
}

function formatNumber(num) {
    if (typeof num !== 'number' || Number.isNaN(num)) {
        return '—';
    }
    return new Intl.NumberFormat('en-US').format(num);
}

function formatPercent(value, fractionDigits = 2) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '—';
    }
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(fractionDigits)}%`;
}

function addActivity(activity) {
    recentActivity.unshift(activity);
    if (recentActivity.length > 5) {
        recentActivity.pop();
    }
    updateRecentActivity();
}

function updateRecentActivity() {
    const container = document.getElementById('recent-activity');
    if (!container) return;

    if (recentActivity.length === 0) {
        container.innerHTML = '<div class="text-gray-500">No recent activity</div>';
        return;
    }

    container.innerHTML = recentActivity.map(activity => `
        <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-${activity.icon} mr-2 text-${activity.color}-500"></i>
            <span>${activity.text}</span>
            <span class="ml-auto text-xs text-gray-400">${activity.time}</span>
        </div>
    `).join('');
}

// Tab management
function showTab(tabName) {
    // Hide all tab contents
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.classList.add('hidden'));

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active', 'border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });

    // Show selected tab content
    const selectedTab = document.getElementById(tabName);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
    }

    // Add active class to selected tab button
    const selectedButton = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (selectedButton) {
        selectedButton.classList.add('active', 'border-blue-500', 'text-blue-600');
        selectedButton.classList.remove('border-transparent', 'text-gray-500');
    }

    currentTab = tabName;

    // Load tab-specific data
    loadTabData(tabName);
}

function loadTabData(tabName) {
    switch (tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'price':
            loadPriceData();
            break;
        case 'fees':
            loadFeeData();
            break;
        case 'news':
            loadNewsData();
            break;
        case 'canva':
            loadCanvaData();
            break;
        case 'learning':
            loadLearningData();
            break;
        case 'tutors':
            // Tutor tab loads on-demand when user interacts
            break;
    }
}

// API functions
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Dashboard functions
async function loadDashboardData() {
    let currentPriceUSD = null;

    try {
        const priceResponse = await apiCall('/api/bitcoin/price');
        if (priceResponse.success) {
            const { price, currency = 'USD', details = {} } = priceResponse.data || {};
            currentPriceUSD = typeof price === 'number' ? price : null;

            document.getElementById('dashboard-price').textContent = formatCurrency(currentPriceUSD ?? NaN, currency);

            const changePercent = typeof details.change24hPercent === 'number'
                ? details.change24hPercent
                : (typeof details.change24h === 'number' ? details.change24h : null);

            const changeElement = document.getElementById('dashboard-change');
            if (changePercent !== null) {
                changeElement.textContent = formatPercent(changePercent);
                changeElement.className = `text-2xl font-bold ${changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`;
            } else {
                changeElement.textContent = '—';
                changeElement.className = 'text-2xl font-bold text-gray-500';
            }
        } else {
            const priceElement = document.getElementById('dashboard-price');
            priceElement.textContent = '—';
            const changeElement = document.getElementById('dashboard-change');
            changeElement.textContent = '—';
            changeElement.className = 'text-2xl font-bold text-gray-500';
        }

        const feeResponse = await apiCall('/api/bitcoin/fees');
        if (feeResponse.success) {
            const { estimates } = feeResponse.data;
            const feeElement = document.getElementById('dashboard-fees');

            if (estimates && typeof estimates.hourFee === 'number' && typeof currentPriceUSD === 'number') {
                const feeUSD = (estimates.hourFee * 250 / 100000000) * currentPriceUSD;
                feeElement.textContent = formatCurrency(feeUSD);
            } else if (estimates) {
                feeElement.textContent = `${estimates.hourFee ?? '—'} sat/vB`;
            } else {
                feeElement.textContent = '—';
            }
        } else {
            document.getElementById('dashboard-fees').textContent = '—';
        }

        const newsResponse = await apiCall('/api/news?limit=5');
        if (newsResponse.success) {
            const { sentiment } = newsResponse.data;
            const sentimentText = sentiment?.sentiment?.overall
                ? sentiment.sentiment.overall.toUpperCase()
                : '—';
            document.getElementById('dashboard-sentiment').textContent = sentimentText;
        } else {
            document.getElementById('dashboard-sentiment').textContent = '—';
        }

        addActivity({
            icon: 'chart-line',
            color: 'blue',
            text: 'Dashboard data loaded',
            time: new Date().toLocaleTimeString()
        });

        loadSovereigntyPath();
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        document.getElementById('dashboard-price').textContent = '—';
        const changeElement = document.getElementById('dashboard-change');
        changeElement.textContent = '—';
        changeElement.className = 'text-2xl font-bold text-gray-500';
        document.getElementById('dashboard-fees').textContent = '—';
        document.getElementById('dashboard-sentiment').textContent = '—';
    }
}

async function loadSovereigntyPath(force = false) {
    if (sovereigntyPathLoaded && !force) {
        return;
    }

    const container = document.getElementById('sovereignty-path');
    if (!container) return;

    showLoading('sovereignty-path');

    try {
        const response = await apiCall('/api/sovereignty/path');
        if (!response.success) {
            throw new Error('Request failed');
        }

        const phases = response.data || [];
        container.innerHTML = phases.map(phase => {
            const modules = (phase.modules || []).sort((a, b) => a.order - b.order);
            const moduleList = modules.map(module => `
                <div class="flex items-start space-x-3 p-3 rounded border border-gray-200 bg-gray-50">
                    <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-orange-100 text-orange-600 font-bold rounded-full">${module.order}</div>
                    <div class="flex-1">
                        <div class="font-semibold text-gray-900">${module.title}</div>
                        <p class="text-sm text-gray-600 mb-2">${module.description}</p>
                        <a href="${module.route}" target="_blank" rel="noopener" class="inline-flex items-center text-sm text-orange-600 hover:text-orange-700 font-medium">
                            Launch module <i class="fas fa-external-link-alt ml-2"></i>
                        </a>
                    </div>
                </div>
            `).join('');

            return `
                <section class="border border-gray-200 rounded-lg p-4 flex flex-col space-y-3">
                    <div>
                        <h4 class="text-lg font-semibold text-gray-900">${phase.title}</h4>
                        <p class="text-sm text-gray-600">${phase.summary}</p>
                        <p class="text-xs text-gray-500 mt-1">${phase.context}</p>
                    </div>
                    <div class="space-y-3">${moduleList}</div>
                </section>
            `;
        }).join('');

        sovereigntyPathLoaded = true;
    } catch (error) {
        console.error('Failed to load sovereignty path:', error);
        showError('sovereignty-path', 'Unable to load sovereignty roadmap. Try reloading.');
    }
}

// Price functions
async function loadPriceData() {
    showLoading('price-details');
    showLoading('global-prices');

    try {
        const response = await apiCall('/api/bitcoin/price');
        if (response.success) {
            const { price, currency = 'USD', details = {}, conversions = {}, source, timestamp } = response.data || {};

            const changePercent = typeof details.change24hPercent === 'number'
                ? details.change24hPercent
                : (typeof details.change24h === 'number' ? details.change24h : null);
            const changeValue = typeof details.change24hValue === 'number' ? details.change24hValue : null;
            const high24h = details.high24h;
            const low24h = details.low24h;
            const marketCap = details.marketCap;
            const volume24h = details.volume24h;
            const lastUpdated = details.lastUpdated || (timestamp ? new Date(timestamp).toISOString() : null);

            const high24hDisplay = typeof high24h === 'number' ? formatCurrency(high24h, currency) : '—';
            const low24hDisplay = typeof low24h === 'number' ? formatCurrency(low24h, currency) : '—';

            document.getElementById('price-details').innerHTML = `
                <div class="bg-blue-50 p-4 rounded-lg">
                    <div class="text-3xl font-bold text-blue-600 mb-2">${formatCurrency(price, currency)}</div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">24h Change:</span>
                            <span class="${changePercent !== null ? (changePercent >= 0 ? 'text-green-600' : 'text-red-600') : 'text-gray-500'}">
                                ${changePercent !== null ? formatPercent(changePercent) : '—'}
                                ${changeValue !== null ? ` (${formatCurrency(changeValue, currency)})` : ''}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">24h High / Low:</span>
                            <span>${high24hDisplay} / ${low24hDisplay}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Market Cap:</span>
                            <span>${formatCurrency(marketCap ?? NaN, currency)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">24h Volume:</span>
                            <span>${formatCurrency(volume24h ?? NaN, currency)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Last Updated:</span>
                            <span>${lastUpdated ? new Date(lastUpdated).toLocaleString() : '—'}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Source:</span>
                            <span>${source || '—'}</span>
                        </div>
                    </div>
                </div>
            `;

            const conversionEntries = Object.entries(conversions || {})
                .filter(([code, value]) => code !== 'USD' && typeof value === 'number')
                .sort((a, b) => a[0].localeCompare(b[0]));

            if (conversionEntries.length > 0) {
                document.getElementById('global-prices').innerHTML = conversionEntries.map(([code, value]) => `
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="flex justify-between items-center">
                            <span class="font-medium">1 BTC</span>
                            <span class="text-lg font-bold">${formatCurrency(value, code)}</span>
                        </div>
                        <div class="text-xs text-gray-500 mt-1">${code}</div>
                    </div>
                `).join('');
            } else {
                document.getElementById('global-prices').innerHTML = '<div class="text-gray-500 text-sm">No conversion data available</div>';
            }

            addActivity({
                icon: 'dollar-sign',
                color: 'green',
                text: 'Price data loaded',
                time: new Date().toLocaleTimeString()
            });
        } else {
            showError('price-details', 'Failed to load price data');
            showError('global-prices', 'Failed to load conversion data');
        }
    } catch (error) {
        console.error('Failed to load price data:', error);
        showError('price-details', 'Failed to load price data');
        showError('global-prices', 'Failed to load conversion data');
    }
}

// Fee functions
async function loadFeeData() {
    showLoading('fee-estimates');
    showLoading('network-status');

    try {
        const response = await apiCall('/api/bitcoin/fees');
        if (response.success) {
            const { estimates, congestion } = response.data;
            
            // Fee estimates
            document.getElementById('fee-estimates').innerHTML = `
                <div class="space-y-3">
                    <div class="bg-green-50 p-3 rounded-lg">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-green-800">Fastest (1 confirmation)</span>
                            <span class="text-lg font-bold text-green-600">${estimates.fastestFee} sat/vB</span>
                        </div>
                    </div>
                    <div class="bg-blue-50 p-3 rounded-lg">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-blue-800">Half Hour (3 confirmations)</span>
                            <span class="text-lg font-bold text-blue-600">${estimates.halfHourFee} sat/vB</span>
                        </div>
                    </div>
                    <div class="bg-yellow-50 p-3 rounded-lg">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-yellow-800">Hour (6 confirmations)</span>
                            <span class="text-lg font-bold text-yellow-600">${estimates.hourFee} sat/vB</span>
                        </div>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-lg">
                        <div class="flex justify-between items-center">
                            <span class="font-medium text-gray-800">Economy (24+ hours)</span>
                            <span class="text-lg font-bold text-gray-600">${estimates.economyFee} sat/vB</span>
                        </div>
                    </div>
                </div>
            `;

            // Network status
            const congestionColors = {
                low: 'green',
                medium: 'yellow',
                high: 'orange',
                extreme: 'red'
            };

            document.getElementById('network-status').innerHTML = `
                <div class="bg-${congestionColors[congestion.level]}-50 p-4 rounded-lg">
                    <div class="text-center mb-3">
                        <div class="text-2xl font-bold text-${congestionColors[congestion.level]}-600 mb-1">
                            ${congestion.level.toUpperCase()}
                        </div>
                        <div class="text-sm text-${congestionColors[congestion.level]}-700">
                            ${congestion.description}
                        </div>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Pending Transactions:</span>
                            <span class="font-medium">${formatNumber(congestion.transactionCount)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Total Size:</span>
                            <span class="font-medium">${(congestion.totalSize / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                    </div>
                </div>
            `;

            addActivity({
                icon: 'coins',
                color: 'yellow',
                text: 'Fee data loaded',
                time: new Date().toLocaleTimeString()
            });
        }
    } catch (error) {
        console.error('Failed to load fee data:', error);
        showError('fee-estimates', 'Failed to load fee estimates');
        showError('network-status', 'Failed to load network status');
    }
}

// News functions
async function loadNewsData() {
    showLoading('news-headlines');
    showLoading('sentiment-analysis');

    try {
        const response = await apiCall('/api/news?limit=10');
        if (response.success) {
            const { headlines, sentiment } = response.data;
            
            // News headlines
            document.getElementById('news-headlines').innerHTML = headlines.map(headline => `
                <div class="border-l-4 border-blue-500 pl-4 py-3">
                    <h4 class="font-medium text-gray-900 mb-1">${headline.title}</h4>
                    <p class="text-sm text-gray-600 mb-2">${headline.description}</p>
                    <div class="flex items-center text-xs text-gray-500">
                        <span class="mr-3">${headline.source}</span>
                        <span>${new Date(headline.pubDate).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');

            // Sentiment analysis
            const sentimentColors = {
                positive: 'green',
                negative: 'red',
                neutral: 'gray'
            };

            document.getElementById('sentiment-analysis').innerHTML = `
                <div class="bg-${sentimentColors[sentiment.sentiment.overall]}-50 p-4 rounded-lg">
                    <div class="text-center mb-4">
                        <div class="text-2xl font-bold text-${sentimentColors[sentiment.sentiment.overall]}-600 mb-1">
                            ${sentiment.sentiment.overall.toUpperCase()}
                        </div>
                        <div class="text-sm text-${sentimentColors[sentiment.sentiment.overall]}-700">
                            Overall Market Sentiment
                        </div>
                    </div>
                    <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Positive:</span>
                            <span class="text-green-600 font-medium">${sentiment.sentiment.positive}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Negative:</span>
                            <span class="text-red-600 font-medium">${sentiment.sentiment.negative}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Neutral:</span>
                            <span class="text-gray-600 font-medium">${sentiment.sentiment.neutral}</span>
                        </div>
                    </div>
                </div>
            `;

            addActivity({
                icon: 'newspaper',
                color: 'purple',
                text: 'News data loaded',
                time: new Date().toLocaleTimeString()
            });
        }
    } catch (error) {
        console.error('Failed to load news data:', error);
        showError('news-headlines', 'Failed to load news');
        showError('sentiment-analysis', 'Failed to load sentiment');
    }
}

// Simulation functions
function setupSimulationForm() {
    const form = document.getElementById('simulation-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                transactionSize: parseInt(document.getElementById('tx-size').value),
                targetConfirmations: parseInt(document.getElementById('confirmations').value),
                urgency: document.getElementById('urgency').value,
                btcAmount: parseFloat(document.getElementById('btc-amount').value)
            };

            showLoading('simulation-results');

            try {
                const response = await apiCall('/api/simulation/create', {
                    method: 'POST',
                    body: JSON.stringify(formData)
                });

                if (response.success) {
                    const scenario = response.data;
                    
                    document.getElementById('simulation-results').innerHTML = `
                        <div class="bg-blue-50 p-4 rounded-lg">
                            <h4 class="font-semibold text-blue-900 mb-3">${scenario.name}</h4>
                            <div class="space-y-2 text-sm">
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Fee Rate:</span>
                                    <span class="font-medium">${scenario.results.feeRate} sat/vB</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Total Fee:</span>
                                    <span class="font-medium">${formatCurrency(scenario.results.totalFeeUSD)}</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Confirmations:</span>
                                    <span class="font-medium">${scenario.results.estimatedConfirmations} blocks</span>
                                </div>
                                <div class="flex justify-between">
                                    <span class="text-gray-600">Cost %:</span>
                                    <span class="font-medium">${scenario.results.costPercentage.toFixed(2)}%</span>
                                </div>
                            </div>
                            <div class="mt-3 pt-3 border-t border-blue-200">
                                <div class="text-xs text-blue-700">
                                    <strong>Recommendation:</strong> ${scenario.results.recommendations[0]}
                                </div>
                            </div>
                        </div>
                    `;

                    addActivity({
                        icon: 'calculator',
                        color: 'blue',
                        text: 'Simulation created',
                        time: new Date().toLocaleTimeString()
                    });
                }
            } catch (error) {
                console.error('Failed to create simulation:', error);
                showError('simulation-results', 'Failed to create simulation');
            }
        });
    }
}

// Canva functions
async function loadCanvaData() {
    showLoading('canva-snippets');
}

async function generateCanvaSnippets() {
    showLoading('canva-snippets');

    try {
        const response = await apiCall('/api/canva/snippets');
        if (response.success) {
            const snippets = response.data;
            
            document.getElementById('canva-snippets').innerHTML = `
                <div class="md:col-span-2">
                    <h3 class="text-lg font-semibold mb-4">Generated Snippets</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${Object.entries(snippets).map(([key, snippet]) => `
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-semibold text-gray-900 mb-2">${snippet.title}</h4>
                                <div class="text-sm text-gray-600 space-y-1">
                                    ${Object.entries(snippet).filter(([k, v]) => k !== 'title' && k !== 'timestamp').map(([k, v]) => `
                                        <div class="flex justify-between">
                                            <span class="capitalize">${k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                            <span class="font-medium">${typeof v === 'number' ? formatNumber(v) : v}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            addActivity({
                icon: 'palette',
                color: 'purple',
                text: 'Canva snippets generated',
                time: new Date().toLocaleTimeString()
            });
        }
    } catch (error) {
        console.error('Failed to generate Canva snippets:', error);
        showError('canva-snippets', 'Failed to generate snippets');
    }
}

// Learning functions
async function loadLearningData() {
    showLoading('curriculum-content');

    try {
        const response = await apiCall('/api/curriculum');
        if (response.success) {
            const curriculum = response.data;
            
            document.getElementById('curriculum-content').innerHTML = curriculum.map(path => `
                <div class="bg-white border rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-semibold text-gray-900">${path.title}</h3>
                        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            ${path.totalDuration}
                        </span>
                    </div>
                    <p class="text-gray-600 mb-4">${path.description}</p>
                    <div class="mb-4">
                        <span class="text-sm font-medium text-gray-700">Target Audience:</span>
                        <span class="text-sm text-gray-600 ml-2">${path.targetAudience}</span>
                    </div>
                    <div class="space-y-2">
                        <h4 class="font-medium text-gray-900">Modules:</h4>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                            ${path.modules.map(module => `
                                <div class="flex items-center text-sm">
                                    <i class="fas fa-${getModuleIcon(module.difficulty)} text-${getModuleColor(module.difficulty)}-500 mr-2"></i>
                                    <span class="text-gray-700">${module.title}</span>
                                    <span class="ml-auto text-xs text-gray-500">${module.duration}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `).join('');

            addActivity({
                icon: 'graduation-cap',
                color: 'green',
                text: 'Curriculum loaded',
                time: new Date().toLocaleTimeString()
            });
        }
    } catch (error) {
        console.error('Failed to load curriculum:', error);
        showError('curriculum-content', 'Failed to load curriculum');
    }
}

function getModuleIcon(difficulty) {
    const icons = {
        beginner: 'play',
        intermediate: 'cog',
        advanced: 'star'
    };
    return icons[difficulty] || 'book';
}

function getModuleColor(difficulty) {
    const colors = {
        beginner: 'green',
        intermediate: 'yellow',
        advanced: 'red'
    };
    return colors[difficulty] || 'gray';
}

// AI Tutor helpers
function attachTutorHandlers() {
    const bindClick = (id, handler) => {
        const element = document.getElementById(id);
        if (element && !element.dataset.bound) {
            element.addEventListener('click', handler);
            element.dataset.bound = 'true';
        }
    };

    bindClick('story-navigator-btn', generateStoryNavigator);
    bindClick('visual-synth-btn', generateVisualSynthesis);
    bindClick('debate-arena-btn', generateDebateArena);
    bindClick('future-oracle-btn', generateFutureOracle);
    bindClick('strategy-advisor-btn', generateStrategyAdvisor);
    bindClick('data-poet-btn', generateDataPoet);
}

async function generateStoryNavigator() {
    const resultId = 'story-navigator-result';
    showLoading(resultId);

    try {
        const name = document.getElementById('story-name')?.value || '';
        const interestsRaw = document.getElementById('story-interests')?.value || '';
        const goal = document.getElementById('story-goal')?.value || '';

        const interests = interestsRaw
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);

        const response = await fetch('/api/tutors/story-navigator', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ learnerName: name, interests, goal })
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
            throw new Error(payload.error || 'Unable to generate narrative');
        }

        renderStoryNavigatorResult(payload.data);
    } catch (error) {
        console.error('Story Navigator failed', error);
        showError('story-navigator-result', error.message || 'Failed to generate narrative');
    }
}

function renderStoryNavigatorResult(data) {
    const container = document.getElementById('story-navigator-result');
    if (!container) return;

    const storyline = data?.storyline || [];
    const chapters = storyline.map(chapter => `
        <div class="border border-gray-200 rounded p-3">
            <h4 class="font-semibold text-gray-900">${chapter.title}</h4>
            <p class="text-xs text-gray-500 mb-2">${chapter.year} · ${chapter.setting}</p>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${(chapter.keyEvents || []).map(event => `<li>${event}</li>`).join('')}
            </ul>
            <p class="text-sm text-gray-600 mt-2">${chapter.bitcoinRelevance}</p>
            <p class="text-sm text-gray-600 italic mt-2">${chapter.decisionPoint}</p>
            <p class="text-sm text-gray-700 mt-2"><strong>Sovereignty Signal:</strong> ${chapter.sovereigntySignal}</p>
        </div>
    `).join('');

    const reflections = data?.reflections?.prompts || [];
    const experiences = data?.recommendedExperiences || [];
    const nextSteps = data?.nextSteps || [];

    container.innerHTML = `
        <div class="bg-blue-50 border border-blue-100 rounded p-3">
            <p class="text-sm text-blue-800">${data?.profile?.name || 'Explorer'} is primed to turn Bitcoin history into actionable conviction.</p>
            ${data?.profile?.goal ? `<p class="text-sm text-blue-700 mt-1">Goal: ${data.profile.goal}</p>` : ''}
        </div>
        <div class="mt-3 space-y-3">${chapters}</div>
        <div class="mt-4">
            <h4 class="font-semibold text-gray-900">Reflection Prompts</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${reflections.map(prompt => `<li>${prompt}</li>`).join('')}
            </ul>
        </div>
        ${experiences.length ? `
        <div class="mt-4">
            <h4 class="font-semibold text-gray-900">Suggested Experiences</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${experiences.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>` : ''}
        ${nextSteps.length ? `
        <div class="mt-4">
            <h4 class="font-semibold text-gray-900">Next Steps</h4>
            <ol class="list-decimal list-inside text-sm text-gray-700 space-y-1">
                ${nextSteps.map(step => `<li>${step}</li>`).join('')}
            </ol>
        </div>` : ''}
    `;
}

async function generateVisualSynthesis() {
    const resultId = 'visual-synth-result';
    showLoading(resultId);

    try {
        const concept = document.getElementById('visual-concept')?.value || 'Bitcoin self-custody';
        const audience = document.getElementById('visual-audience')?.value || 'beginner';
        const visualType = document.getElementById('visual-type')?.value || 'process_flow';
        const interactivity = document.getElementById('visual-interactivity')?.checked || false;

        const response = await fetch('/api/tutors/visual-synth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ concept, audience, visualType, interactivity })
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
            throw new Error(payload.error || 'Unable to create visual brief');
        }

        renderVisualSynthResult(payload.data);
    } catch (error) {
        console.error('Visual Synthesizer failed', error);
        showError('visual-synth-result', error.message || 'Failed to generate visual concept');
    }
}

function renderVisualSynthResult(data) {
    const container = document.getElementById('visual-synth-result');
    if (!container) return;

    const infographic = data?.infographic || {};
    const educational = data?.educationalValue || {};
    const palette = data?.colorPalette || [];

    container.innerHTML = `
        <div class="bg-purple-50 border border-purple-100 rounded p-3">
            <p class="text-sm text-purple-800">Concept focus: <strong>${infographic.concept || data?.concept}</strong></p>
            <p class="text-xs text-purple-600">Audience: ${infographic.targetAudience || data?.audience} · Visual type: ${infographic.visualType || data?.visualType}</p>
        </div>
        ${infographic.contentStructure ? `
        <div class="mt-3">
            <h4 class="font-semibold text-gray-900">Content Structure</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${(infographic.contentStructure.sections || []).map(section => `<li>${section.title || section}</li>`).join('')}
            </ul>
        </div>` : ''}
        ${educational.learningOutcomes ? `
        <div class="mt-3">
            <h4 class="font-semibold text-gray-900">Learning Outcomes</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${educational.learningOutcomes.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>` : ''}
        ${palette.length ? `
        <div class="mt-3">
            <h4 class="font-semibold text-gray-900">Suggested Palette</h4>
            <div class="flex space-x-2 mt-2">
                ${palette.map(color => `<span class="w-6 h-6 rounded-full border" style="background:${color}"></span>`).join('')}
            </div>
        </div>` : ''}
        ${data?.realWorldApplications ? `
        <div class="mt-3">
            <h4 class="font-semibold text-gray-900">Real-World Anchors</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${data.realWorldApplications.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>` : ''}
    `;
}

async function generateDebateArena() {
    const resultId = 'debate-arena-result';
    showLoading(resultId);

    try {
        const topic = document.getElementById('debate-topic')?.value || 'Bitcoin energy usage';
        const focus = document.getElementById('debate-focus')?.value || 'economic';
        const difficulty = document.getElementById('debate-difficulty')?.value || 'intermediate';

        const response = await fetch('/api/tutors/debate-arena', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, focus, difficulty })
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
            throw new Error(payload.error || 'Unable to prepare debate');
        }

        renderDebateArenaResult(payload.data);
    } catch (error) {
        console.error('Debate Arena failed', error);
        showError('debate-arena-result', error.message || 'Failed to generate debate session');
    }
}

function renderDebateArenaResult(data) {
    const container = document.getElementById('debate-arena-result');
    if (!container) return;

    const participants = data?.participants || [];
    const rounds = data?.rounds || [];

    container.innerHTML = `
        <div class="bg-blue-50 border border-blue-100 rounded p-3">
            <p class="text-sm text-blue-800">Topic: <strong>${data?.topic}</strong></p>
            <p class="text-xs text-blue-600">Focus: ${data?.focus} · Level: ${data?.difficulty}</p>
        </div>
        <div class="mt-3">
            <h4 class="font-semibold text-gray-900">Panels</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${participants.map(p => `<li><strong>${p.name}</strong> — ${p.archetype}</li>`).join('')}
            </ul>
        </div>
        <div class="mt-3 space-y-3">
            ${rounds.map(round => `
                <div class="border border-gray-200 rounded p-3">
                    <h5 class="font-semibold text-gray-900">${round.participant}</h5>
                    <p class="text-sm text-gray-700 mb-2">${round.stance}</p>
                    <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                        ${(round.supportingPoints || []).map(point => `<li>${point}</li>`).join('')}
                    </ul>
                    <div class="mt-2 space-y-1">
                        ${(round.rebuttalTargets || []).map(item => `<p class="text-xs text-gray-500"><strong>Rebuttal to ${item.opponent}:</strong> ${item.rebuttal}</p>`).join('')}
                    </div>
                    <p class="text-sm text-gray-700 mt-2"><strong>Takeaway:</strong> ${round.takeaway}</p>
                </div>
            `).join('')}
        </div>
        ${data?.moderatorNotes ? `
        <div class="mt-3 bg-gray-50 border border-gray-200 rounded p-3">
            <h4 class="font-semibold text-gray-900">Moderator Notes</h4>
            <p class="text-sm text-gray-700">${data.moderatorNotes.framing}</p>
            <h5 class="text-sm font-semibold text-gray-800 mt-2">Learning Signals</h5>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${(data.moderatorNotes.learningSignals || []).map(item => `<li>${item}</li>`).join('')}
            </ul>
            <h5 class="text-sm font-semibold text-gray-800 mt-2">Follow-ups</h5>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${(data.moderatorNotes.suggestedFollowUps || []).map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>` : ''}
    `;
}

async function generateFutureOracle() {
    const resultId = 'future-oracle-result';
    showLoading(resultId);

    try {
        const horizon = document.getElementById('oracle-horizon')?.value || '2040';
        const scenario = document.getElementById('oracle-scenario')?.value || 'balanced_adoption';

        const response = await fetch('/api/tutors/future-oracle', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ horizon, scenario })
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
            throw new Error(payload.error || 'Unable to simulate future');
        }

        renderFutureOracleResult(payload.data);
    } catch (error) {
        console.error('Future Oracle failed', error);
        showError('future-oracle-result', error.message || 'Failed to generate future scenario');
    }
}

function renderFutureOracleResult(data) {
    const container = document.getElementById('future-oracle-result');
    if (!container) return;

    const milestones = data?.milestones || [];
    const risks = data?.riskRadar || [];
    const opportunities = data?.opportunityMap || {};

    container.innerHTML = `
        <div class="bg-teal-50 border border-teal-100 rounded p-3">
            <p class="text-sm text-teal-800"><strong>${data?.headline || 'Future outlook ready'}</strong></p>
        </div>
        ${milestones.length ? `
        <div class="mt-3">
            <h4 class="font-semibold text-gray-900">Milestones</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${milestones.map(item => `<li><span class="font-semibold text-gray-900">${item.year}</span> — ${item.highlight}</li>`).join('')}
            </ul>
        </div>` : ''}
        ${risks.length ? `
        <div class="mt-3">
            <h4 class="font-semibold text-gray-900">Risk Radar</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${risks.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>` : ''}
        ${opportunities.builderOpportunities ? `
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="border border-gray-200 rounded p-3">
                <h5 class="font-semibold text-gray-900">Builder Opportunities</h5>
                <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                    ${opportunities.builderOpportunities.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="border border-gray-200 rounded p-3">
                <h5 class="font-semibold text-gray-900">Learning Priorities</h5>
                <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                    ${(opportunities.learningPriorities || []).map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
            <div class="border border-gray-200 rounded p-3 sm:col-span-2">
                <h5 class="font-semibold text-gray-900">Capital Allocation Themes</h5>
                <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                    ${(opportunities.capitalAllocation || []).map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        </div>` : ''}
    `;
}

async function generateStrategyAdvisor() {
    const resultId = 'strategy-advisor-result';
    showLoading(resultId);

    try {
        const currentLevel = document.getElementById('strategy-level')?.value || 'learning';
        const riskTolerance = document.getElementById('strategy-risk')?.value || 'medium';
        const focusRaw = document.getElementById('strategy-focus')?.value || '';
        const timeframe = document.getElementById('strategy-timeframe')?.value || 'medium-term';
        const priorityAreas = focusRaw.split(',').map(item => item.trim()).filter(Boolean);

        const response = await fetch('/api/tutors/strategy-advisor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentLevel, riskTolerance, priorityAreas, timeframe })
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
            throw new Error(payload.error || 'Unable to build strategy');
        }

        renderStrategyAdvisorResult(payload.data);
    } catch (error) {
        console.error('Strategy Advisor failed', error);
        showError('strategy-advisor-result', error.message || 'Failed to build sovereignty roadmap');
    }
}

function renderStrategyAdvisorResult(data) {
    const container = document.getElementById('strategy-advisor-result');
    if (!container) return;

    const readiness = data?.readiness || {};
    const roadmap = data?.roadmap?.sovereigntyPath || {};

    container.innerHTML = `
        <div class="bg-green-50 border border-green-100 rounded p-3">
            <p class="text-sm text-green-800">Readiness score: <strong>${readiness.readinessScore?.overall || 'N/A'}</strong></p>
            <p class="text-xs text-green-700">Focus: ${(data?.focusAreas || []).join(', ') || 'self-custody, privacy'}</p>
        </div>
        ${roadmap.phases ? `
        <div class="mt-3 space-y-3">
            ${(roadmap.phases || []).map(phase => `
                <div class="border border-gray-200 rounded p-3">
                    <h5 class="font-semibold text-gray-900">${phase.title}</h5>
                    <p class="text-xs text-gray-500 mb-2">${phase.duration} · Risk: ${phase.riskLevel}</p>
                    <p class="text-sm text-gray-700">${phase.description}</p>
                    <ul class="list-disc list-inside text-sm text-gray-700 space-y-1 mt-2">
                        ${(phase.practices || []).map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>` : ''}
        ${data?.quickWins?.length ? `
        <div class="mt-3">
            <h4 class="font-semibold text-gray-900">Quick Wins</h4>
            <ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
                ${data.quickWins.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>` : ''}
        ${data?.accountability ? `
        <div class="mt-3 bg-gray-50 border border-gray-200 rounded p-3">
            <h4 class="font-semibold text-gray-900">Accountability Plan</h4>
            <p class="text-sm text-gray-700">Cadence: ${data.accountability.cadence}</p>
            <p class="text-sm text-gray-700">Metrics: ${(data.accountability.metrics || []).join(', ')}</p>
            <p class="text-sm text-gray-700">Partners: ${(data.accountability.partners || []).join(', ')}</p>
        </div>` : ''}
    `;
}

async function generateDataPoet() {
    const resultId = 'data-poet-result';
    showLoading(resultId);

    try {
        const theme = document.getElementById('poet-theme')?.value || 'market';
        const emphasis = document.getElementById('poet-emphasis')?.value || 'hopeful';

        const response = await fetch('/api/tutors/data-poet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ theme, emphasis })
        });

        const payload = await response.json();
        if (!response.ok || !payload.success) {
            throw new Error(payload.error || 'Unable to compose poem');
        }

        renderDataPoetResult(payload.data);
    } catch (error) {
        console.error('Data Poet failed', error);
        showError('data-poet-result', error.message || 'Failed to compose metrics poem');
    }
}

function renderDataPoetResult(data) {
    const container = document.getElementById('data-poet-result');
    if (!container) return;

    const verses = data?.verses || [];
    const metrics = data?.metrics || {};

    container.innerHTML = `
        <div class="bg-indigo-50 border border-indigo-100 rounded p-3">
            <p class="text-sm text-indigo-800">Theme: ${data?.theme} · Emphasis: ${data?.emphasis}</p>
            ${metrics.price ? `<p class="text-xs text-indigo-600">Price: $${metrics.price.toLocaleString()}</p>` : ''}
        </div>
        <div class="mt-3 space-y-2">
            ${verses.map(line => `<p class="text-sm text-gray-800">${line}</p>`).join('')}
        </div>
        ${data?.closing ? `<p class="mt-3 text-sm text-gray-700 font-medium">${data.closing}</p>` : ''}
        ${data?.performanceNotes ? `
        <div class="mt-3 text-xs text-gray-500">
            <p><strong>Performance Notes:</strong> Tempo ${data.performanceNotes.tempo}, staging ${data.performanceNotes.staging}</p>
        </div>` : ''}
    `;
}

// Health check
async function checkServerHealth() {
    try {
        const response = await apiCall('/api/health');
        if (response.status === 'ok') {
            document.getElementById('server-status').innerHTML = `
                <div class="flex items-center space-x-2">
                    <div class="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span class="text-sm">Connected</span>
                </div>
            `;
        }
    } catch (error) {
        document.getElementById('server-status').innerHTML = `
            <div class="flex items-center space-x-2">
                <div class="w-2 h-2 bg-red-400 rounded-full"></div>
                <span class="text-sm">Disconnected</span>
            </div>
        `;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('MCP Agent Kit Web Interface initialized');
    
    // Check server health
    checkServerHealth();
    
    // Load initial dashboard data
    loadDashboardData();
    
    // Setup simulation form
    setupSimulationForm();

    // Setup AI tutor interactions
    attachTutorHandlers();
    
    // Set up periodic health checks
    setInterval(checkServerHealth, 30000); // Check every 30 seconds
});

// Make functions globally available
window.showTab = showTab;
window.generateCanvaSnippets = generateCanvaSnippets;
