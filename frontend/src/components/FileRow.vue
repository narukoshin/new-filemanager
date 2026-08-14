<script setup lang="ts">
    import { computed } from "vue"
    import type { FileManager } from "../composables/useFileManager"
    import { typeDetails } from "../composables/fileManager/presentation"
    import type { FileEntry } from "../types/fileManager"
    import { formatFileSize } from "../composables/fileManager/files"

    const { entry, manager } = defineProps<{
        entry: FileEntry
        manager: FileManager
    }>()

    const details = computed(
        () => typeDetails[entry.type] ?? typeDetails.generic,
    )
    const menuOpen = computed(() => manager.openMenuId === entry.id)

    /** Opens this row menu and politely dismisses whichever one had the stage. */
    const toggleMenu = (): void => {
        manager.openMenuId = menuOpen.value ? null : entry.id
    }

    /** Sends one menu command to the reactive controller. */
    const command = (name: string): void => {
        manager.handleEntryCommand(name, entry)
    }
</script>

<template>
    <div class="file-row" :class="details.className" role="listitem">
        <button
            class="file-open"
            type="button"
            :aria-label="`${entry.type === 'folder' ? 'Open folder' : 'Open file'} ${entry.name}`"
            @click="manager.openEntry(entry)"
        >
            <span class="name">
                <span class="icon" aria-hidden="true">
                    <svg class="pixel-icon" viewBox="0 0 16 16">
                        <use :href="`#icon-${details.icon}`" />
                    </svg>
                </span>
                <span class="filename">{{ entry.name }}</span>
                <span
                    v-if="entry.type === 'folder' && entry.protected"
                    class="protected-badge"
                    :class="{ unlocked: entry.unlocked }"
                >
                    <svg
                        class="pixel-icon"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                    >
                        <use href="#icon-lock" />
                    </svg>
                    <span>{{ entry.unlocked ? "unlocked" : "locked" }}</span>
                </span>
            </span>
        </button>

        <span class="size">{{ formatFileSize(entry.size) }}</span>
        <span class="modified">{{ entry.modified }}</span>

        <div v-if="manager.isAuthenticated" class="row-actions" @click.stop>
            <button
                class="more-button"
                type="button"
                :aria-label="`Actions for ${entry.name}`"
                aria-haspopup="menu"
                :aria-expanded="menuOpen"
                @click="toggleMenu"
            >
                …
            </button>
            <div v-if="menuOpen" class="row-menu" role="menu">
                <button
                    v-if="entry.type !== 'folder'"
                    class="menu-item"
                    type="button"
                    role="menuitem"
                    @click="command('download')"
                >
                    <span>download</span
                    ><span class="menu-symbol" aria-hidden="true">↓</span>
                </button>
                <button
                    v-if="
                        entry.type === 'folder' &&
                        entry.protected &&
                        entry.unlocked
                    "
                    class="menu-item"
                    type="button"
                    role="menuitem"
                    @click="command('relock')"
                >
                    <span>lock again</span
                    ><span class="menu-symbol" aria-hidden="true">⌁</span>
                </button>
                <button
                    v-if="
                        entry.type === 'folder' &&
                        entry.protected &&
                        !entry.unlocked
                    "
                    class="menu-item"
                    type="button"
                    role="menuitem"
                    @click="command('unlock')"
                >
                    <span>unlock</span
                    ><span class="menu-symbol" aria-hidden="true">◇</span>
                </button>
                <button
                    v-if="entry.type === 'folder'"
                    class="menu-item"
                    type="button"
                    role="menuitem"
                    @click="
                        command(entry.protected ? 'change-password' : 'protect')
                    "
                >
                    <span>{{
                        entry.protected ? "change password" : "protect folder"
                    }}</span>
                    <span class="menu-symbol" aria-hidden="true">◆</span>
                </button>
                <button
                    class="menu-item"
                    type="button"
                    role="menuitem"
                    @click="command('rename')"
                >
                    <span>rename</span
                    ><span class="menu-symbol" aria-hidden="true">↗</span>
                </button>
                <button
                    class="menu-item danger"
                    type="button"
                    role="menuitem"
                    @click="command('delete')"
                >
                    <span>delete</span
                    ><span class="menu-symbol" aria-hidden="true">×</span>
                </button>
            </div>
        </div>
    </div>
</template>
