<script setup lang="ts">
    import AppDialogs from "./components/AppDialogs.vue"
    import AppHeader from "./components/AppHeader.vue"
    import FileManagerView from "./components/FileManagerView.vue"
    import GalaxyBackground from "./components/GalaxyBackground.vue"
    import IconSprite from "./components/IconSprite.vue"
    import SettingsView from "./components/SettingsView.vue"
    import { useFileManager } from "./composables/useFileManager"

    useFileManager()
</script>

<template>
    <a class="skip-link" href="#file-browser">skip to files</a>
    <GalaxyBackground />
    <IconSprite />

    <main class="page">
        <AppHeader />
        <FileManagerView />
        <SettingsView />
    </main>

    <AppDialogs />
</template>
