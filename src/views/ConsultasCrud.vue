<template>
  <div class="consultas-container">
    <h1 class="page-title">Consultas</h1>

    <h3 class="titulo">Filtrar Por:</h3>
    <div class="filters">
      <div class="filter-group">
        <label for="estado">Estado:</label>
        <select id="estado" v-model="filtroEstado" @change="fetchConsultas" class="filter-control">
          <option value="">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Completada">Completada</option>
          <option value="Cancelada">Canceladas</option>
          <option value="Confirmada">Confirmada</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="fecha">Fecha:</label>
        <input id="fecha" type="date" v-model="filtroFecha" @change="fetchConsultas" class="filter-control" />
      </div>

      <div class="filter-group">
        <label for="busqueda">Buscar:</label>
        <input id="busqueda" type="text" v-model="filtroBusqueda" @input="fetchConsultas"
          placeholder="Buscar por nombre o dui" class="filter-control" />
      </div>
    </div>

    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Paciente</th>
            <th>Médico</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Diagnóstico</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="consulta in consultasVisibles" :key="consulta.consulta_id">
            <td>{{ consulta.consulta_id }}</td>
            <td>{{ consulta.paciente_nombre }} ({{ consulta.paciente_dui }})</td>
            <td>{{ consulta.doctor_nombre }}</td>
            <td>{{ formatDate(consulta.fecha) }}</td>
            <td>
              <span class="status-badge" :class="'status-' + consulta.estado.toLowerCase()">
                {{ consulta.estado }}
              </span>
            </td>
            <td>{{ consulta.diagnostico || '-' }}</td>
            <td class="actions-cell">
              <v-btn icon small class="action-btn" @click="editConsulta(consulta)" title="Editar">
                <v-icon color="warning">mdi-pencil</v-icon>
              </v-btn>
              <v-btn icon small class="action-btn" @click="deleteConsulta(consulta.consulta_id)" title="Eliminar">
                <v-icon color="error">mdi-delete</v-icon>
              </v-btn>
              <v-btn icon small class="action-btn" @click="openRecetasModal(consulta)" title="Recetas">
                <v-icon color="primary">mdi-prescription</v-icon>
              </v-btn>
              <v-btn icon small class="action-btn" @click="openExamenesModal(consulta)" title="Exámenes">
                <v-icon color="info">mdi-file-document</v-icon>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Edición -->
    <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">Editar Consulta</h2>
          <button class="modal-close" @click="closeModal" title="Cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="updateConsulta" class="modal-form">
            <div class="form-group">
              <label for="estado-edit">Estado:</label>
              <select id="estado-edit" v-model="editedConsulta.estado" class="form-control">
                <option value="Pendiente">Pendiente</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
                <option value="Confirmada">Confirmada</option>
              </select>
            </div>
            <div class="form-group">
              <label for="diagnostico">Diagnóstico:</label>
              <textarea id="diagnostico" v-model="editedConsulta.diagnostico" class="form-control" rows="4"
                placeholder="Ingrese el diagnóstico..."></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Cancelar</button>
              <button type="submit" class="btn btn-primary">Guardar cambios</button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modal de Recetas -->
    <div class="modal-overlay" v-if="showRecetasModal" @click.self="closeRecetasModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">Recetas para {{ selectedConsulta?.paciente_nombre }}</h2>
          <button class="modal-close" @click="closeRecetasModal" title="Cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <!-- Información de la consulta -->
          <div class="consulta-info">
            <div class="info-group">
              <label>Paciente:</label>
              <span>{{ selectedConsulta?.paciente_nombre }}</span>
            </div>
            <div class="info-group">
              <label>DUI:</label>
              <span>{{ selectedConsulta?.paciente_dui }}</span>
            </div>
            <div class="info-group">
              <label>Médico:</label>
              <span>{{ selectedConsulta?.doctor_nombre }}</span>
            </div>
          </div>

          <!-- Formulario para nueva receta -->
          <form @submit.prevent="saveReceta" class="receta-form">
            <h3>{{ editingReceta ? 'Editar Receta' : 'Nueva Receta' }}</h3>
            <div class="form-group">
              <label for="medicamento">Medicamento:</label>
              <input id="medicamento" v-model="recetaForm.medicamento" type="text" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="dosis">Dosis:</label>
              <textarea id="dosis" v-model="recetaForm.dosis" class="form-control" required></textarea>
            </div>
            <div class="form-buttons">
              <button type="button" class="btn btn-secondary" @click="resetForm">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingReceta ? 'Actualizar' : 'Agregar' }} Receta
              </button>
            </div>
          </form>

          <!-- Lista de recetas -->
          <div class="recetas-list">
            <h3>Recetas Existentes</h3>
            <div v-if="recetas.length === 0" class="no-recetas">
              No hay recetas registradas para esta consulta.
            </div>
            <div v-else class="recetas-table">
              <table>
                <thead>
                  <tr>
                    <th>Medicamento</th>
                    <th>Dosis</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="receta in recetas" :key="receta.id">
                    <td>{{ receta.medicamento }}</td>
                    <td>{{ receta.dosis }}</td>
                    <td class="actions">
                      <button class="btn-icon" @click="editReceta(receta)" title="Editar">
                        <v-icon small color="warning">mdi-pencil</v-icon>
                      </button>
                      <button class="btn-icon" @click="deleteReceta(receta.id)" title="Eliminar">
                        <v-icon small color="error">mdi-delete</v-icon>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Exámenes -->
    <div class="modal-overlay" v-if="showExamenesModal" @click.self="closeExamenesModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">Exámenes para {{ editedConsulta?.paciente_nombre }}</h2>
          <button class="modal-close" @click="closeExamenesModal" title="Cerrar">&times;</button>
        </div>
        <div class="modal-body">
          <div class="placeholder-content">
            Contenido de exámenes aquí...
          </div>
        </div>
      </div>
    </div>
  </div>

