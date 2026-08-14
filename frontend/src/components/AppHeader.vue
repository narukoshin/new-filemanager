<script setup lang="ts">
    import { onMounted, onUnmounted, ref, watch } from "vue"
    import type { FileManager } from "../composables/fileManager"

    const { manager } = defineProps<{ manager: FileManager }>()
    const accountMenuOpen = ref(false)

    /** Opens login for guests and toggles the account menu for members. */
    const handleAccount = (): void => {
        if (!manager.isAuthenticated) {
            manager.openDialog("login")
            return
        }

        accountMenuOpen.value = !accountMenuOpen.value
    }

    /** Closes the account menu when the click belongs elsewhere. */
    const closeAccountMenu = (): void => {
        accountMenuOpen.value = false
    }

    /** Enters settings without leaving an account menu floating behind. */
    const openSettings = (): void => {
        closeAccountMenu()
        manager.showSettings()
    }

    /** Signs out and tidies the local menu state. */
    const signOut = (): void => {
        closeAccountMenu()
        manager.logout()
    }

    watch(() => manager.isAuthenticated, closeAccountMenu)
    onMounted(() => document.addEventListener("click", closeAccountMenu))
    onUnmounted(() => document.removeEventListener("click", closeAccountMenu))
</script>

<template>
    <header class="topbar">
        <div class="brand">
            <span class="brand-project">PROJECT</span>
            <span class="brand-mark">
                <span class="brand-thorn">Þ</span>ERXWOLD
            </span>
            <span class="slash">/</span>
            <span>{{ manager.brandLabel }}</span>
        </div>

        <div class="top-actions">
            <div class="status">
                <span class="status-dot" aria-hidden="true"></span>
                <span class="status-label">{{ manager.statusLabel }}</span>
            </div>
            <div class="account" @click.stop>
                <button
                    class="login"
                    type="button"
                    :aria-haspopup="manager.isAuthenticated ? 'menu' : 'dialog'"
                    :aria-expanded="accountMenuOpen"
                    @click="handleAccount"
                >
                    <svg
                        class="pixel-icon"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                    >
                        <use
                            :href="
                                manager.isAuthenticated
                                    ? '#icon-account'
                                    : '#icon-login'
                            "
                        />
                    </svg>
                    <span>
                        {{
                            manager.isAuthenticated
                                ? manager.currentUsername
                                : "log in"
                        }}
                    </span>
                </button>
                <div
                    v-if="manager.isAuthenticated && accountMenuOpen"
                    class="account-menu"
                    role="menu"
                >
                    <div class="account-summary">
                        signed in as<strong>{{
                            manager.currentUsername
                        }}</strong>
                    </div>
                    <button
                        class="menu-item"
                        type="button"
                        role="menuitem"
                        @click="openSettings"
                    >
                        ⚙ settings
                    </button>
                    <button
                        class="account-signout"
                        type="button"
                        role="menuitem"
                        @click="signOut"
                    >
                        ← sign out
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>
