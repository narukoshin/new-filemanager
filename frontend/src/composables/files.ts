import { computed, ref, type Ref } from "vue"

import { getBackendError, type FileManagerBackend } from "../backend/contracts"
import type {
    FileEntry,
    NameMode,
    SortDirection,
    SortKey,
} from "../types/fileManager"
import { formatFileSize, sortEntries } from "../utils/fileEntries"

interface FilesOptions {
    backend: Pick<
        FileManagerBackend,
        | "createFolder"
        | "deleteEntry"
        | "downloadEntry"
        | "renameEntry"
        | "uploadFile"
    >
    currentFolderId: Ref<number | null>
    searchQuery: Ref<string>
    showToast: (message: string) => void
}

interface DownloadAccess {
    authenticated: boolean
    publicDownloads: boolean
}

interface SaveNameInput {
    entryId: number | null
    mode: NameMode
    name: string
    parentId: number | null
}

/** Owns the reactive file projection; persistence belongs to the backend. */
export const useFiles = ({
    backend,
    currentFolderId,
    searchQuery,
    showToast,
}: FilesOptions) => {
    const entries = ref<FileEntry[]>([])
    const sortKey = ref<SortKey>("name")
    const sortDirection = ref<SortDirection>("asc")

    /** Entries filtered and sorted for the active folder. */
    const visibleEntries = computed(() => {
        const query = searchQuery.value.trim().toLowerCase()
        const matches = entries.value.filter(
            (entry) =>
                entry.parentId === currentFolderId.value &&
                entry.name.toLowerCase().includes(query),
        )
        return sortEntries(matches, sortKey.value, sortDirection.value)
    })

    const visibleSize = computed(() =>
        formatFileSize(
            visibleEntries.value.reduce(
                (total, entry) => total + entry.size,
                0,
            ),
        ).replace("—", "0 b"),
    )

    const emptyMessage = computed(() =>
        searchQuery.value.trim()
            ? `no files matching “${searchQuery.value.trim()}”`
            : "this folder is empty",
    )

    /** Replaces the file projection with a freshly loaded backend snapshot. */
    const hydrate = (snapshot: FileEntry[]): void => {
        entries.value = snapshot
    }

    /** Merges one backend-confirmed entry into the reactive projection. */
    const mergeEntry = (entry: FileEntry): void => {
        const index = entries.value.findIndex(
            (candidate) => candidate.id === entry.id,
        )
        if (index === -1) entries.value.push(entry)
        else entries.value[index] = entry
    }

    /** Changes the active sort or reverses its current direction. */
    const setSort = (key: SortKey): void => {
        if (sortKey.value === key) {
            sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc"
            return
        }
        sortKey.value = key
        sortDirection.value = key === "modified" ? "desc" : "asc"
    }

    /** Applies a saved default sort with its most useful initial direction. */
    const setDefaultSort = (key: SortKey): void => {
        sortKey.value = key
        sortDirection.value = key === "modified" ? "desc" : "asc"
    }

    /** Requests a download resource, then lets the browser save it. */
    const downloadEntry = async (
        entry: FileEntry,
        access: DownloadAccess,
    ): Promise<void> => {
        if (!access.authenticated && !access.publicDownloads) {
            showToast("public downloads are disabled · log in to continue")
            return
        }
        try {
            const resource = await backend.downloadEntry(entry.id)
            const link = document.createElement("a")
            link.href = resource.source
            link.download = resource.filename
            link.click()
            if (resource.disposable)
                setTimeout(() => URL.revokeObjectURL(resource.source), 0)
            showToast(`downloading ${resource.filename}`)
        } catch (error) {
            showToast(getBackendError(error))
        }
    }

    /** Sends create or rename to the backend and merges its confirmed result. */
    const saveName = async ({
        entryId,
        mode,
        name,
        parentId,
    }: SaveNameInput): Promise<string | null> => {
        try {
            const oldName = entries.value.find(
                (entry) => entry.id === entryId,
            )?.name
            const entry =
                mode === "rename" && entryId !== null
                    ? await backend.renameEntry(entryId, name)
                    : await backend.createFolder(parentId, name)
            mergeEntry(entry)
            showToast(
                mode === "rename"
                    ? `renamed ${oldName ?? "item"} to ${entry.name}`
                    : `created folder ${entry.name}`,
            )
            return null
        } catch (error) {
            return getBackendError(error)
        }
    }

    /** Deletes through the backend, then removes its local tree projection. */
    const deleteEntry = async (entryId: number): Promise<boolean> => {
        try {
            const deleted = await backend.deleteEntry(entryId)
            const descendantIds = new Set([deleted.id])
            let changed = true
            while (changed) {
                changed = false
                entries.value.forEach((entry) => {
                    if (
                        entry.parentId !== null &&
                        descendantIds.has(entry.parentId) &&
                        !descendantIds.has(entry.id)
                    ) {
                        descendantIds.add(entry.id)
                        changed = true
                    }
                })
            }
            entries.value = entries.value.filter(
                (entry) => !descendantIds.has(entry.id),
            )
            showToast(`deleted ${deleted.name}`)
            return true
        } catch (error) {
            showToast(getBackendError(error))
            return false
        }
    }

    /** Uploads through the backend and merges the resulting file metadata. */
    const addUploadedFile = async (
        file: File,
        parentId: number | null,
    ): Promise<void> => {
        const entry = await backend.uploadFile(file, parentId)
        mergeEntry(entry)
    }

    return {
        addUploadedFile,
        deleteEntry,
        downloadEntry,
        emptyMessage,
        entries,
        hydrate,
        mergeEntry,
        saveName,
        setDefaultSort,
        setSort,
        sortDirection,
        sortKey,
        visibleEntries,
        visibleSize,
    }
}
