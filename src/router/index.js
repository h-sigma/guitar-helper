import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TunerTool from '../views/TunerTool.vue'
import ChordTool from '../views/ChordTool.vue'
import StrummingTool from '../views/StrummingTool.vue'

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
			component: TunerTool
		},
		{
			path: '/chord-practice',
			name: 'chord-practice',
			component: ChordTool
		},
		{
			path: '/strumming-practice',
			name: 'strumming-practice',
			component: StrummingTool
		}
	]
})

export default router
