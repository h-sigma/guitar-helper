<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
/* Global resets if needed, but style.css is preferred */
body, html {
  margin: 0;
  padding: 0;
  background: #121212;
  color: #ffffff;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>
