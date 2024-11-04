<template>
    <v-container>
        <v-row class="mb-4">
            <v-col>
                <v-btn color="primary" prepend-icon="mdi-plus" @click="abrirModalCrear">
                    Nueva Cita
                </v-btn>
            </v-col>
            <v-col class="text-right">
                <v-btn-group>
                    <v-btn @click="cambiarMes(-1)">
                        <v-icon>mdi-chevron-left</v-icon>
                    </v-btn>
                    <v-btn disabled>
                        {{ nombreMesActual }}
                    </v-btn>
                    <v-btn @click="cambiarMes(1)">
                        <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                </v-btn-group>
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="12">
                <div class="calendario-grid">
                    <div v-for="nombreDia in diasSemana" :key="nombreDia" class="dia-semana">
                        {{ nombreDia }}
                    </div>
                    <template v-for="{ dia, esDeMesActual } in diasCalendario" :key="dia">
                        <div :class="['dia-container', { 'otro-mes': !esDeMesActual }]">
                            <div class="dia-header">{{ dia }}</div>
                            <div class="citas-container">
                                <v-card v-for="cita in citasDelDia(dia, esDeMesActual)" :key="cita.id"
                                    :class="['cita-card', getEstadoClass(cita.estado)]" @click="abrirModalEditar(cita)">
                                    <v-card-text>
                                        <div class="text-subtitle-2 font-weight-bold">
                                            {{ new Date(cita.date).toLocaleTimeString('es-ES', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) }}
                                        </div>
                                        <div class="text-body-2">{{ cita.title }}</div>
                                        <div class="text-caption">
                                            {{ getPacienteName(cita.paciente_id) }}
                                        </div>
                                    </v-card-text>
                                </v-card>
                            </div>
                        </div>
                    </template>
                </div>
            </v-col>
        </v-row>

        <v-dialog v-model="mostrarModal" max-width="600px" persistent>
            <v-card>
                <v-card-title>
                    <span class="text-h5">{{ modoEdicion ? 'Editar Cita' : 'Nueva Cita' }}</span>
                </v-card-title>

                <v-card-text>
                    <v-form ref="form" @submit.prevent="handleSubmit">
                        <v-container>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field v-model="formData.title" label="Título" required variant="outlined"
                                        :loading="loading" :disabled="loading" density="comfortable"></v-text-field>
                                </v-col>

                                <v-col cols="12">
                                    <v-text-field v-model="formData.date" label="Fecha y Hora" type="datetime-local"
                                        required variant="outlined" :loading="loading" :disabled="loading"
                                        density="comfortable"></v-text-field>
                                </v-col>

                                <v-col cols="12">
                                    <v-autocomplete v-model="formData.paciente_id" :items="pacientes"
                                        :item-title="item => `${item.nombre} ${item.apellido} - DUI: ${item.dui}`"
                                        item-value="id" label="Buscar Paciente" persistent-hint
                                        hint="Busque por nombre o DUI" required variant="outlined" :loading="loading"
                                        :disabled="loading" density="comfortable" clearable
                                        @update:search="filterPacientes">
                                        <template v-slot:item="{ props, item }">
                                            <v-list-item v-bind="props">
                                                <v-list-item-title>
                                                    {{ item.raw.nombre }} {{ item.raw.apellido }}
                                                </v-list-item-title>
                                                <v-list-item-subtitle>
                                                    DUI: {{ item.raw.dui }}
                                                </v-list-item-subtitle>
                                            </v-list-item>
                                        </template>
                                    </v-autocomplete>
                                </v-col>

                                <v-col cols="12">
                                    <v-autocomplete v-model="formData.doctor_id" :items="doctores"
                                        :item-title="item => `Dr(a). ${item.nombre} ${item.apellido} - ${item.especialidad || 'Sin especialidad'}`"
                                        item-value="id" label="Buscar Médico" persistent-hint
                                        hint="Busque por nombre o especialidad" required variant="outlined"
                                        :loading="loading" :disabled="loading" density="comfortable" clearable
                                        @update:search="filterDoctores">
                                        <template v-slot:item="{ props, item }">
                                            <v-list-item v-bind="props">
                                                <v-list-item-title>
                                                    Dr(a). {{ item.raw.nombre }} {{ item.raw.apellido }}
                                                </v-list-item-title>
                                                <v-list-item-subtitle>
                                                    {{ item.raw.especialidad || 'Sin especialidad' }}
                                                </v-list-item-subtitle>
                                            </v-list-item>
                                        </template>
                                    </v-autocomplete>
                                </v-col>

                                <v-col cols="12">
                                    <v-select v-model="formData.estado" :items="estados" label="Estado" required
                                        variant="outlined" :loading="loading" :disabled="loading"
                                        density="comfortable"></v-select>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-form>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="error" variant="text" @click="cerrarModal" :disabled="loading">
                        Cancelar
                    </v-btn>
                    <v-btn color="primary" variant="text" @click="handleSubmit" :loading="loading" :disabled="loading">
                        {{ modoEdicion ? 'Actualizar' : 'Crear' }}
                    </v-btn>
                    <v-btn v-if="modoEdicion" color="error" variant="text" @click="handleEliminarCita"
                        :loading="loading" :disabled="loading">
                        Eliminar
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-container>
</template>

