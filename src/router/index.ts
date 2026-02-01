import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TunerView from '../views/TunerView.vue'
import PerfectChordView from '../views/PerfectChordView.vue'
import StrummingView from '../views/StrummingView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/tuner',
      name: 'tuner',
      component: TunerView
    },
    {
      path: '/chords',
      name: 'chords',
      component: PerfectChordView
    },
    {
      path: '/strum',
      name: 'strum',
      component: StrummingView
    }
  ]
})

export default router
