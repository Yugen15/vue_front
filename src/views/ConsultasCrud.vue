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
          <h2 class="modal-title">Exámenes para {{ selectedConsulta?.paciente_nombre }}</h2>
          <button class="modal-close" @click="closeExamenesModal" title="Cerrar">&times;</button>
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

          <!-- Formulario para nuevo examen -->
          <form @submit.prevent="saveExamen" class="examen-form">
            <h3>{{ editingExamen ? 'Editar Examen' : 'Nuevo Examen' }}</h3>
            <div class="form-group">
              <label for="tipo">Tipo de Examen:</label>
              <input id="tipo" v-model="examenForm.tipo" type="text" class="form-control" required />
            </div>
            <div class="form-group">
              <label for="resultado">Resultado:</label>
              <textarea id="resultado" v-model="examenForm.resultado" class="form-control"></textarea>
            </div>
            <div class="form-buttons">
              <button type="button" class="btn btn-secondary" @click="resetExamenForm">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                {{ editingExamen ? 'Actualizar' : 'Agregar' }} Examen
              </button>
            </div>
          </form>

          <!-- Lista de exámenes -->
          <div class="examenes-list">
            <h3>Exámenes Existentes</h3>
            <div v-if="examenes.length === 0" class="no-examenes">
              No hay exámenes registrados para esta consulta.
            </div>
            <div v-else class="examenes-table">
              <table>
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Resultado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="examen in examenes" :key="examen.id">
                    <td>{{ examen.tipo }}</td>
                    <td>{{ examen.resultado || '-' }}</td>
                    <td class="actions">
                      <button class="btn-icon" @click="editExamen(examen)" title="Editar">
                        <v-icon small color="warning">mdi-pencil</v-icon>
                      </button>
                      <button class="btn-icon" @click="deleteExamen(examen.id)" title="Eliminar">
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
  </div>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2'
import store from '@/store';

