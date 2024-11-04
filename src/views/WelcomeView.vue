<template>
    <v-container fluid class="welcome-container">
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-card class="elevation-10 rounded-card">
                    <v-card-title class="title text-center">
                        Sistema de Ventas
                    </v-card-title>
                    <v-card-subtitle class="subtitle text-center">
                        Bienvenido, {{ usuarioNombre }}
                    </v-card-subtitle>
                    
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
export default {
    name: "WelcomeView",
    computed: {
        usuarioNombre() {
            return this.$store.getters.getUsuario || "Usuario";
        },
    },
};
</script>

<style scoped>
.rounded-card {
    border-radius: 16px;
    overflow: hidden;
}

.rounded-top-img {
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
}

.title {
    font-size: 2rem;
    font-weight: bold;
    color: #3f51b5;
    margin-top: 16px;
}

.subtitle {
    font-size: 1.2rem;
    color: #757575;
    margin-bottom: 16px;
}

.description {
    font-size: 1rem;
    color: #616161;
    margin-bottom: 24px;
}

.welcome-btn {
    border-radius: 20px;
    padding: 12px 24px;
    font-weight: bold;
}
</style>