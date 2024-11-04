import { createStore } from 'vuex'

export default createStore({
  state: {
    apiUrl: 'http://127.0.0.1:8000/api',
    usuario: null,
    token: null,
  },
  getters: {
    getApiUrl: state => state.apiUrl,
    getUsuario(state) {
      return state.usuario;
    },
    getToken(state) {
      return state.token;
    }
  },
  mutations: {
    setApiUrl(state, newUrl) {
      state.apiUrl = newUrl;
    },
    setUsuario(state, usuario) {
      state.usuario = usuario;
    },
    setToken(state, token) {
      state.token = token;
    }
  },
  actions: {
    login(context, data) {
      context.commit('setUsuario', data.usuario);
      context.commit('setToken', data.token);
      localStorage.setItem('userData', JSON.stringify(data));
    },
    logout(context) {
      context.commit('setUsuario', null);
      context.commit('setToken', null);
      localStorage.removeItem('userData');
    },
    initializeStore(context) {
      const storedData = localStorage.getItem('userData');
      if (storedData) {
        const data = JSON.parse(storedData);
        context.commit('setUsuario', data.usuario);
        context.commit('setToken', data.token);
      }
    }
  },
  modules: {}
});