<script>
import { ref, computed, onMounted, inject, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
    name: 'CitasCRUD',
    setup() {
        const store = inject('store');
        const apiUrl = store.state.apiUrl;
        const LIMITE_CITAS_POR_DIA = 2;

        // Referencias reactivas básicas
        const citas = ref([]);
        const pacientes = ref([]);
        const doctores = ref([]);
        const mostrarModal = ref(false);
        const modoEdicion = ref(false);
        const citaIdEdicion = ref(null);
        const form = ref(null);
        const loading = ref(false);
        const searchText = ref('');
        const doctorSearchText = ref('');

        const mesActual = ref(new Date().getMonth());
        const anioActual = ref(new Date().getFullYear());

        const estados = [
            'Pendiente',
            'Confirmada',
            'Cancelada',
            'Completada'
        ];

        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

        const formData = ref({
            title: '',
            date: '',
            estado: '',
            paciente_id: '',
            doctor_id: ''
        });

        // Computed properties
        const nombreMesActual = computed(() => {
            return new Date(anioActual.value, mesActual.value).toLocaleString('es-ES', {
                month: 'long',
                year: 'numeric'
            });
        });

        const diasCalendario = computed(() => {
            const primerDia = new Date(anioActual.value, mesActual.value, 1);
            const ultimoDia = new Date(anioActual.value, mesActual.value + 1, 0);
            const resultado = [];

            // Obtener el último día del mes anterior
            const ultimoDiaMesAnterior = new Date(anioActual.value, mesActual.value, 0).getDate();

            // Corregido: Calcular días del mes anterior
            // primerDia.getDay() devuelve 0 para domingo, por lo que necesitamos agregar los días correctamente
            const diasAnteriores = primerDia.getDay();
            for (let i = diasAnteriores - 1; i >= 0; i--) {
                resultado.push({
                    dia: ultimoDiaMesAnterior - i,
                    esDeMesActual: false
                });
            }

            // Agregar días del mes actual
            for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
                resultado.push({
                    dia,
                    esDeMesActual: true
                });
            }

            // Agregar días del mes siguiente
            const diasSiguientes = 42 - resultado.length; // 42 = 6 semanas * 7 días
            for (let dia = 1; dia <= diasSiguientes; dia++) {
                resultado.push({
                    dia,
                    esDeMesActual: false
                });
            }

            return resultado;
        });

        const pacientesFiltrados = computed(() => {
            if (!searchText.value) return pacientes.value;

            const searchLower = searchText.value.toLowerCase();
            return pacientes.value.filter(paciente =>
                paciente.nombre.toLowerCase().includes(searchLower) ||
                paciente.apellido.toLowerCase().includes(searchLower) ||
                paciente.dui.toLowerCase().includes(searchLower)
            );
        });

        const doctoresFiltrados = computed(() => {
            if (!doctorSearchText.value) return doctores.value;

            const searchLower = doctorSearchText.value.toLowerCase();
            return doctores.value.filter(doctor =>
                doctor.nombre.toLowerCase().includes(searchLower) ||
                doctor.apellido.toLowerCase().includes(searchLower) ||
                (doctor.especialidad && doctor.especialidad.toLowerCase().includes(searchLower))
            );
        });

        // Métodos de filtrado
        const filterPacientes = (text) => {
            searchText.value = text;
        };

        const filterDoctores = (text) => {
            doctorSearchText.value = text;
        };

        // Métodos de API

        const getConfig = () => ({
            headers: { 'Authorization': 'Bearer ' + store.getters.getToken }
        });

        // Métodos de API adaptados con configuración
        const obtenerCitas = async () => {
            try {
                loading.value = true;
                const response = await axios.get(`${apiUrl}/citas`, getConfig());
                if (Array.isArray(response.data)) {
                    citas.value = response.data;
                }
            } catch (error) {
                console.error('Error al obtener citas:', error);
                mostrarError('No se pudieron cargar las citas.');
            } finally {
                loading.value = false;
            }
        };

        const obtenerPacientes = async () => {
            try {
                const response = await axios.get(`${apiUrl}/paciente/select`, getConfig());
                if (response.data && response.data.code === 200) {
                    pacientes.value = response.data.data;
                }
            } catch (error) {
                console.error('Error al obtener pacientes:', error);
                mostrarError('No se pudieron cargar los pacientes.');
            }
        };

        const obtenerDoctores = async () => {
            try {
                const response = await axios.get(`${apiUrl}/medico/select`, getConfig());
                if (response.data && response.data.code === 200) {
                    doctores.value = response.data.data;
                }
            } catch (error) {
                console.error('Error al obtener doctores:', error);
                mostrarError('No se pudieron cargar los doctores.');
            }
        };

        const handleSubmit = async () => {
            try {
                loading.value = true;
                const fechaCita = new Date(formData.value.date);
                const citasEnDia = citasDelDia(fechaCita.getDate(), true);

                if (!modoEdicion.value && citasEnDia.length >= LIMITE_CITAS_POR_DIA) {
                    Swal.fire({
                        title: 'Lo sentimos',
                        text: 'Los cupos para este día están llenos',
                        icon: 'info',
                        confirmButtonText: 'Entendido'
                    });
                    return;
                }

                const endpoint = modoEdicion.value
                    ? `${apiUrl}/citas/update/${citaIdEdicion.value}`
                    : `${apiUrl}/citas/create`;
                const method = modoEdicion.value ? 'put' : 'post';

                const response = await axios[method](endpoint, formData.value, getConfig());

                if (response.data.code === 200 || response.data.code === 201) {
                    await obtenerCitas();
                    mostrarExito(modoEdicion.value ? 'Cita actualizada exitosamente' : 'Cita creada exitosamente');
                    cerrarModal();
                }
            } catch (error) {
                console.error('Error al procesar la cita:', error);
                mostrarError('No se pudo procesar la solicitud.');
            } finally {
                loading.value = false;
            }
        };

        const handleEliminarCita = async () => {
            if (!citaIdEdicion.value) return;

            try {
                const result = await Swal.fire({
                    title: '¿Está seguro?',
                    text: "Esta acción no se puede deshacer",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sí, eliminar',
                    cancelButtonText: 'Cancelar'
                });

                if (result.isConfirmed) {
                    await axios.delete(`${apiUrl}/citas/delete/${citaIdEdicion.value}`, getConfig());
                    await obtenerCitas();
                    mostrarExito('Cita eliminada exitosamente');
                    cerrarModal();
                }
            } catch (error) {
                console.error('Error al eliminar cita:', error);
                mostrarError('No se pudo eliminar la cita.');
            }
        };

        // Métodos de utilidad
        const esDiaCompleto = (dia, esDeMesActual) => {
            if (!esDeMesActual) return false;
            const citasEnDia = citasDelDia(dia, esDeMesActual);
            return citasEnDia.length >= LIMITE_CITAS_POR_DIA;
        };

        const handleDiaClick = (dia, esDeMesActual) => {
            if (!esDeMesActual) return;

            if (esDiaCompleto(dia, esDeMesActual)) {
                Swal.fire({
                    title: 'Lo sentimos',
                    text: 'Los cupos para este día están llenos',
                    icon: 'info',
                    confirmButtonText: 'Entendido'
                });
                return;
            }

            const fecha = new Date(anioActual.value, mesActual.value, dia);
            formData.value.date = formatDateForInput(fecha);
            abrirModalCrear();
        };

        const abrirModalCrear = () => {
            modoEdicion.value = false;
            citaIdEdicion.value = null;
            limpiarFormulario();
            mostrarModal.value = true;
        };

        const abrirModalEditar = (cita) => {
            modoEdicion.value = true;
            citaIdEdicion.value = cita.id;
            formData.value = {
                title: cita.title,
                date: formatDateForInput(cita.date),
                estado: cita.estado,
                paciente_id: cita.paciente_id,
                doctor_id: cita.doctor_id
            };
            mostrarModal.value = true;
        };

        const cerrarModal = () => {
            mostrarModal.value = false;
            limpiarFormulario();
        };

        const limpiarFormulario = () => {
            formData.value = {
                title: '',
                date: '',
                estado: '',
                paciente_id: '',
                doctor_id: ''
            };
            if (form.value) {
                form.value.resetValidation?.();
            }
        };

        const formatDateForInput = (date) => {
            const newDate = new Date(date);
            return newDate.toISOString().slice(0, 16);
        };

        const citasDelDia = (dia, esDeMesActual) => {
            if (!esDeMesActual) return [];
            return citas.value.filter(cita => {
                const citaDate = new Date(cita.date);
                return citaDate.getDate() === dia &&
                    citaDate.getMonth() === mesActual.value &&
                    citaDate.getFullYear() === anioActual.value;
            });
        };

        const getEstadoClass = (estado) => {
            const clases = {
                'Pendiente': 'estado-pendiente',
                'Confirmada': 'estado-confirmada',
                'Cancelada': 'estado-cancelada',
                'Completada': 'estado-completada'
            };
            return clases[estado] || '';
        };

        const getPacienteName = (pacienteId) => {
            const paciente = pacientes.value.find(p => p.id === pacienteId);
            return paciente ? `${paciente.nombre} ${paciente.apellido}` : '';
        };

        const cambiarMes = (direccion) => {
            const nuevaFecha = new Date(anioActual.value, mesActual.value + direccion);
            mesActual.value = nuevaFecha.getMonth();
            anioActual.value = nuevaFecha.getFullYear();
        };

        const mostrarError = (mensaje) => {
            Swal.fire({
                title: 'Error',
                text: mensaje,
                icon: 'error',
                confirmButtonText: 'Aceptar'
            });
        };

        const mostrarExito = (mensaje) => {
            Swal.fire({
                title: 'Éxito',
                text: mensaje,
                icon: 'success',
                confirmButtonText: 'Aceptar'
            });
        };

        // Hooks del ciclo de vida
        onMounted(() => {
            obtenerCitas();
            obtenerPacientes();
            obtenerDoctores();
        });

        watch(citas, (nuevoValor) => {
            console.log('Citas actualizadas:', nuevoValor);
        });

        // Retorno de la composición
        return {
            // Estado
            citas,
            pacientes: pacientesFiltrados,
            doctores: doctoresFiltrados,
            formData,
            mostrarModal,
            modoEdicion,
            loading,
            estados,
            diasSemana,
            nombreMesActual,
            diasCalendario,
            form,

            // Métodos
            handleSubmit,
            handleEliminarCita,
            abrirModalCrear,
            abrirModalEditar,
            cerrarModal,
            citasDelDia,
            getEstadoClass,
            getPacienteName,
            cambiarMes,
            esDiaCompleto,
            handleDiaClick,
            filterPacientes,
            filterDoctores
        };
    }
};
</script>

