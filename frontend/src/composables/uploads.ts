import { onUnmounted, ref, type Ref } from "vue"

import {
    getBackendError,
    type UploadProgressOptions,
} from "../backend/contracts"
import type { UploadJob } from "../types/fileManager"

interface UploadOptions {
    addUploadedFile: (file: File, parentId: number | null) => Promise<void>
    currentFolderId: Ref<number | null>
    isAuthenticated: Ref<boolean>
    maxUploadMegabytes: () => number
    requestLogin: () => void
    showToast: (message: string) => void
    startUploadProgress: (options: UploadProgressOptions) => () => void
}

/** Owns upload-job presentation while the backend drives transfer progress. */
export const useUploads = ({
    addUploadedFile,
    currentFolderId,
    isAuthenticated,
    maxUploadMegabytes,
    requestLogin,
    showToast,
    startUploadProgress,
}: UploadOptions) => {
    const uploads = ref<UploadJob[]>([])
    const cancelUploads = new Set<() => void>()
    let nextUploadId = 1

    /** Commits one completed upload and marks its queue item complete. */
    const finishUpload = async (
        file: File,
        job: UploadJob,
        parentId: number | null,
    ): Promise<void> => {
        try {
            await addUploadedFile(file, parentId)
            job.progress = 100
            job.status = "complete"
            job.statusLabel = "done"
        } catch (error) {
            job.status = "failed"
            job.statusLabel = "failed"
            showToast(getBackendError(error))
        }
    }

    /** Delegates transfer progress to the selected backend implementation. */
    const queueUpload = (file: File, parentId: number | null): void => {
        const job: UploadJob = {
            id: nextUploadId++,
            name: file.name,
            progress: 0,
            status: "uploading",
            statusLabel: "0%",
        }
        uploads.value.push(job)

        if (file.size > maxUploadMegabytes() * 1_000_000) {
            job.progress = 100
            job.status = "failed"
            job.statusLabel = "too large"
            return
        }

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches
        let cancel = (): void => undefined
        cancel = startUploadProgress({
            onComplete: () => {
                cancelUploads.delete(cancel)
                void finishUpload(file, job, parentId)
            },
            onProgress: (progress) => {
                job.progress = progress
                job.statusLabel = `${job.progress}%`
            },
            reducedMotion,
        })
        cancelUploads.add(cancel)
    }

    /** Queues selected or dropped files for the currently active folder. */
    const handleUploads = (files: File[]): void => {
        if (!files.length) return
        if (!isAuthenticated.value) {
            showToast("log in before uploading files")
            requestLogin()
            return
        }

        const parentId = currentFolderId.value
        files.forEach((file) => queueUpload(file, parentId))
        showToast(
            `queued ${files.length} ${files.length === 1 ? "file" : "files"}`,
        )
    }

    /** Clears jobs that are no longer moving. */
    const clearFinishedUploads = (): void => {
        uploads.value = uploads.value.filter(
            (job) => job.status === "uploading",
        )
    }

    onUnmounted(() => {
        cancelUploads.forEach((cancel) => cancel())
    })

    return { clearFinishedUploads, handleUploads, uploads }
}
