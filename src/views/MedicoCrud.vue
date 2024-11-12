<template>
    <v-container>
        <!-- Botón de navegación a especialidades -->
        <v-btn color="primary" @click="$router.push('/especialidad')">Gestión de Especialidades</v-btn>

        <!-- Formulario para agregar o modificar médicos -->
        <v-card class="pa-4 mt-4">
            <v-card-title>
                <h1>Médicos</h1>
                <v-spacer></v-spacer>
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="agregarMedico">
                    <v-row>
                        <!-- Campos de nombre y apellido del médico -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="medico.nombre" label="Nombre del médico" outlined dense
                                required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="medico.apellido" label="Apellido del médico" outlined dense
                                required></v-text-field>
                        </v-col>

                        <!-- Campo de especialidad -->
                        <v-col cols="12" md="6">
                            <v-select color="indigo" label="Especialidad" :items="especialidades" item-value="id"
                                item-title="name" v-model="medico.id_especialidad" outlined dense required></v-select>
                        </v-col>
                    </v-row>

                    <!-- Botones de acciones para agregar, modificar, o cancelar -->
                    <v-row>
                        <v-col cols="12" class="text-right">
                            <v-btn v-if="!medico.id" color="success" type="submit" class="mr-2">Agregar</v-btn>
                            <v-btn v-if="medico.id" color="primary" @click="modificarMedico"
                                class="mr-2">Modificar</v-btn>
                            <v-btn v-if="medico.id" color="error" @click="cancelarEdicion">Cancelar</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- Tabla para listar los médicos -->
        <v-card class="mt-4">
            <v-card-title>
                <h2>Lista de Médicos</h2>
                <v-spacer></v-spacer>
                <v-text-field v-model="busqueda" label="Buscar médicos" outlined dense></v-text-field>
            </v-card-title>
            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th v-for="header in headers" :key="header.value">{{ header.text }}</th>
                        </tr>
                    </thead>
                    <tbody class="body-container">
                        <tr v-for="medico in filtrarMedicos" :key="medico.id">
                            <td>{{ medico.id }}</td>
                            <td>{{ medico.nombre }}</td>
                            <td>{{ medico.apellido }}</td>
                            <td>{{ medico.id_especialidad }}</td>
                            <td>
                                <v-btn icon @click="editarMedico(medico)">
                                    <v-icon color="warning">mdi-pencil</v-icon>
                                </v-btn>
                                <v-btn icon @click="eliminarMedico(medico)">
                                    <v-icon color="error">mdi-delete</v-icon>
                                </v-btn>
                            </td>
                            <td>
                                <v-btn icon @click="descargarHistorialConsultas(medico)">
                                    <v-icon color="primary">mdi-printer</v-icon>
                                </v-btn>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </v-card>
    </v-container>

    <!-- Alerta de notificación -->
    <v-snackbar v-model="alertaEstado" color="blue-accent-1" timeout="2000">
        {{ mensaje }}
    </v-snackbar>
</template>


<script>
import axios from "axios";
import { mapGetters } from "vuex";
import Swal from 'sweetalert2'
import store from "@/store"

const getConfig = () => ({
    headers: { 'Authorization': 'Bearer ' + store.getters.getToken }
});