<style scoped>
.calendario-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
}

.dia-semana {
    text-align: center;
    font-weight: bold;
    padding: 8px;
    background-color: #f5f5f5;
    border-radius: 4px;
}

.dia-container {
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    min-height: 120px;
    background-color: white;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.dia-container:hover:not(.otro-mes):not(.dia-completo) {
    background-color: #f8f8f8;
}

.dia-container.otro-mes {
    background-color: #f9f9f9;
    opacity: 0.7;
    cursor: default;
}

.dia-container.dia-completo {
    background-color: #f0f0f0 !important;
    cursor: not-allowed;
    opacity: 0.7;
}

.dia-container.dia-completo .citas-container {
    pointer-events: none;
}

.dia-header {
    background-color: #f5f5f5;
    padding: 4px;
    text-align: center;
    font-weight: bold;
    border-bottom: 1px solid #e0e0e0;
}

.citas-container {
    padding: 4px;
    max-height: 200px;
    overflow-y: auto;
}

.cita-card {
    margin-bottom: 4px;
    cursor: pointer;
    transition: transform 0.2s ease;
}

.cita-card:hover {
    transform: scale(1.02);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.estado-pendiente {
    background-color: #FFF9C4 !important;
    border-left: 4px solid #FBC02D;
}

.estado-confirmada {
    background-color: #C8E6C9 !important;
    border-left: 4px solid #43A047;
}

.estado-cancelada {
    background-color: #FFCDD2 !important;
    border-left: 4px solid #E53935;
}

.estado-completada {
    background-color: #B3E5FC !important;
    border-left: 4px solid #1E88E5;
}

.citas-container::-webkit-scrollbar {
    width: 6px;
}

.citas-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.citas-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 3px;
}

.citas-container::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>