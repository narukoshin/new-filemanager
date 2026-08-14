<script setup lang="ts">
    import type { FileManager } from "../composables/fileManager"

    defineProps<{ manager: FileManager }>()
</script>

<template>
    <div v-if="manager.uploads.length" class="upload-panel" aria-live="polite">
        <div class="upload-panel-head">
            <span>upload queue</span>
            <button
                class="upload-clear"
                type="button"
                @click="manager.clearFinishedUploads"
            >
                clear finished
            </button>
        </div>
        <div>
            <div
                v-for="job in manager.uploads"
                :key="job.id"
                class="upload-item"
                :class="{
                    complete: job.status === 'complete',
                    failed: job.status === 'failed',
                }"
            >
                <span class="upload-item-name">{{ job.name }}</span>
                <span class="upload-item-status">{{ job.statusLabel }}</span>
                <div class="upload-track">
                    <div
                        class="upload-progress"
                        :style="{ width: `${job.progress}%` }"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>
