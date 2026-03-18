import axios from 'axios'

const API_URL = 'https://web-production-ce70.up.railway.app';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add Auth Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Add Response Interceptor for 401s
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    localStorage.removeItem('token')
    // Could redirect to login here if using window.location or a router
  }
  return Promise.reject(error)
})

export const auth = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    if (res.data.access_token) {
      localStorage.setItem('token', res.data.access_token)
    }
    return res.data
  },
  register: async (email, password, name) => {
    const res = await api.post('/auth/register', { email, password, name })
    if (res.data.access_token) {
      localStorage.setItem('token', res.data.access_token)
    }
    return res.data
  },
  logout: () => {
    localStorage.removeItem('token')
  },
  isAuthenticated: () => !!localStorage.getItem('token')
}

const market = {
  getPrices: async () => (await api.get('/market/prices')).data,
  getSentiment: async () => (await api.get('/market/sentiment')).data,
  getOptionsAnalytics: async () => (await api.get('/market/options/analytics')).data,
  getOHLCV: async (symbol, tf = '1D', limit = 90) => (await api.get(`/market/ohlcv?symbol=${symbol}&tf=${tf}&limit=${limit}`)).data,
  getIndicators: async (symbol) => (await api.get(`/market/indicators?symbol=${symbol}`)).data,
  getSignal: async (symbol) => (await api.get(`/market/signal?symbol=${symbol}`)).data,
}

const portfolio = {
  getSummary: async () => (await api.get('/portfolio/summary')).data,
  getPositions: async () => (await api.get('/portfolio/positions')).data,
  createPosition: async (data) => (await api.post('/portfolio/positions', data)).data,
}

const ai = {
  chat: async (query) => (await api.post('/ai/chat', { query })).data,
  getInsights: async () => (await api.get('/ai/insights')).data,
}

const social = {
  getSignals: async () => (await api.get('/social/signals')).data,
  getLeaderboard: async () => (await api.get('/social/leaderboard')).data,
  getMarketplace: async () => (await api.get('/social/marketplace')).data,
}

const settings = {
  getProfile: async () => (await api.get('/settings/profile')).data,
  getConfig: async () => (await api.get('/settings/config')).data,
}

const strategy = {
  getLibrary: async () => (await api.get('/strategy/library')).data,
  createStrategy: async (data) => (await api.post('/strategy/library', data)).data,
  getBacktestResults: async (params) => (await api.get('/strategy/backtest/results', { params })).data,
}

const clients = {
  list: async () => (await api.get('/clients')).data,
  create: async (data) => (await api.post('/clients', data)).data,
  get: async (id) => (await api.get(`/clients/${id}`)).data,
  delete: async (id) => (await api.delete(`/clients/${id}`)).data,
}

const brokers = {
  list: async () => (await api.get('/brokers')).data,
  connect: async (data) => (await api.post('/brokers/connect', data)).data,
  sync: async (id) => (await api.post(`/brokers/${id}/sync`)).data,
  get: async (id) => (await api.get(`/brokers/${id}`)).data,
  delete: async (id) => (await api.delete(`/brokers/${id}`)).data,
  placeOrder: async (data) => (await api.post('/brokers/orders', data)).data,
}

const risk = {
  getStatus: async () => (await api.get('/risk/status')).data,
  calculateSize: async (data) => (await api.post('/risk/calculate-size', data)).data,
}

const journal = {
  getEntries: async () => (await api.get('/journal/entries')).data,
  createEntry: async (data) => (await api.post('/journal/entries', data)).data,
  deleteEntry: async (id) => (await api.delete(`/journal/entries/${id}`)).data,
}

const options = {
  getChain: async (symbol, expiry) => (await api.get(`/options/chain?symbol=${symbol}&expiry=${expiry || ''}`)).data,
  getSummary: async () => (await api.get('/options/summary')).data,
  getVolatilitySurface: async (symbol) => (await api.get(`/options/volatility-surface?symbol=${symbol}`)).data,
}

const alerts = {
  getAlerts: async () => (await api.get('/alerts')).data,
  getNotifications: async () => (await api.get('/alerts/notifications')).data,
  createAlert: async (data) => (await api.post('/alerts', data)).data,
  deleteAlert: async (id) => (await api.delete(`/alerts/${id}`)).data,
}

const execution = {
  placeBracket: async (data) => (await api.post('/execution/bracket', data)).data,
  updateTrailingStop: async (orderId, callbackRate) => (await api.post(`/execution/trailing-stop?order_id=${orderId}&callback_rate=${callbackRate}`)).data,
}

const watchlist = {
  getWatchlists: async () => (await api.get('/watchlist')).data,
  create: async (data) => (await api.post('/watchlist', data)).data,
  addItem: async (watchlistId, data) => (await api.post(`/watchlist/${watchlistId}/items`, data)).data,
  removeItem: async (itemId) => (await api.delete(`/watchlist/items/${itemId}`)).data,
}

const aiIntel = {
  getScanner: async () => (await api.get('/ai-intelligence/scanner')).data,
  analyze: async (symbol, timeframe) => (await api.post('/ai-intelligence/analyze', { symbol, timeframe })).data,
}

const backtest = {
  run: async (params) => (await api.post('/backtest/run', params)).data,
}

export default {
  auth,
  market,
  portfolio,
  ai,
  social,
  settings,
  strategy,
  clients,
  brokers,
  risk,
  execution,
  aiIntel,
  backtest,
  journal,
  alerts,
  options,
  watchlist
}
