import { createStore } from 'vuex'

export default createStore({
  state: {
    apiUrl: 'http://127.0.0.1:8000/api',
  },
  getters: {
    getApiUrl: state => state.apiUrl, 
  },
  mutations: {
    setApiUrl(state, newUrl) {
      state.apiUrl = newUrl;
    }
  },
  actions: {
  },
  modules: {
  }
})