export default {
    name: "MedicoView",
    data() {
        return {
            especialidades: [],
            medico: {},
            medicos: [],
            alertaEstado: false,
            mensaje: "",
            busqueda: "",
            headers: [
                { text: "ID", value: "id" },
                { text: "Nombre", value: "nombre" },
                { text: "Apellido", value: "apellido" },
                { text: "Especialidad", value: "especialidad" },
                { text: "Acciones", value: "actions", sortable: false },
                { text: "Historial Consultas", value: "historial", sortable: false } // Nueva columna
            ],
        };
    },
    computed: {
        ...mapGetters(["getApiUrl"]),
        filtrarMedicos() {
            return this.medicos.filter((medico) => {
                return (
                    medico.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                    medico.apellido.toLowerCase().includes(this.busqueda.toLowerCase())
                );
            });
        }
    },

    methods: {
        obtenerEspecialidades() {
            axios
                .get(`${this.getApiUrl}/especialidad/select`, getConfig())
                .then((response) => {
                    if (response.data.code === 200) {
                        this.especialidades = response.data.data;
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudieron cargar las especialidades'
                    });
                    console.log("Error al obtener especialidades: " + error);
                });
        },

        async agregarMedico() {
            try {
                const response = await axios.post(`${this.getApiUrl}/medico/store`, this.medico, getConfig());
                if (response.data.code === 200) {
                    await Swal.fire({
                        icon: 'success',
                        title: '¡Éxito!',
                        text: 'Médico agregado correctamente',
                        showConfirmButton: false,
                        timer: 1500
                    });
                    this.medico = {};
                    this.obtenerMedicos();
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo agregar el médico'
                });
                console.log("Error al agregar médico: " + error);
            }
        },

        async modificarMedico() {
            try {
                const result = await Swal.fire({
                    title: '¿Estás seguro?',
                    text: "¿Deseas modificar este médico?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, modificar',
                    cancelButtonText: 'Cancelar'
                });

                if (result.isConfirmed) {
                    const response = await axios.put(
                        `${this.getApiUrl}/medico/update/${this.medico.id}`,
                        this.medico,
                        getConfig()
                    );
                    if (response.data.code === 200) {
                        await Swal.fire({
                            icon: 'success',
                            title: '¡Modificado!',
                            text: 'El médico ha sido modificado correctamente',
                            showConfirmButton: false,
                            timer: 1500
                        });
                        this.medico = {};
                        this.obtenerMedicos();
                    }
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo modificar el médico'
                });
                console.log("Error al modificar médico: " + error);
            }
        },

        obtenerMedicos() {
            axios
                .get(`${this.getApiUrl}/medico/select`, getConfig())
                .then((response) => {
                    if (response.data.code === 200) {
                        this.medicos = response.data.data;
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudieron cargar los médicos'
                    });
                    console.log("Error al obtener médicos: " + error);
                });
        },

        verMedico(item) {
            axios
                .get(`${this.getApiUrl}/medico/find/${item.id}`, getConfig())
                .then((response) => {
                    if (response.data.code === 200) {
                        this.medico = response.data.data;
                    }
                })
                .catch((error) => {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'No se pudo cargar la información del médico'
                    });
                    console.log("Error al ver médico: " + error);
                });
        },

        editarMedico(item) {
            this.verMedico(item);
        },

        async eliminarMedico(item) {
            try {
                const result = await Swal.fire({
                    title: '¿Estás seguro?',
                    text: "Esta acción no se puede revertir",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                });

                if (result.isConfirmed) {
                    const response = await axios.delete(
                        `${this.getApiUrl}/medico/delete/${item.id}`,
                        getConfig()
                    );
                    if (response.data.code === 200) {
                        await Swal.fire({
                            icon: 'success',
                            title: '¡Eliminado!',
                            text: 'El médico ha sido eliminado correctamente',
                            showConfirmButton: false,
                            timer: 1500
                        });
                        this.obtenerMedicos();
                    }
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo eliminar el médico'
                });
                console.log("Error al eliminar médico: " + error);
            }
        },
        // Para el pddf
        async descargarHistorialConsultas(item) {
            try {
                const response = await axios.get(
                    `${this.getApiUrl}/consultas/medico/pdf/${item.id}`,
                    {
                        responseType: 'json'
                    }
                );

                if (response.data.code === 200) {
                    // Crear blob desde el PDF en base64
                    const pdfContent = atob(response.data.pdf);
                    const byteArray = new Uint8Array(pdfContent.length);
                    for (let i = 0; i < pdfContent.length; i++) {
                        byteArray[i] = pdfContent.charCodeAt(i);
                    }
                    const blob = new Blob([byteArray.buffer], { type: 'application/pdf' });

                    // Crear URL y descargar
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `historial-consultas-${item.nombre}-${item.apellido}.pdf`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(url);

                    this.mensaje = "PDF descargado correctamente";
                    this.alertaEstado = true;
                }
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo descargar el historial de consultas'
                });
                console.error("Error al descargar historial:", error);
            }
        },

        async cancelarEdicion() {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Se perderán los cambios no guardados",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'No, continuar editando'
            });

            if (result.isConfirmed) {
                this.medico = {};
            }
        }
    },


    created() {
        this.obtenerEspecialidades();
        this.obtenerMedicos();
    }
};
</script>

<style scoped>
h1,
h2 {
    font-weight: bold;
}

.v-card {
    border-radius: 12px;
}

.v-btn {
    margin-right: 8px;
}


.table-container {
    overflow-x: auto;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.body-container {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
}

.data-table td {
    text-align: center;
    /* Centra el contenido horizontalmente */
    vertical-align: middle;
    /* Centra el contenido verticalmente */
}
</style>
