<template>
    <div class="login-wrapper">
        <v-container fluid class="login-container pa-0">
            <v-row class="fill-height ma-0">
                <v-col cols="12" sm="8" md="6" lg="4" class="pa-4 mx-auto d-flex align-center">
                    <v-card class="elevation-12 login-card">
                        <v-card-text class="text-center px-6 pt-8">
                            <v-img src="../assets/logo.png" height="80" width="80" class="logo"></v-img>
                            <h2 class="headline font-weight-bold text-primary">Medisphere</h2>
                            <p class="subheading text-secondary">Inicio de sesión</p>
                            <v-form @submit.prevent="login">
                                <v-text-field label="Correo" placeholder="Dirección de Correo" counter maxlength="70"
                                    color="primary" clearable prepend-inner-icon="mdi-email" v-model="usuario.email"
                                    class="login-input"></v-text-field>
                                <v-text-field label="Contraseña" placeholder="*********" counter maxlength="15"
                                    color="primary" clearable type="password" prepend-inner-icon="mdi-key"
                                    v-model="usuario.password" class="login-input"></v-text-field>
                                <v-btn color="primary" block large class="login-btn white--text" type="submit">
                                    Iniciar sesión
                                </v-btn>
                            </v-form>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-container>

        <v-snackbar :timeout="36000000000" color="error" v-model="alertaEstado">
            {{ alertaMensaje }}
        </v-snackbar>
    </div>
</template>

<script>
import axios from 'axios'
export default {
    name: 'LoginView',
    data() {
        return {
            usuario: {
                email: '',
                password: ''
            },
            alertaEstado: false,
            alertaMensaje: ''
        }
    },
    methods: {
        login() {
            axios.post('http://127.0.0.1:8000/api/login', this.usuario)
                .then(response => {
                    if (response.status == 200) {
                        let datos = {
                            usuario: response.data.data.name,
                            token: response.data.token
                        }
                        this.$store.dispatch('login', datos)
                        this.$router.push('/welcome')
                    }
                })
                .catch(error => {
                    this.alertaEstado = true
                    if (error.response && error.response.status == 401) {
                        this.alertaMensaje = error.response.data.data
                    } else {
                        this.alertaMensaje = '¡Ups! Algo salió mal'
                    }
                })
        }
    }
}
</script>

<style scoped>
.login-wrapper {
    min-height: 100vh;
    width: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
}

.login-container {
    background: linear-gradient(to right, #1976D2, #64B5F6);
    min-height: 100vh;
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.login-card {
    border-radius: 16px;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    animation: fadeIn 1s ease-in-out;
    width: 100%;
    max-width: 100%;
}

.logo {
    border-radius: 50%;
    margin: 0 auto 16px;
    width: 80px;
    height: 80px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.headline {
    font-size: 26px;
    color: #1E88E5;
    margin-top: 16px;
}

.subheading {
    font-size: 16px;
    color: #546E7A;
    margin-bottom: 24px;
}

.login-input :deep(.v-input__control) {
    border-radius: 8px;
    transition: all 0.3s ease;
}

.login-input :deep(.v-input__control:hover) {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.login-btn {
    border-radius: 8px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.2);
    margin-top: 16px;
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(25, 118, 210, 0.3);
}

.error-snackbar {
    border-radius: 8px;
    font-weight: bold;
    color: white;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

/* Media queries para ajustar el tamaño en diferentes pantallas */
@media (max-width: 600px) {
    .login-card {
        margin: 16px;
    }
}
</style>