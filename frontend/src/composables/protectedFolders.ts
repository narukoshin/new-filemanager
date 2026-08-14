import type { Ref } from "vue"

import { getBackendError, type FileManagerBackend } from "../backend/contracts"
import type { FileEntry, SecurityMode } from "../types/fileManager"

interface ProtectedFoldersOptions {
    backend: Pick<
        FileManagerBackend,
        "lockFolder" | "protectFolder" | "unlockFolder"
    >
    entries: Ref<FileEntry[]>
    showToast: (message: string) => void
}

/** Owns the UI projection of backend-issued folder grants. */
export const useProtectedFolders = ({
    backend,
    entries,
    showToast,
}: ProtectedFoldersOptions) => {
    /** Merges backend-confirmed protection state into the file projection. */
    const mergeEntry = (entry: FileEntry): void => {
        const index = entries.value.findIndex(
            (candidate) => candidate.id === entry.id,
        )
        if (index !== -1) entries.value[index] = entry
    }

    /** Clears local grants after the backend session has ended. */
    const lockAll = (): void => {
        entries.value.forEach((entry) => {
            if (entry.protected) entry.unlocked = false
        })
    }

    /** Requests a folder grant from the backend. */
    const unlockFolder = async (
        entry: FileEntry | undefined,
        password: string,
    ): Promise<string | null> => {
        if (!entry) return "folder no longer exists"
        try {
            const unlocked = await backend.unlockFolder(entry.id, password)
            mergeEntry(unlocked)
            showToast(`unlocked and opened ${unlocked.name}`)
            return null
        } catch (error) {
            return getBackendError(error)
        }
    }

    /** Sends new folder protection settings to the backend. */
    const saveFolderSecurity = async (
        entry: FileEntry | undefined,
        mode: SecurityMode,
        currentPassword: string,
        newPassword: string,
        confirmation: string,
    ): Promise<string | null> => {
        if (!entry) return "folder no longer exists"
        try {
            const saved = await backend.protectFolder({
                confirmation,
                currentPassword,
                entryId: entry.id,
                mode,
                newPassword,
            })
            mergeEntry(saved)
            const action =
                mode === "protect" ? "protected" : "updated password for"
            showToast(`${action} ${saved.name}`)
            return null
        } catch (error) {
            return getBackendError(error)
        }
    }

    /** Revokes one folder grant through the backend. */
    const relockFolder = async (entry: FileEntry): Promise<void> => {
        try {
            const locked = await backend.lockFolder(entry.id)
            mergeEntry(locked)
            showToast(`locked ${locked.name}`)
        } catch (error) {
            showToast(getBackendError(error))
        }
    }

    return { lockAll, relockFolder, saveFolderSecurity, unlockFolder }
}
