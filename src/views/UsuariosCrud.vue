<template>
    <v-container>
        <!-- Card para el formulario de usuarios -->
        <v-card class="pa-4">
            <v-card-title>
                <h1>Usuarios</h1>
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="saveUser">
                    <v-row>
                        <!-- Nombre del usuario -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="user.name" label="Nombre del usuario" outlined dense
                                :rules="[rules.required]" required></v-text-field>
                        </v-col>

                        <!-- Email del usuario -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="user.email" label="Correo electrónico" outlined dense type="email"
                                :rules="[rules.required, rules.email]" required></v-text-field>
                        </v-col>

                        <!-- Contraseña del usuario -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="user.password" label="Contraseña" outlined dense
                                :type="showPassword ? 'text' : 'password'" append-icon="mdi-eye"
                                @click:append="showPassword = !showPassword" :rules="[rules.required, rules.password]"
                                :required="!isEditing"></v-text-field>
                        </v-col>

                        <!-- Confirmación de contraseña -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="user.password_confirmation" label="Confirmar contraseña" outlined
                                dense :type="showPassword ? 'text' : 'password'" append-icon="mdi-eye"
                                @click:append="showPassword = !showPassword" :rules="[rules.required, matchPassword]"
                                :required="!isEditing"></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- Botones de acciones -->
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

        <!-- Card para la tabla de usuarios -->
        <v-card class="mt-4">
            <v-card-title>
                <h2>Lista de Usuarios</h2>
                <v-spacer></v-spacer>
                <v-text-field v-model="search" label="Buscar usuarios" outlined dense></v-text-field>
            </v-card-title>

            <v-data-table :headers="headers" :items="filteredUsers" item-key="id" class="elevation-1" dense>
                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn icon @click="editUser(item)">
                        <v-icon color="warning">mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn icon @click="confirmDeleteUser(item.id)">
                        <v-icon color="error">mdi-delete</v-icon>
                    </v-btn>
                </template>
            </v-data-table>
        </v-card>
    </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import axios from 'axios';
import Swal from 'sweetalert2'; // Importar SweetAlert2

export default {
    data() {
        return {
            users: [], // Lista de usuarios
            user: {
                id: null,
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
            },
            isEditing: false, // Flag para saber si estamos editando
            showPassword: false, // Mostrar u ocultar la contraseña
            search: '', // Variable para la búsqueda
            headers: [
                { text: 'Nombre', value: 'name', align: 'start' },
                { text: 'Email', value: 'email' },
                { text: 'Acciones', value: 'actions', sortable: false },
            ],
            rules: {
                required: value => !!value || 'Este campo es requerido',
                email: value => /.+@.+\..+/.test(value) || 'Ingrese un correo válido',
                password: value => value.length >= 6 && /^(?=.*[a-zA-Z])(?=.*\d)/.test(value) || 'La contraseña debe tener al menos 6 caracteres y combinar letras y números'
            }
        };
    },
    mounted() {
        this.fetchUsers();
    },
    computed: {
        ...mapGetters(['getApiUrl']),
        filteredUsers() {
            return this.users.filter(user => {
                return user.name.toLowerCase().includes(this.search.toLowerCase()) ||
                    user.email.toLowerCase().includes(this.search.toLowerCase());
            });
        }
    },
    methods: {
        matchPassword(value) {
            return value === this.user.password || 'Las contraseñas no coinciden';
        },          
        // Obtener usuarios desde el servidor
        async fetchUsers() {
            try {
                const response = await axios.get(`${this.getApiUrl}/users`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                this.users = response.data;
            } catch (error) {
                Swal.fire('Error', 'Error al obtener los usuarios.', 'error'); // SweetAlert en caso de error
            }
        },
        // Guardar o actualizar usuario
        async saveUser() {
            try {
                if (this.isEditing) {
                    await axios.put(`${this.getApiUrl}/users/${this.user.id}`, this.user, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    Swal.fire('Actualizado', 'Usuario actualizado exitosamente.', 'success'); // SweetAlert de éxito
                } else {
                    await axios.post(`${this.getApiUrl}/users`, this.user, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    });
                    Swal.fire('Creado', 'Usuario creado exitosamente.', 'success'); // SweetAlert de éxito
                }
                this.fetchUsers();
                this.resetForm();
            } catch (error) {
                Swal.fire('Error', 'Error al guardar el usuario.', 'error'); // SweetAlert en caso de error
            }
        },
        // Editar usuario
        editUser(user) {
            this.user = { ...user, password: '', password_confirmation: '' };
            this.isEditing = true;
        },
        // Confirmar eliminación de usuario
        confirmDeleteUser(id) {
            Swal.fire({
                title: '¿Estás seguro?',
                text: 'No podrás revertir esto.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
            }).then((result) => {
                if (result.isConfirmed) {
                    this.deleteUser(id);
                }
            });
        },
        // Eliminar usuario
        async deleteUser(id) {
            try {
                await axios.delete(`${this.getApiUrl}/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                Swal.fire('Eliminado', 'El usuario ha sido eliminado.', 'success'); // SweetAlert de éxito
                this.fetchUsers();
            } catch (error) {
                Swal.fire('Error', 'Error al eliminar el usuario.', 'error'); // SweetAlert en caso de error
            }
        },
        // Resetear formulario
        resetForm() {
            this.user = { id: null, name: '', email: '', password: '', password_confirmation: '' };
            this.isEditing = false;
            this.showPassword = false;
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
