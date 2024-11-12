<template>
    <v-app>
        <v-navigation-drawer v-model="drawer" v-if="$store.getters.getUsuario" app :mini-variant="mini"
            class="drawer-background" :expand-on-hover="mini" width="280" dark>
            <v-list-item class="logo-container px-2">
                <v-img class="rounded-avatar">
                    <router-link to="/welcome">
                        <v-img src="@/assets/logo.png" alt="Medisphere Logo" />
                    </router-link>

                </v-img>
            </v-list-item>

            <v-divider class="mb-2"></v-divider>

            <v-list nav dense v-if="$store.getters.getUsuario">
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

        <v-app-bar app color="white" elevation="1" class="app-bar" v-if="$store.getters.getUsuario">
            <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
            <v-toolbar-title class="app-title">Medisphere</v-toolbar-title>
            <v-spacer></v-spacer>
            <span class="user-welcome">Bienvenido, {{ usuarioNombre }}</span>
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
        ]
    }),

    methods: {
        logout() {
            this.$store.dispatch('logout');
            this.$router.push('/');
        },
        // Verificación de sesión de usuario
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

.app-title {
    color: #1976D2;
    font-weight: bold;
    font-size: 1.5rem;
}

.user-welcome {
    color: #757575;
    font-size: 1.1rem;
    margin-right: 16px;
}
</style>
