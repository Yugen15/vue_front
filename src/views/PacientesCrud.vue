<template>
    <v-container>
        <!-- Card para el formulario de pacientes -->
        <v-card class="pa-4 mt-4">
            <v-card-title>
                <h1>Gestión de Pacientes</h1>
                <v-spacer></v-spacer>
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="agregarPaciente" ref="form">
                    <v-row>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="paciente.nombre" label="Nombre" :rules="[rules.requerido]" outlined
                                dense required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="paciente.apellido" label="Apellido" :rules="[rules.requerido]"
                                outlined dense required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="paciente.dui" label="DUI" :rules="[rules.requerido, rules.dui]"
                                outlined dense required></v-text-field>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-text-field v-model="paciente.fecha_nacimiento" label="Fecha de Nacimiento" type="date"
                                :rules="[rules.requerido]" outlined dense required></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12" class="text-right">
                            <v-btn v-if="!paciente.id" color="success" type="submit" class="mr-2">Agregar</v-btn>
                            <v-btn v-if="paciente.id" color="primary" @click="modificarPaciente"
                                class="mr-2">Modificar</v-btn>
                            <v-btn v-if="paciente.id" color="error" @click="cancelarEdicion">Cancelar</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>

        <!-- Card para la tabla de pacientes -->
        <v-card class="mt-4">
            <v-card-title>
                <h2>Lista de Pacientes</h2>
                <v-spacer></v-spacer>
                <v-text-field v-model="busqueda" label="Buscar pacientes" outlined dense></v-text-field>
            </v-card-title>

            <v-data-table :headers="headers" :items="filtrarPacientes" item-key="id" class="elevation-1" dense>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn icon @click="editarPaciente(item)">
                        <v-icon color="warning">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon @click="confirmarEliminacion(item)">
                        <v-icon color="red">mdi-delete</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>

<script>
import axios from "axios";
import { mapGetters } from "vuex";
import Swal from "sweetalert2";
import store from "@/store";

const getConfig = () => ({
    headers: { 'Authorization': 'Bearer ' + store.getters.getToken }
});

export default {
    name: "PacientesCrud",
    data() {
        return {
            paciente: {},
            pacientes: [],
            busqueda: "",
            headers: [
                { text: "ID", value: "id" },
                { text: "Nombre", value: "nombre" },
                { text: "Apellido", value: "apellido" },
                { text: "DUI", value: "dui" },
                { text: "Fecha Nacimiento", value: "fecha_nacimiento" },
                { text: "Acciones", value: "actions", sortable: false }
            ],
            rules: {
                requerido: (v) => !!v || "Este campo es requerido",
                dui: (v) => /^\d{9}$/.test(v) || "El DUI debe tener exactamente 9 dígitos"
            }
        };
    },
    computed: {
        ...mapGetters(["getApiUrl"]),
        filtrarPacientes() {
            return this.pacientes.filter((paciente) => {
                return (
                    paciente.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                    paciente.apellido.toLowerCase().includes(this.busqueda.toLowerCase())
                );
            });
        }
    },
    methods: {
        obtenerPacientes() {
            axios
                .get(`${this.getApiUrl}/paciente/select`, getConfig())
                .then((response) => {
                    if (response.data.code === 200) {
                        this.pacientes = response.data.data;
                    }
                })
                .catch((error) => {
                    console.log("Error al obtener pacientes: " + error);
                    Swal.fire("Error", "No se pudieron cargar los pacientes", "error");
                });
        },

        agregarPaciente() {
            if (this.$refs.form.validate()) {
                axios
                    .post(`${this.getApiUrl}/pacientes`, this.paciente, getConfig())
                    .then((response) => {
                        if (response.data.code === 200) {
                            Swal.fire("Agregado", response.data.data, "success");
                            this.paciente = {};
                            this.obtenerPacientes();
                            this.$refs.form.resetValidation();
                        }
                    })
                    .catch((error) => {
                        console.log("Error al agregar paciente: " + error);
                        Swal.fire("Error", "No se pudo agregar el paciente", "error");
                    });
            }
        },

        editarPaciente(item) {
            this.paciente = { ...item };
        },

        modificarPaciente() {
            if (this.$refs.form.validate()) {
                axios
                    .put(
                        `${this.getApiUrl}/paciente/update/${this.paciente.id}`,
                        this.paciente,
                        getConfig()
                    )
                    .then((response) => {
                        if (response.data.code === 200) {
                            Swal.fire("Modificado", "Paciente modificado con éxito", "success");
                            this.paciente = {};
                            this.obtenerPacientes();
                            this.$refs.form.resetValidation();
                        }
                    })
                    .catch((error) => {
                        console.log("Error al modificar paciente:", error);
                        Swal.fire("Error", "No se pudo modificar el paciente", "error");
                    });
            }
        },

        confirmarEliminacion(item) {
            Swal.fire({
                title: "¿Estás seguro?",
                text: "Esta acción no se puede deshacer",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Sí, eliminar",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    this.eliminarPaciente(item);
                }
            });
        },

        eliminarPaciente(item) {
            axios
                .delete(`${this.getApiUrl}/paciente/delete/${item.id}`, getConfig())
                .then((response) => {
                    if (response.data.code === 200) {
                        Swal.fire("Eliminado", "Paciente eliminado", "success");
                        this.obtenerPacientes();
                    }
                })
                .catch((error) => {
                    console.log("Error al eliminar paciente:", error);
                    Swal.fire("Error", "No se pudo eliminar el paciente", "error");
                });
        },

        cancelarEdicion() {
            this.paciente = {};
            this.$refs.form.resetValidation();
        }
    },
    created() {
        this.obtenerPacientes();
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
