<script setup lang="ts">
    import type { FileManager } from "../composables/useFileManager"
    import type { ManagedUser } from "../types/fileManager"

    const { manager } = defineProps<{ manager: FileManager }>()

    /** Opens the owner account panel or the selected managed-user dialog. */
    const editUser = (user: ManagedUser): void => {
        if (user.id === 1) {
            manager.settingsPanel = "account"
            return
        }

        manager.openDialog("user", { userId: user.id })
    }
</script>

<template>
    <div class="users-list">
        <div v-for="user in manager.users" :key="user.id" class="user-row">
            <span class="user-name">
                {{ user.username }}
                <small v-if="user.id === 1">current account</small>
            </span>
            <span class="user-role">{{ user.role }}</span>
            <span class="user-activity">{{ user.activity }}</span>
            <span class="user-actions">
                <button
                    class="micro-button"
                    type="button"
                    @click="editUser(user)"
                >
                    {{ user.id === 1 ? "account" : "edit" }}
                </button>
                <button
                    class="micro-button danger"
                    type="button"
                    :disabled="user.id === 1"
                    :title="
                        user.id === 1
                            ? 'The owner cannot be removed'
                            : `Remove ${user.username}`
                    "
                    @click="manager.removeUser(user)"
                >
                    {{
                        manager.confirmingUserId === user.id
                            ? "confirm?"
                            : "remove"
                    }}
                </button>
            </span>
        </div>
    </div>
</template>
