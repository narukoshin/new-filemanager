<script setup lang="ts">
    import { onMounted, onUnmounted, ref } from "vue"
    import type { FileManager } from "../composables/useFileManager"
    import type { SortKey } from "../types/fileManager"
    import FileRow from "./FileRow.vue"
    import UploadQueue from "./UploadQueue.vue"

    const { manager } = defineProps<{ manager: FileManager }>()
    const filePicker = ref<HTMLInputElement | null>(null)
    const searchInput = ref<HTMLInputElement | null>(null)
    let dragDepth = 0

    /** Returns the ARIA sort state for one column. */
    const ariaSort = (key: SortKey): "ascending" | "descending" | "none" => {
        if (manager.sortKey !== key) return "none"
        return manager.sortDirection === "asc" ? "ascending" : "descending"
    }

    /** Describes and decorates the currently selected sort control. */
    const sortIndicator = (key: SortKey): string => {
        if (manager.sortKey !== key) return ""
        return manager.sortDirection === "asc" ? "↑" : "↓"
    }

    /** Passes native picker files into the reactive upload queue. */
    const handlePickedFiles = (): void => {
        manager.handleUploads([...(filePicker.value?.files ?? [])])
        if (filePicker.value) filePicker.value.value = ""
    }

    /** Reveals the drop target only for actual file drags. */
    const handleDragEnter = (event: DragEvent): void => {
        if (!event.dataTransfer?.types.includes("Files")) return
        event.preventDefault()
        dragDepth += 1
        manager.dragActive = true
    }

    /** Advertises whether the current session may accept this drop. */
    const handleDragOver = (event: DragEvent): void => {
        if (!event.dataTransfer?.types.includes("Files")) return
        event.preventDefault()
        event.dataTransfer.dropEffect = manager.isAuthenticated
            ? "copy"
            : "none"
    }

    /** Hides the drop target after the final nested drag leaves. */
    const handleDragLeave = (event: DragEvent): void => {
        event.preventDefault()
        dragDepth = Math.max(0, dragDepth - 1)
        if (dragDepth === 0) manager.dragActive = false
    }

    /** Queues dropped files and resets the drag bookkeeping. */
    const handleDrop = (event: DragEvent): void => {
        event.preventDefault()
        dragDepth = 0
        manager.dragActive = false
        manager.handleUploads([...(event.dataTransfer?.files ?? [])])
    }

    /** Prevents a cancelled drag from leaving its rather dramatic veil behind. */
    const resetDrag = (): void => {
        dragDepth = 0
        manager.dragActive = false
    }

    /** Keeps file-browser shortcuts close to the component that owns them. */
    const handleShortcut = (event: KeyboardEvent): void => {
        const isTyping = /input|textarea|select/i.test(
            document.activeElement?.tagName ?? "",
        )
        if (event.key === "Escape") manager.openMenuId = null

        if (event.key === "/" && !isTyping && !manager.dialog.kind) {
            event.preventDefault()
            searchInput.value?.focus()
        }

        if (
            event.key === "Escape" &&
            document.activeElement === searchInput.value
        ) {
            manager.searchQuery = ""
            searchInput.value?.blur()
        }

        if (event.altKey && event.key === "ArrowLeft" && !manager.dialog.kind) {
            event.preventDefault()
            manager.navigateBack()
        }
    }

    onMounted(() => {
        document.addEventListener("keydown", handleShortcut)
        window.addEventListener("dragend", resetDrag)
    })

    onUnmounted(() => {
        document.removeEventListener("keydown", handleShortcut)
        window.removeEventListener("dragend", resetDrag)
    })
</script>

