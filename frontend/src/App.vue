<script setup lang="ts">
    import AppDialogs from "./components/AppDialogs.vue"
    import AppHeader from "./components/AppHeader.vue"
    import FileManagerView from "./components/FileManagerView.vue"
    import GalaxyBackground from "./components/GalaxyBackground.vue"
    import IconSprite from "./components/IconSprite.vue"
    import SettingsView from "./components/SettingsView.vue"
    import { useFileManager } from "./composables/useFileManager"

    const manager = useFileManager()
</script>

<template>
    <a
        class="skip-link"
        :href="manager.view === 'settings' ? '#settings-view' : '#file-browser'"
    >
        skip to {{ manager.view === "settings" ? "settings" : "files" }}
    </a>
    <GalaxyBackground />
    <IconSprite />

    <main class="page">
        <AppHeader :manager="manager" />
        <FileManagerView v-if="manager.view === 'browser'" :manager="manager" />
        <SettingsView v-else :manager="manager" />
    </main>

    <AppDialogs :manager="manager" />
</template>