const getConfig = () => ({
  headers: { 'Authorization': 'Bearer ' + store.getters.getToken }
});

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
      examenes: [],
      recetaForm: {
        medicamento: '',
        dosis: '',
        id_consulta: null,
      },
      examenForm: {
        tipo: '',
        resultado: '',
        id_consulta: null
      },
      editingExamen: null,
      selectedConsulta: null,
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
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },

    async fetchConsultas() {
      try {
        let url = 'http://localhost:8000/api/consulta/select';
        let params = {};

        if (this.filtroEstado) {
          params.estado = this.filtroEstado;
        }
        if (this.filtroFecha) {
          params.fecha = this.filtroFecha;
        }

        const response = await axios.get(url, {
          ...getConfig(),
          params
        });
        this.consultas = response.data;
      } catch (error) {
        console.error('Error al obtener las consultas:', error);
        this.showErrorAlert('Error al cargar las consultas');
      }
    },

    showErrorAlert(message) {
      Swal.fire({
        title: 'Error',
        text: message,
        icon: 'error',
        confirmButtonColor: '#3b82f6'
      });
    },

    editConsulta(consulta) {
      this.editedConsulta = { ...consulta };
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.editedConsulta = null;
    },

    closeRecetasModal() {
      this.showRecetasModal = false;
      this.selectedConsulta = null;
      this.resetForm();
    },

    closeExamenesModal() {
      this.showExamenesModal = false;
      this.resetExamenForm();
      this.examenes = [];
      this.selectedConsulta = null;
    },

    openRecetasModal(consulta) {
      this.selectedConsulta = consulta;
      this.showRecetasModal = true;
      this.fetchRecetas(consulta.consulta_id);
    },

    async openExamenesModal(consulta) {
      this.selectedConsulta = consulta;
      this.showExamenesModal = true;
      await this.fetchExamenes(consulta.consulta_id);
    },

    async updateConsulta() {
      try {
        await axios.put(
          `http://localhost:8000/api/consultas/update/${this.editedConsulta.consulta_id}`,
          this.editedConsulta,
          getConfig()
        );

        await this.fetchConsultas();
        this.closeModal();

        Swal.fire({
          title: 'Éxito',
          text: 'La consulta se ha actualizado correctamente.',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });
      } catch (error) {
        console.error('Error al actualizar la consulta:', error);
        this.showErrorAlert('Error al actualizar la consulta');
      }
    },

    async deleteConsulta(id) {
      try {
        const result = await Swal.fire({
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3b82f6',
          cancelButtonColor: '#ef4444',
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
          await axios.delete(
            `http://localhost:8000/api/consultas/delete/${id}`,
            getConfig()
          );

          await this.fetchConsultas();

          Swal.fire({
            title: 'Eliminado',
            text: 'La consulta se ha eliminado correctamente.',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
        }
      } catch (error) {
        console.error('Error al eliminar la consulta:', error);
        this.showErrorAlert('Error al eliminar la consulta');
      }
    },

    // RECETAS
    async fetchRecetas(consultaId) {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/consultas/${consultaId}/recetas`,
          getConfig()
        );
        this.recetas = response.data.data;
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

        if (!recetaData.medicamento || !recetaData.dosis) {
          throw new Error('Por favor complete todos los campos');
        }

        if (this.editingReceta) {
          await axios.put(
            `http://localhost:8000/api/recetas/${this.editingReceta.id}`,
            recetaData,
            getConfig()
          );
        } else {
          await axios.post(
            'http://localhost:8000/api/recetas',
            recetaData,
            getConfig()
          );
        }

        await this.fetchRecetas(this.selectedConsulta.consulta_id);

        Swal.fire({
          title: 'Éxito',
          text: this.editingReceta ? 'Receta actualizada correctamente' : 'Receta agregada correctamente',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });

        this.resetForm();
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
          await axios.delete(
            `http://localhost:8000/api/recetas/${id}`,
            getConfig()
          );
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

    // EXÁMENES
    async fetchExamenes(consultaId) {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/consultas/${consultaId}/examenes`,
          getConfig()
        );
        this.examenes = response.data.data;
      } catch (error) {
        console.error('Error al cargar los exámenes:', error);
        this.showErrorAlert('Error al cargar los exámenes');
      }
    },

    async saveExamen() {
      try {
        if (!this.selectedConsulta?.consulta_id) {
          throw new Error('No hay consulta seleccionada');
        }

        const examenData = {
          tipo: this.examenForm.tipo,
          resultado: this.examenForm.resultado,
          id_consulta: this.selectedConsulta.consulta_id
        };

        if (this.editingExamen) {
          await axios.put(
            `http://localhost:8000/api/examenes/${this.editingExamen.id}`,
            examenData,
            getConfig()
          );
        } else {
          await axios.post(
            'http://localhost:8000/api/examenes',
            examenData,
            getConfig()
          );
        }

        await this.fetchExamenes(this.selectedConsulta.consulta_id);

        Swal.fire({
          title: 'Éxito',
          text: this.editingExamen ? 'Examen actualizado correctamente' : 'Examen agregado correctamente',
          icon: 'success',
          confirmButtonColor: '#3b82f6'
        });

        this.resetExamenForm();
      } catch (error) {
        console.error('Error al guardar el examen:', error);
        this.showErrorAlert('Error al guardar el examen');
      }
    },

    editExamen(examen) {
      this.editingExamen = examen;
      this.examenForm = {
        tipo: examen.tipo,
        resultado: examen.resultado,
        id_consulta: this.selectedConsulta.consulta_id
      };
    },

    async deleteExamen(id) {
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
          await axios.delete(
            `http://localhost:8000/api/examenes/${id}`,
            getConfig()
          );
          await this.fetchExamenes(this.selectedConsulta.consulta_id);

          Swal.fire({
            title: 'Eliminado',
            text: 'El examen ha sido eliminado',
            icon: 'success',
            confirmButtonColor: '#3b82f6'
          });
        }
      } catch (error) {
        console.error('Error al eliminar el examen:', error);
        this.showErrorAlert('Error al eliminar el examen');
      }
    },

    resetExamenForm() {
      this.examenForm = {
        tipo: '',
        resultado: '',
        id_consulta: this.selectedConsulta?.consulta_id
      };
      this.editingExamen = null;
    }
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

.examenes-list {
  margin-top: 2rem;
}

.examenes-table {
  width: 100%;
  margin-top: 1rem;
}

.examenes-table table {
  width: 100%;
  border-collapse: collapse;
}

.examenes-table th,
.examenes-table td {
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  text-align: left;
}

.examenes-table th {
  background-color: #f9fafb;
  font-weight: 600;
}

.no-examenes {
  text-align: center;
  padding: 1rem;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 6px;
}

.examen-form {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 8px;
}

.form-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-icon {
  padding: 0.25rem;
  background: none;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-icon:hover {
  opacity: 0.7;
}
</style>