<template>
    <v-container>
        <!-- Card para el formulario de usuarios -->
        <v-btn color="primary" @click="$router.push('/roles')">Gestión de Roles</v-btn>
        <v-card class="pa-4">
            <v-card-title>
                <h1>Usuarios</h1>
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="saveUser" ref="form">
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

                        <!-- Select de roles -->
                        <v-col cols="12" md="6">

                            <v-select color="indigo" label="Roles" :items="roles" item-value="id" item-title="name"
                                v-model="user.role_id" outlined dense required></v-select>
                        </v-col>

                        <!-- Contraseña del usuario -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="user.password" label="Contraseña" outlined dense
                                :type="showPassword ? 'text' : 'password'" append-icon="mdi-eye"
                                @click:append="showPassword = !showPassword"
                                :rules="[!isEditing ? rules.required : () => true, !isEditing ? rules.password : () => true]"
                                :required="!isEditing"></v-text-field>
                        </v-col>

                        <!-- Confirmación de contraseña -->
                        <v-col cols="12" md="6">
                            <v-text-field v-model="user.password_confirmation" label="Confirmar contraseña" outlined
                                dense :type="showPassword ? 'text' : 'password'" append-icon="mdi-eye"
                                @click:append="showPassword = !showPassword"
                                :rules="[!isEditing ? rules.required : () => true, matchPassword]"
                                :required="!isEditing"></v-text-field>
                        </v-col>
                    </v-row>

                    <!-- Botones de acciones -->
                    <v-row>
                        <v-col cols="12" class="text-right">
                            <v-btn :color="isEditing ? 'primary' : 'success'" type="submit" class="mr-2"
                                :loading="loading">
                                {{ isEditing ? 'Actualizar' : 'Crear' }}
                            </v-btn>
                            <v-btn v-if="isEditing" color="grey" @click="resetForm">
                                Cancelar
                            </v-btn>
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
                <v-text-field v-model="search" label="Buscar usuarios" outlined dense
                    append-icon="mdi-magnify"></v-text-field>
            </v-card-title>

            <v-data-table :headers="headers" :items="filteredUsers" :loading="tableLoading" item-key="id"
                class="elevation-1" dense>
                <template v-slot:[`item.role_name`]="{ item }">
                    {{ getRoleName(item.role_id) }}
                </template>
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
import Swal from 'sweetalert2';

export default {
    data() {
        return {
            users: [],
            roles: [],
            user: {
                id: null,
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role_id: null,
            },
            isEditing: false,
            showPassword: false,
            search: '',
            loading: false,
            tableLoading: false,
            headers: [
                { text: 'Nombre', value: 'name', align: 'start' },
                { text: 'Email', value: 'email' },
                { text: 'Rol', value: 'role_name' },
                { text: 'Acciones', value: 'actions', sortable: false },
            ],
            rules: {
                required: value => !!value || 'Este campo es requerido',
                email: value => /.+@.+\..+/.test(value) || 'Ingrese un correo válido',
                password: value => value.length >= 6 && /^(?=.*[a-zA-Z])(?=.*\d)/.test(value) ||
                    'La contraseña debe tener al menos 6 caracteres y combinar letras y números'
            }
        };
    },
    mounted() {
        this.fetchUsers();
        this.fetchRoles();
    },
    computed: {
        ...mapGetters(['getApiUrl']),
        filteredUsers() {
            return this.users.filter(user => {
                const searchTerm = this.search.toLowerCase();
                return user.name.toLowerCase().includes(searchTerm) ||
                    user.email.toLowerCase().includes(searchTerm);
            });
        },
        matchPassword() {
            return () => this.user.password === this.user.password_confirmation ||
                'Las contraseñas no coinciden';
        }
    },
    methods: {
        async fetchRoles() {
            try {
                const response = await axios.get(`${this.getApiUrl}/roles/select`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (response.data.code === 200) {
                    this.roles = response.data.data;
                }
            } catch (error) {
                Swal.fire('Error', 'Error al cargar los roles.', 'error');
            }
        },
        async fetchUsers() {
            this.tableLoading = true;
            try {
                const response = await axios.get(`${this.getApiUrl}/users/select`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                if (response.data.code === 200) {
                    // Mapear los usuarios para incluir el role_id
                    this.users = response.data.data.map(user => ({
                        ...user,
                        role_id: user.role_id // Asegurarse que role_id está incluido
                    }));
                }
            } catch (error) {
                Swal.fire('Error', 'Error al obtener los usuarios.', 'error');
            } finally {
                this.tableLoading = false;
            }
        },

        // 2. Corrección en el método editUser
        async editUser(user) {
            try {
                const response = await axios.get(`${this.getApiUrl}/users/find/${user.id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.data.code === 200) {
                    const userData = response.data.data;
                    this.user = {
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        role_id: userData.role_id, // Asegurarse de incluir role_id
                        password: '',
                        password_confirmation: '',
                    };
                    this.isEditing = true;
                }
            } catch (error) {
                Swal.fire('Error', 'Error al cargar los datos del usuario.', 'error');
            }
        },

        // 3. Corrección en el método deleteUser
        async deleteUser(id) {
            try {
                const response = await axios.delete(`${this.getApiUrl}/users/destroy/${id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.data.code === 200) {
                    Swal.fire('Eliminado', response.data.message, 'success');
                    await this.fetchUsers(); // Refrescar la lista después de eliminar
                }
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Error al eliminar el usuario.', 'error');
            }
        },

        // 4. Corrección en el método saveUser
        async saveUser() {
            if (!this.$refs.form.validate()) return;

            this.loading = true;
            try {
                const endpoint = this.isEditing
                    ? `${this.getApiUrl}/users/update/${this.user.id}`
                    : `${this.getApiUrl}/users/store`;

                const method = this.isEditing ? 'put' : 'post';
                const userData = { ...this.user };

                if (this.isEditing && !userData.password) {
                    delete userData.password;
                    delete userData.password_confirmation;
                }

                const response = await axios({
                    method,
                    url: endpoint,
                    data: userData,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (response.data.code === 200 || response.data.code === 201) {
                    await this.fetchUsers(); // Refrescar la lista después de guardar
                    Swal.fire(
                        this.isEditing ? 'Actualizado' : 'Creado',
                        response.data.message,
                        'success'
                    );
                    this.resetForm();
                }
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Error al guardar el usuario.', 'error');
            } finally {
                this.loading = false;
            }
        },
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

        resetForm() {
            this.$refs.form.reset();
            this.user = {
                id: null,
                name: '',
                email: '',
                password: '',
                password_confirmation: '',
                role_id: null
            };
            this.isEditing = false;
            this.showPassword = false;
        },
        getRoleName(roleId) {
            const role = this.roles.find(r => r.id === roleId);
            return role ? role.name : 'N/A';
        }
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