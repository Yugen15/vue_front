<template>
    <v-container>
        <v-card class="pa-4">
            <v-card-title>
                <h1>Roles</h1>
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="saveRole" ref="form">
                    <v-row>
                        <v-col cols="12" md="8">
                            <v-text-field
                                v-model="role.name"
                                :rules="nameRules"
                                label="Nombre del rol"
                                outlined
                                dense
                                required
                            ></v-text-field>
                        </v-col>
                    </v-row>

                    <v-row>
                        <v-col cols="12" class="text-right">
                            <v-btn
                                :color="isEditing ? 'primary' : 'success'"
                                type="submit"
                                class="mr-2"
                            >
                                {{ isEditing ? 'Actualizar' : 'Crear' }}
                            </v-btn>
                            <v-btn
                                v-if="isEditing"
                                color="grey"
                                @click="resetForm"
                            >Cancelar</v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>
        </v-card>

        <v-card class="mt-4">
            <v-card-title>
                <h2>Lista de Roles</h2>
                <v-spacer></v-spacer>
                <v-text-field
                    v-model="search"
                    label="Buscar roles"
                    outlined
                    dense
                ></v-text-field>
            </v-card-title>

            <v-data-table
                :headers="headers"
                :items="filteredRoles"
                item-key="id"
                class="elevation-1"
                dense
            >
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn icon @click="editRole(item)">
                        <v-icon color="warning">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon @click="deleteRole(item.id)">
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
import store from "@/store";

const getConfig = () => ({
    headers: { 'Authorization': 'Bearer ' + store.getters.getToken }
});

export default {
    data() {
        return {
            roles: [],
            role: {
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
                v => v.length >= 3 || 'Debe tener al menos 3 caracteres'
            ]
        };
    },
    mounted() {
        this.fetchRoles();
    },
    computed: {
        ...mapGetters(['getApiUrl']),
        filteredRoles() {
            return this.roles.filter(role => {
                return role.name.toLowerCase().includes(this.search.toLowerCase());
            });
        },
    },
    methods: {
        async fetchRoles() {
            try {
                const response = await axios.get(`${this.getApiUrl}/roles`, getConfig());
                this.roles = response.data;
            } catch (error) {
                console.error('Error al obtener los roles:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al cargar los roles.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        },
        async saveRole() {
            if (this.$refs.form.validate()) {
                try {
                    if (this.isEditing) {
                        await axios.put(
                            `${this.getApiUrl}/roles/${this.role.id}`,
                            this.role,
                            getConfig()
                        );
                        Swal.fire({
                            title: 'Rol Actualizado',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    } else {
                        await axios.post(
                            `${this.getApiUrl}/roles`,
                            this.role,
                            getConfig()
                        );
                        Swal.fire({
                            title: 'Rol Agregado',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    }
                    this.fetchRoles();
                    this.resetForm();
                } catch (error) {
                    console.error('Error al guardar el rol:', error);
                    Swal.fire({
                        title: 'Error',
                        text: 'Ocurrió un error al guardar el rol.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                    });
                }
            }
        },
        editRole(role) {
            this.role = { ...role };
            this.isEditing = true;
        },
        async deleteRole(id) {
            try {
                const result = await Swal.fire({
                    title: '¿Estás seguro?',
                    text: "No podrás revertir esta acción",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                });

                if (result.isConfirmed) {
                    await axios.delete(
                        `${this.getApiUrl}/roles/${id}`,
                        getConfig()
                    );
                    Swal.fire({
                        title: 'Rol Eliminado',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false,
                    });
                    this.fetchRoles();
                }
            } catch (error) {
                console.error('Error al eliminar el rol:', error);
                Swal.fire({
                    title: 'Error',
                    text: 'Ocurrió un error al eliminar el rol.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        },
        resetForm() {
            this.role = { id: null, name: '' };
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