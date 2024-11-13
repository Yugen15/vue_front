<template>
    <v-app>
        <v-navigation-drawer v-model="drawer" v-if="$store.getters.getUsuario" app :mini-variant="mini"
            :expand-on-hover="mini" width="280" class="drawer-background">
            <v-list-item class="logo-container px-2 py-4">
                <router-link to="/welcome">
                    <v-avatar size="80" class="elevation-3">
                        <v-img src="@/assets/logo.png" alt="Medisphere Logo" />
                    </v-avatar>
                </router-link>
            </v-list-item>

            <v-divider class="mb-2"></v-divider>

            <v-list nav dense v-if="$store.getters.getUsuario">
                <v-list-item-group v-model="selectedItem" color="light-blue accent-3">
                    <v-list-item v-for="item in menuItems" :key="item.title" :to="item.to" link class="mb-1 rounded-lg">
                    
                        
                        <v-list-item-content>
                            <v-icon>{{ item.icon }}</v-icon>
                            {{ item.title }}
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
                        <v-list-item-title>Cerrar Sesión</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </template>
        </v-navigation-drawer>

        <v-app-bar app elevation="1" class="app-bar" v-if="$store.getters.getUsuario">
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title class="app-title">Medisphere</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn icon>
                <v-icon>mdi-bell</v-icon>
            </v-btn>
            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn text v-bind="attrs" v-on="on" class="user-welcome">
                        <v-icon left>mdi-account-circle</v-icon>
                        {{ usuarioNombre }}
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item @click="logout">
                        <v-list-item-title>Cerrar Sesión</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-main class="grey lighten-4">
            <v-container fluid class="pa-6">
                <v-fade-transition mode="out-in">
                    <router-view></router-view>
                </v-fade-transition>
            </v-container>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'App',
    computed: {
        usuarioNombre() {
            return this.$store.getters.getUsuario || "Usuario";
        },
    },
    data: () => ({
        drawer: true,
        mini: false,
        selectedItem: 0,
        menuItems: [
            { title: 'Inicio', icon: 'mdi-view-dashboard', to: '/welcome' },
            { title: 'Gestión de Médicos', icon: 'mdi-doctor', to: '/medico' },
            { title: 'Gestión de Pacientes', icon: 'mdi-account-multiple', to: '/paciente' },
            { title: 'Gestión de Citas', icon: 'mdi-calendar-clock', to: '/citas' },
            { title: 'Consultas', icon: 'mdi-file-document', to: '/consultas' },
            { title: 'Gestión de Usuarios', icon: 'mdi-account-cog', to: '/usuario' },
        ],
        userOptions: [
            { title: 'Perfil', icon: 'mdi-account', to: '/profile' },
            { title: 'Configuración', icon: 'mdi-cog', to: '/settings' },
        ],
    }),
    methods: {
        logout() {
            this.$store.dispatch('logout');
            this.$router.push('/');
        },
        validarAcceso() {
            let datos = localStorage.getItem('userData');
            if (datos) {
                this.$store.dispatch('/login', JSON.parse(datos));
                this.$router.push('/');
            } else {
                this.$router.push('/');
            }
        }
    },
    created() {
        this.validarAcceso();
    }
};
</script>

<style scoped>
.drawer-background {
    background: linear-gradient(135deg, #1976D2, #64B5F6);
}

.logo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 16px 0;
}

.v-list-item {
    border-radius: 8px;
    margin: 4px 8px;
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
    background-color: white !important;
    border-bottom: 1px solid #E0E0E0;
}

.v-main {
    background-color: #f5f5f5;
}

.app-title {
    color: #1976D2;
    font-weight: bold;
    font-size: 1.5rem;
}

.user-welcome {
    color: #757575;
    font-size: 1rem;
}

.v-menu__content {
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>