</template>



<script>
import axios from 'axios';
import Swal from 'sweetalert2';

export default {
  name: 'ConsultasView',
  data() {
    return {
      consultas: [],
      filtroEstado: '',
      filtroFecha: '',
      filtroBusqueda: '',
      showModal: false,
      showRecetasModal: false,
      showExamenesModal: false,
      editedConsulta: null,
      recetas: [],
      recetaForm: {
        medicamento: '',
        dosis: '',
        id_consulta: null
      },
      editingReceta: null,
      selectedConsulta: null
    };
  },
  computed: {
    consultasVisibles() {
      return this.consultas.filter(consulta => {
        const matchesEstado = this.filtroEstado ? consulta.estado === this.filtroEstado : true;
        const matchesFecha = this.filtroFecha ? consulta.fecha === this.filtroFecha : true;
        const matchesBusqueda = this.filtroBusqueda ?
          consulta.paciente_nombre.toLowerCase().includes(this.filtroBusqueda.toLowerCase()) ||
          (consulta.diagnostico && consulta.diagnostico.toLowerCase().includes(this.filtroBusqueda.toLowerCase()))
          : true;

        return matchesEstado && matchesFecha && matchesBusqueda;
      });
    }
  },

  mounted() {
    this.fetchConsultas();
  },
  methods: {
    fetchConsultas() {
      let url = 'http://localhost:8000/api/consulta/select';
      let params = {};

      if (this.filtroEstado) {
        params.estado = this.filtroEstado;
      }
      if (this.filtroFecha) {
        params.fecha = this.filtroFecha;
      }

      axios.get(url, { params })
        .then(response => {
          this.consultas = response.data;
        })
        .catch(error => {
          console.error('Error al obtener las consultas:', error);
          this.showErrorAlert('Error al cargar las consultas');
        });
    },
    editConsulta(consulta) {
      this.editedConsulta = { ...consulta };
      this.showModal = true;
    },
    updateConsulta() {
      axios.put(`http://localhost:8000/api/consultas/update/${this.editedConsulta.consulta_id}`, this.editedConsulta)
        .then(() => {
          this.fetchConsultas();
          this.closeModal();
          Swal.fire({
            title: 'Éxito',
            text: 'La consulta se ha actualizado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
        })
        .catch(error => {
          console.error('Error al actualizar la consulta:', error);
          this.showErrorAlert('Error al actualizar la consulta');
        });
    },
    deleteConsulta(id) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#ef4444',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          axios.delete(`http://localhost:8000/api/consultas/delete/${id}`)
            .then(() => {
              this.fetchConsultas();
              Swal.fire({
                title: 'Eliminado',
                text: 'La consulta se ha eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#3b82f6'
              });
            })
            .catch(error => {
              console.error('Error al eliminar la consulta:', error);
              this.showErrorAlert('Error al eliminar la consulta');
            });
        }
      });
    },
    closeModal() {
      this.showModal = false;
      this.editedConsulta = null;
    },
    openRecetasModal(consulta) {
      this.selectedConsulta = { ...consulta };
      this.fetchRecetas(consulta.consulta_id); // Cargar las recetas al abrir el modal
      this.showRecetasModal = true;
    },
    closeRecetasModal() {
      this.showRecetasModal = false;
      this.editedConsulta = null;
    },
    openExamenesModal(consulta) {
      this.editedConsulta = { ...consulta };
      this.showExamenesModal = true;
    },
    closeExamenesModal() {
      this.showExamenesModal = false;
      this.editedConsulta = null;
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },
    showErrorAlert(message) {
      Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    },


    async fetchRecetas(consultaId) {
      try {
        const response = await axios.get(`http://localhost:8000/api/consultas/${consultaId}/recetas`);
        this.recetas = response.data.data; // Acceder a data.data ya que la API devuelve {message, data}
      } catch (error) {
        console.error('Error al cargar las recetas:', error);
        this.showErrorAlert('Error al cargar las recetas');
      }
    },

    async saveReceta() {
      try {
        if (!this.selectedConsulta?.consulta_id) {
          throw new Error('No hay consulta seleccionada');
        }

        const recetaData = {
          medicamento: this.recetaForm.medicamento,
          dosis: this.recetaForm.dosis,
          id_consulta: this.selectedConsulta.consulta_id
        };

        // Validación básica en el frontend
        if (!recetaData.medicamento || !recetaData.dosis) {
          throw new Error('Por favor complete todos los campos');
        }

        let response;
        if (this.editingReceta) {
          response = await axios.put(
            `http://localhost:8000/api/recetas/${this.editingReceta.id}`,
            recetaData
          );
        } else {
          response = await axios.post('http://localhost:8000/api/recetas', recetaData);
        }

        // Verificar la respuesta
        if (response.data && response.status >= 200 && response.status < 300) {
          // Actualizar lista de recetas
          await this.fetchRecetas(this.selectedConsulta.consulta_id);

          // Mostrar mensaje de éxito
          Swal.fire({
            title: 'Éxito',
            text: this.editingReceta ? 'Receta actualizada correctamente' : 'Receta agregada correctamente',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });

          // Limpiar formulario
          this.resetForm();
        } else {
          throw new Error('Error en la respuesta del servidor');
        }
      } catch (error) {
        console.error('Error al guardar la receta:', error);
        let errorMessage = 'Error al guardar la receta';

        if (error.response?.data?.errors) {
          errorMessage = Object.values(error.response.data.errors).join('\n');
        } else if (error.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#3b82f6'
        });
      }
    },

    async deleteReceta(id) {
      try {
        const result = await Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#ef4444',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
          await axios.delete(`http://localhost:8000/api/recetas/${id}`);
          await this.fetchRecetas(this.selectedConsulta.consulta_id);

          Swal.fire({
            title: 'Eliminado',
            text: 'La receta ha sido eliminada',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
        }
      } catch (error) {
        console.error('Error al eliminar la receta:', error);
        this.showErrorAlert('Error al eliminar la receta');
      }
    },

    editReceta(receta) {
      this.editingReceta = receta;
      this.recetaForm = {
        medicamento: receta.medicamento,
        dosis: receta.dosis,
        id_consulta: this.selectedConsulta.consulta_id
      };
    },

    resetForm() {
      this.recetaForm = {
        medicamento: '',
        dosis: '',
        id_consulta: this.selectedConsulta?.consulta_id
      };
      this.editingReceta = null;
    },

  }
};
</script>

<style scoped>
.consultas-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2rem;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  background-color: #f9fafb;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
}

.filter-control {
  padding: 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.filter-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.table-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
}

.data-table th {
  background-color: #f9fafb;
  color: #374151;
  font-weight: 600;
  white-space: nowrap;
}

.data-table th:first-child {
  border-top-left-radius: 8px;
}

.data-table th:last-child {
  border-top-right-radius: 8px;
}

.data-table tr:hover {
  background-color: #f9fafb;
}

.data-table td {
  border-top: 1px solid #e5e7eb;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: capitalize;
}

.status-pendiente {
  background-color: #fef3c7;
  color: #92400e;
}

.status-completada {
  background-color: #d1fae5;
  color: #065f46;
}

.status-cancelada {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-confirmada {
  background-color: #dbeafe;
  color: #1e40af;
}

.actions-cell {
  white-space: nowrap;
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  margin: 0 0.25rem;
}

/* Estilos para los modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
  padding: 2rem;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #374151;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #3b82f6;
}

.modal-body {
  margin-bottom: 1rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  color: #374151;
}

.form-control {
  padding: 0.625rem;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  outline: none;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #1f2937;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.placeholder-content {
  color: #6b7280;
  text-align: center;
  padding: 1rem 0;
}
</style>