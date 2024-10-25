<template>
    <v-container>
        <v-card class="pa-4">
            <v-card-title>
                <h1>Especialidades</h1>
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="saveEspecialidad" ref="form">
                    <v-row>
                        <v-col cols="12" md="8">
                            <v-text-field v-model="especialidad.name" :rules="nameRules"
                                label="Nombre de la especialidad" outlined dense required></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12" class="text-right">
                            <v-btn :color="isEditing ? 'primary' : 'success'" type="submit" class="mr-2">
                                {{ isEditing ? 'Actualizar' : 'Crear' }}
                            </v-btn>
                            <v-btn v-if="isEditing" color="grey" @click="resetForm">Cancelar</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>

        <v-card class="mt-4">
            <v-card-title>
                <h2>Lista de Especialidades</h2>
                <v-spacer></v-spacer>
                <v-text-field v-model="search" label="Buscar especialidades" outlined dense></v-text-field>
            </v-card-title>

            <v-data-table :headers="headers" :items="filteredEspecialidades" item-key="id" class="elevation-1" dense>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn icon @click="editEspecialidad(item)">
                        <v-icon color="warning">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon @click="deleteEspecialidad(item.id)">
                        <v-icon color="error">mdi-delete</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>

<script>
import Swal from 'sweetalert2';
import { mapGetters } from 'vuex';
import axios from 'axios';

export default {
    data() {
        return {
            especialidades: [],
            especialidad: {
                id: null,
                name: '',
            },
            isEditing: false,
            search: '',
            headers: [
                { text: 'Nombre', value: 'name', align: 'start' },
                { text: 'Acciones', value: 'actions', sortable: false },
            ],
            nameRules: [
                v => !!v || 'El nombre es requerido',
                v => v.length >= 3 || 'Debe tener al menos 5 caracteres'
            ]
        };
    },
    mounted() {
        this.fetchEspecialidades();
    },
    computed: {
        ...mapGetters(['getApiUrl']),
        filteredEspecialidades() {
            return this.especialidades.filter(especialidad => {
                return especialidad.name.toLowerCase().includes(this.search.toLowerCase());
            });
        },
    },
    methods: {
        async fetchEspecialidades() {
            try {
                const response = await axios.get(`${this.getApiUrl}/especialidades`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                this.especialidades = response.data;
            } catch (error) {
                console.error('Error al obtener las especialidades:', error);
            }
        },
        async saveEspecialidad() {
            if (this.$refs.form.validate()) { // Valida el formulario
                try {
                    if (this.isEditing) {
                        await axios.put(`${this.getApiUrl}/especialidades/${this.especialidad.id}`, this.especialidad, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                        });
                        Swal.fire({
                            title: 'Especialidad Actualizada',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    } else {
                        await axios.post(`${this.getApiUrl}/especialidades`, this.especialidad, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('token')}`,
                            },
                        });
                        Swal.fire({
                            title: 'Especialidad Agregada',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                    this.fetchEspecialidades();
                    this.resetForm();
                } catch (error) {
                    console.error('Error al guardar la especialidad:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Ocurrió un error al guardar la especialidad.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            }
        },
        editEspecialidad(especialidad) {
            this.especialidad = { ...especialidad };
            this.isEditing = true;
        },
        async deleteEspecialidad(id) {
            try {
                await axios.delete(`${this.getApiUrl}/especialidades/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                Swal.fire({
                    title: 'Especialidad Eliminada',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                });
                this.fetchEspecialidades();
            } catch (error) {
                console.error('Error al eliminar la especialidad:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al eliminar la especialidad.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        },
        resetForm() {
            this.especialidad = { id: null, name: '' };
            this.isEditing = false;
            this.$refs.form.resetValidation();
        },
    },
};
</script>

<style scoped>
h1,
h2 {
    font-weight: bold;
}

.text-right {
    text-align: right;
}

.v-btn {
    margin-right: 8px;
}
</style>