<template>
    <section class="hero">
        <p class="eyebrow">node 01 · ~/archive</p>
        <h1>
            <span class="title-prefix">#</span>file<span class="accent">.</span
            >manager
        </h1>
        <p class="intro">{{ manager.siteSettings.intro }}</p>
    </section>

    <section
        id="file-browser"
        class="file-browser"
        aria-label="File browser"
        tabindex="-1"
        @click="manager.openMenuId = null"
        @dragenter="handleDragEnter"
        @dragover="handleDragOver"
        @dragleave="handleDragLeave"
        @drop="handleDrop"
    >
        <div class="toolbar">
            <nav class="path" aria-label="Current folder">
                <button
                    class="back-button"
                    type="button"
                    aria-label="Go to parent folder"
                    :disabled="manager.currentFolderId === null"
                    @click="manager.navigateBack"
                >
                    ←
                </button>
                <span class="path-prefix"
                    >{{ manager.currentUsername }}@wold:</span
                >
                <span class="breadcrumbs">
                    <template
                        v-for="(crumb, index) in manager.breadcrumbs"
                        :key="crumb.id ?? 'root'"
                    >
                        <span
                            v-if="index > 0"
                            class="breadcrumb-separator"
                            aria-hidden="true"
                            >/</span
                        >
                        <button
                            class="breadcrumb"
                            type="button"
                            :aria-current="
                                index === manager.breadcrumbs.length - 1
                                    ? 'page'
                                    : undefined
                            "
                            @click="manager.navigateTo(crumb.id)"
                        >
                            {{ crumb.name }}
                        </button>
                    </template>
                </span>
            </nav>

            <div class="tools">
                <label class="search">
                    <span class="search-icon" aria-hidden="true">
                        <svg class="pixel-icon" viewBox="0 0 16 16">
                            <use href="#icon-search" />
                        </svg>
                    </span>
                    <input
                        ref="searchInput"
                        v-model="manager.searchQuery"
                        class="search-input"
                        type="search"
                        placeholder="search files"
                        aria-label="Search files"
                        autocomplete="off"
                    />
                    <span class="search-key" aria-hidden="true">/</span>
                </label>

                <div class="actions">
                    <button
                        class="action"
                        type="button"
                        aria-label="New folder"
                        :disabled="!manager.isAuthenticated"
                        :title="
                            manager.isAuthenticated
                                ? 'Create a folder'
                                : 'Log in to create folders'
                        "
                        @click="
                            manager.openDialog('name', { nameMode: 'create' })
                        "
                    >
                        <svg
                            class="pixel-icon"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                        >
                            <use href="#icon-new-folder" />
                        </svg>
                        <span class="label">folder</span>
                    </button>
                    <button
                        class="action primary"
                        type="button"
                        aria-label="Upload file"
                        :disabled="!manager.isAuthenticated"
                        :title="
                            manager.isAuthenticated
                                ? 'Upload files'
                                : 'Log in to upload files'
                        "
                        @click="filePicker?.click()"
                    >
                        <svg
                            class="pixel-icon"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                        >
                            <use href="#icon-upload" />
                        </svg>
                        <span class="label">upload</span>
                    </button>
                    <input
                        ref="filePicker"
                        type="file"
                        multiple
                        hidden
                        @change="handlePickedFiles"
                    />
                </div>
            </div>
        </div>

        <UploadQueue :manager="manager" />

        <div class="file-head" role="row">
            <span role="columnheader" :aria-sort="ariaSort('name')">
                <button
                    class="sort-button"
                    type="button"
                    :aria-pressed="manager.sortKey === 'name'"
                    @click="manager.setSort('name')"
                >
                    name<span class="sort-indicator" aria-hidden="true">{{
                        sortIndicator("name")
                    }}</span>
                </button>
            </span>
            <span role="columnheader" :aria-sort="ariaSort('size')">
                <button
                    class="sort-button"
                    type="button"
                    :aria-pressed="manager.sortKey === 'size'"
                    @click="manager.setSort('size')"
                >
                    size<span class="sort-indicator" aria-hidden="true">{{
                        sortIndicator("size")
                    }}</span>
                </button>
            </span>
            <span role="columnheader" :aria-sort="ariaSort('modified')">
                <button
                    class="sort-button"
                    type="button"
                    :aria-pressed="manager.sortKey === 'modified'"
                    @click="manager.setSort('modified')"
                >
                    modified<span class="sort-indicator" aria-hidden="true">{{
                        sortIndicator("modified")
                    }}</span>
                </button>
            </span>
            <span v-if="manager.isAuthenticated">actions</span>
        </div>

        <div class="file-list" role="list" aria-label="Files and folders">
            <FileRow
                v-for="entry in manager.visibleEntries"
                :key="entry.id"
                :entry="entry"
                :manager="manager"
            />
            <div
                v-if="!manager.visibleEntries.length"
                class="empty-state"
                role="status"
            >
                <span>{{ manager.emptyMessage }}</span>
            </div>
        </div>

        <div v-if="manager.dragActive" class="drop-overlay">
            <div class="drop-message">
                <svg class="pixel-icon" viewBox="0 0 16 16" aria-hidden="true">
                    <use href="#icon-upload" />
                </svg>
                <span>
                    {{
                        manager.isAuthenticated
                            ? "drop files into this folder"
                            : "log in to upload these files"
                    }}
                </span>
            </div>
        </div>
    </section>

    <footer class="footer">
        <span class="footer-command" aria-live="polite">
            <span>{{ manager.visibleEntries.length }}</span>
            <span>{{
                manager.visibleEntries.length === 1 ? "entry" : "entries"
            }}</span>
            <span aria-hidden="true">/</span>
            <span>{{ manager.visibleSize }}</span>
        </span>
        <span
            >ÞERXWOLD // {{ manager.siteSettings.nodeName.toUpperCase() }}</span
        >
    </footer>
</template>
