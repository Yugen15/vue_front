<template>
    <v-container>
        <!-- Card para el formulario de médicos -->
        <v-btn color="primary" @click="$router.push('/especialidad')">Gestión de Especialidades</v-btn>

        <v-card class="pa-4">
            <v-card-title>
                <h1>Médicos</h1>
                <v-spacer></v-spacer>
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="agregarMedico">
                    <v-row>
                        <!-- Nombre del médico -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="medico.nombre" label="Nombre del médico" outlined dense
                                required></v-text-field>
                        </v-col>

                        <!-- Apellido del médico -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="medico.apellido" label="Apellido del médico" outlined dense
                                required></v-text-field>
                        </v-col>

                        <!-- Especialidad -->
                        <v-col cols="12" md="6">
                            <v-select color="indigo" label="Especialidad" :items="especialidades" item-value="id"
                                item-title="name" v-model="medico.id_especialidad" outlined dense required></v-select>
                        </v-col>
                    </v-row>

                    <!-- Botones de acciones -->
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

        <!-- Card para la tabla de médicos -->
        <v-card class="mt-4">
            <v-card-title>
                <h2>Lista de Médicos</h2>
                <v-spacer></v-spacer>
                <v-text-field v-model="busqueda" label="Buscar médicos" outlined dense></v-text-field>
            </v-card-title>

            <v-data-table :headers="headers" :items="filtrarMedicos" item-key="id" class="elevation-1" dense>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn icon @click="editarMedico(item)">
                        <v-icon color="green">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon @click="eliminarMedico(item)">
                        <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                </template>
</v-data-table>
</v-card>
</v-container>

<!-- Alerta para mostrar mensajes -->
<v-snackbar v-model="alertaEstado" color="blue-accent-1" timeout="2000">
    {{ mensaje }}
</v-snackbar>
</template>


<script>
import axios from "axios";
import { mapGetters } from "vuex";
import Swal from 'sweetalert2';

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
                { text: "Acciones", value: "actions", sortable: false }
            ]
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
                .get(`${this.getApiUrl}/especialidad/select`)
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
                const response = await axios.post(`${this.getApiUrl}/medico/store`, this.medico);
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
                    const response = await axios.put(`${this.getApiUrl}/medico/update/${this.medico.id}`, this.medico);
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
                .get(`${this.getApiUrl}/medico/select`)
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
                .get(`${this.getApiUrl}/medico/find/${item.id}`)
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
                    const response = await axios.delete(`${this.getApiUrl}/medico/delete/${item.id}`);
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
</style>
