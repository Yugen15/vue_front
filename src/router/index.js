import { createRouter, createWebHistory } from 'vue-router'
import Especialidad from '@/views/EspecialidadesCrud.vue'
import Usuario from '@/views/UsuariosCrud.vue'
import Medico from '@/views/MedicoCrud.vue'
import Paciente from '@/views/PacientesCrud.vue'
import Citas from '@/views/CitasCrud.vue'

const routes = [

  {
    path: '/especialidad',
    name: 'especialidad',
    component: Especialidad
  },
  {
    path: '/usuario',
    name: 'usuario',
    component: Usuario
  },
  {
    path: '/medico',
    name: 'medico',
    component: Medico
  },
  {
    path: '/paciente',
    name: 'paciente',
    component: Paciente
  },
  {
    path: '/citas',
    name: 'citas',
    component: Citas
  },
]


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})


export default router
