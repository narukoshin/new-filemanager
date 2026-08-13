<script setup lang="ts">
    import { ref } from "vue"
    import { useGalaxy } from "../composables/useGalaxy"

    const canvas = ref<HTMLCanvasElement | null>(null)

    useGalaxy(canvas)
</script>

<template>
    <canvas ref="canvas" class="galaxy" id="galaxy" aria-hidden="true"></canvas>
</template>
