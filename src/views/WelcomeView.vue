<template>
    <v-container fluid class="welcome-container">
        <v-row justify="center">
            

            <v-col cols="12" sm="6" md="6">
                <v-card class="elevation-5 rounded-card mission-card">
                    <v-card-title class="mission-title">
                        <v-icon large color="#3f51b5" class="mr-2">mdi-target</v-icon>
                        Misión
                    </v-card-title>
                    <v-card-text class="mission-text">
                        <p>
                            En Medisphere, nos dedicamos a proporcionar atención médica de excelencia a través de 
                            un sistema integral de gestión hospitalaria. Nuestro compromiso es mejorar la calidad 
                            de vida de nuestros pacientes mediante servicios médicos eficientes, tecnología 
                            innovadora y un equipo humano altamente calificado.
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="6">
                <v-card class="elevation-5 rounded-card vision-card">
                    <v-card-title class="vision-title">
                        <v-icon large color="#3f51b5" class="mr-2">mdi-eye</v-icon>
                        Visión
                    </v-card-title>
                    <v-card-text class="vision-text">
                        <p>
                            Ser reconocidos como el sistema de gestión hospitalaria líder en innovación y 
                            calidad de servicio, estableciendo nuevos estándares en la atención médica digital. 
                            Aspiramos a transformar la experiencia en salud mediante la integración de tecnología 
                            avanzada y atención humanizada.
                        </p>
                    </v-card-text>
                </v-card>
            </v-col>

            <v-col cols="12" sm="12" md="12">
                <v-card class="elevation-5 rounded-card values-card mt-4">
                    <v-card-title class="values-title text-center">
                        Nuestros Valores
                    </v-card-title>
                    <v-card-text>
                        <v-row>
                            <v-col cols="12" sm="4">
                                <div class="value-item text-center">
                                    <v-icon color="#3f51b5" x-large>mdi-heart</v-icon>
                                    <h3 class="value-subtitle">Compromiso</h3>
                                    <p>Dedicación total a la salud y bienestar de nuestros pacientes</p>
                                </div>
                            </v-col>
                            <v-col cols="12" sm="4">
                                <div class="value-item text-center">
                                    <v-icon color="#3f51b5" x-large>mdi-shield-check</v-icon>
                                    <h3 class="value-subtitle">Excelencia</h3>
                                    <p>Búsqueda constante de la mejor calidad en nuestros servicios</p>
                                </div>
                            </v-col>
                            <v-col cols="12" sm="4">
                                <div class="value-item text-center">
                                    <v-icon color="#3f51b5" x-large>mdi-account-group</v-icon>
                                    <h3 class="value-subtitle">Trabajo en Equipo</h3>
                                    <p>Colaboración eficiente para resultados excepcionales</p>
                                </div>
                            </v-col>
                        </v-row>
                    </v-card-text>
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
.welcome-container {
    padding: 24px;
}

.rounded-card {
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.3s ease;
}

.rounded-card:hover {
    transform: translateY(-5px);
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

.mission-card, .vision-card {
    height: 100%;
    background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
}

.mission-title, .vision-title {
    color: #3f51b5;
    font-size: 1.5rem;
    font-weight: bold;
    padding: 16px;
}

.mission-text, .vision-text {
    color: #616161;
    font-size: 1.1rem;
    line-height: 1.6;
    padding: 0 16px 16px 16px;
}

.values-card {
    background: linear-gradient(to bottom right, #ffffff, #f8f9fa);
}

.values-title {
    color: #3f51b5;
    font-size: 1.8rem;
    font-weight: bold;
    width: 100%;
}

.value-item {
    padding: 20px;
    transition: transform 0.3s ease;
}

.value-item:hover {
    transform: translateY(-5px);
}

.value-subtitle {
    color: #3f51b5;
    margin: 16px 0;
    font-size: 1.3rem;
    font-weight: bold;
}

.value-item p {
    color: #616161;
    font-size: 1rem;
}

/* Responsive adjustments */
@media (max-width: 600px) {
    .mission-card, .vision-card {
        margin-bottom: 16px;
    }

    .title {
        font-size: 1.8rem;
    }

    .mission-title, .vision-title {
        font-size: 1.3rem;
    }

    .value-subtitle {
        font-size: 1.1rem;
    }
}
</style>