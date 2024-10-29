<template>
    <v-app>
        <v-navigation-drawer v-model="drawer" app :mini-variant="mini" class="drawer-background" :expand-on-hover="mini"
            width="280" dark>
            <v-list-item class="logo-container px-2">
                <v-img class="rounded-avatar">
                    <v-img src="@/assets/logo.png" alt="Medisphere Logo" />
                </v-img>
            </v-list-item>

            <v-divider class="mb-2"></v-divider>

            <v-list nav dense>
                <v-list-item-group v-model="selectedItem" color="light-blue accent-3">
                    <v-list-item v-for="(item) in menuItems" :key="item.title" :to="item.to" link
                        class="mb-1 rounded-lg">
                        <v-list-item-content>

                            <v-list-item-title><v-icon>{{ item.icon }}</v-icon>{{ item.title }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>

                    <v-list-group :value="false" color="white" prepend-icon="mdi-account-cog">
                        <v-list-item v-for="(item, i) in userOptions" :key="i" :to="item.to" link
                            class="rounded-lg ml-4">
                            <v-list-item-icon>
                                <v-icon>{{ item.icon }}</v-icon>
                            </v-list-item-icon>
                            <v-list-item-content>
                                <v-list-item-title>{{ item.title }}</v-list-item-title>
                            </v-list-item-content>
                        </v-list-item>
                    </v-list-group>
                </v-list-item-group>
            </v-list>

            <template v-slot:append>
                <v-list-item link @click="logout" class="logout-item">
                    <v-list-item-icon>
                        <v-icon>mdi-logout</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                        <v-list-item-title>{{ 'Cerrar Sesión' }}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>
        </v-navigation-drawer>

        <v-app-bar app color="white" elevation="1" class="app-bar">
            <v-app-bar-nav-icon @click.stop="drawer = !drawer" color="primary"></v-app-bar-nav-icon>
            <v-toolbar-title class="text-h6 font-weight-bold primary--text d-none d-sm-flex">
                {{ getCurrentPageTitle }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon color="primary" class="mr-2">
                <v-icon>mdi-magnify</v-icon>
            </v-btn>
            <v-menu offset-y left transition="slide-y-transition">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon color="primary" class="mr-2" v-bind="attrs" v-on="on">
                        <v-badge dot color="error" overlap>
                            <v-icon>mdi-bell</v-icon>
                        </v-badge>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item v-for="(notification, index) in notifications" :key="index">
                        <v-list-item-content>
                            <v-list-item-title>{{ notification.title }}</v-list-item-title>
                            <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
            <v-menu offset-y left transition="slide-y-transition">
                <template v-slot:activator="{ on, attrs }">
                    <v-btn icon v-bind="attrs" v-on="on">
                        <v-avatar color="primary" size="32">
                            <span class="white--text text-subtitle-2">{{ userInitials }}</span>
                        </v-avatar>
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item link to="/profile">
                        <v-list-item-icon>
                            <v-icon>mdi-account</v-icon>
                        </v-list-item-icon>
                        <v-list-item-title>{{ 'Perfil' }}</v-list-item-title>
                    </v-list-item>
                    <v-list-item link @click="logout" class="logout-item">
                        <v-list-item-icon>
                            <v-icon>mdi-logout</v-icon>
                        </v-list-item-icon>
                        <v-list-item-content>
                            <v-list-item-title>{{ 'Cerrar Sesión' }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-main class="grey lighten-4">
            <v-container fluid class="pa-6">
                <v-fade-transition mode="out-in">
                    <router-view></router-view> <!-- Aquí es donde se cargarán las vistas -->
                </v-fade-transition>
            </v-container>
        </v-main>
    </v-app>
</template>
<script>
import axios from 'axios';
import { useStore } from 'vuex'; // Importamos el store

export default {
    data: () => ({
        drawer: true,
        mini: false,
        selectedItem: 0,
        menuItems: [
            { title: 'Gestión de Médicos', icon: 'mdi-view-dashboard', to: '/medico' },
            { title: 'Gestión de Pacientes', icon: 'mdi-account-multiple', to: '/paciente' },
            { title: 'Gestión de Citas', icon: 'mdi-calendar-clock', to: '/citas' },
            { title: 'Consultas', icon: 'mdi-file-document', to: '/consultas' },
            { title: 'Gestión de Usuarios', icon: 'mdi-account-cog', to: '/usuario' },
        ],
        userOptions: [
            { title: 'Gestionar Usuarios', icon: 'mdi-account-cog', to: '/users/manage' },
        ],
        notifications: [
            { title: 'Nueva cita', message: 'Tienes una nueva cita programada para hoy' },
            { title: 'Recordatorio', message: 'Actualiza el expediente del paciente #1234' },
        ],
        user: {
            firstName: 'Juan',
            lastName: 'Pérez',
        },
    }),
    computed: {
        getCurrentPageTitle() {
            const currentRoute = this.$route.path;
            const menuItem = this.menuItems.find(item => item.to === currentRoute);
            return menuItem ? menuItem.title : 'Medisphere';
        },
        userInitials() {
            return `${this.user.firstName[0]}${this.user.lastName[0]}`;
        },
        isAuthenticated() {
      return !!localStorage.getItem('token'); // Check if the token exists
    },
    },
    methods: {
        async logout() {
            try {
                const store = useStore(); // Accedemos al store de Vuex
                const token = localStorage.getItem('token');

                // Obtenemos la URL de la API desde Vuex
                const apiUrl = store.getters.getApiUrl;

                // Realizamos la petición de logout
                await axios.post(`${apiUrl}/logout`, {}, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                // Eliminar el token de localStorage
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];

                // Redirigir al login o home después de cerrar sesión
                this.$router.push('/');
            } catch (error) {
                console.error('Error during logout:', error);
            }

        },
    },
};
</script>



<style scoped>
.drawer-background {
    background: linear-gradient(135deg, #1976D2, #64B5F6);
}

.logo-container {
    display: flex;
    /* Habilita Flexbox */
    justify-content: center;
    /* Centra horizontalmente */
    align-items: center;
    /* Centra verticalmente */
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    /* Altura opcional para centrar verticalmente */
}

.v-list-item {
    border-radius: 8px;
    margin: 0 8px 4px 8px;
    transition: all 0.3s ease;
}

.v-list-item:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
    transform: translateX(5px);
}

.v-list-item.v-list-item--active {
    background-color: rgba(255, 255, 255, 0.2) !important;
}

.v-list-item__icon {
    margin-right: 16px;
    min-width: 24px;
}

.logout-item {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-top: 12px;
    padding-top: 12px;
}

.v-list-group__header__append-icon .v-icon {
    color: white !important;
}

.app-bar {
    border-bottom: 1px solid #E0E0E0;
}

.v-main {
    background-color: #f5f5f5;
}

.v-footer {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.rounded-avatar {
    border-radius: 50%;
    width: 125px;
    /* Cambia el tamaño según lo necesites */
    height: 125px;
    /* Cambia el tamaño según lo necesites */
}
</style>




