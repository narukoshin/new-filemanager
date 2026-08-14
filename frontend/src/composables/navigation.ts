import { computed, ref, type Ref } from "vue"

import type { AppView, FileEntry, SettingsPanel } from "../types/fileManager"
import { getFolderTrail } from "../utils/fileEntries"

interface NavigationOptions {
    currentFolderId: Ref<number | null>
    entries: Ref<FileEntry[]>
    onLockedFolder: (entry: FileEntry) => void
    searchQuery: Ref<string>
}

const rootBreadcrumb = { id: null, name: "~/uploads" }

/** Owns browser location and the small amount of view state around it. */
export const useNavigation = ({
    currentFolderId,
    entries,
    onLockedFolder,
    searchQuery,
}: NavigationOptions) => {
    const view = ref<AppView>("browser")
    const settingsPanel = ref<SettingsPanel>("account")
    const openMenuId = ref<number | null>(null)
    const dragActive = ref(false)

    /** Builds a stable root-to-current-folder trail for the breadcrumb bar. */
    const breadcrumbs = computed(() => [
        rootBreadcrumb,
        ...getFolderTrail(entries.value, currentFolderId.value).map(
            (entry) => ({
                id: entry.id,
                name: entry.name,
            }),
        ),
    ])

    /** Returns to the top without tormenting motion-sensitive visitors. */
    const scrollToTop = (): void => {
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches
        window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })
    }

    /** Opens settings when the caller has already verified the session. */
    const showSettings = (): void => {
        openMenuId.value = null
        view.value = "settings"
        scrollToTop()
    }

    /** Returns to files without disturbing the active folder. */
    const showBrowser = (): void => {
        view.value = "browser"
        scrollToTop()
    }

    /** Navigates only after a protected folder has granted access. */
    const navigateTo = (folderId: number | null): void => {
        if (folderId !== null) {
            const folder = entries.value.find(
                (entry) => entry.id === folderId && entry.type === "folder",
            )
            if (!folder) return
            if (folder.protected && !folder.unlocked) {
                onLockedFolder(folder)
                return
            }
        }

        currentFolderId.value = folderId
        searchQuery.value = ""
        openMenuId.value = null
    }

    /** Moves to the parent of the current folder. */
    const navigateBack = (): void => {
        if (currentFolderId.value === null) return
        const current = entries.value.find(
            (entry) => entry.id === currentFolderId.value,
        )
        navigateTo(current?.parentId ?? null)
    }

    /** Escapes a protected branch after its temporary grants are revoked. */
    const leaveProtectedPath = (): void => {
        const protectedPath = getFolderTrail(
            entries.value,
            currentFolderId.value,
        ).some((folder) => folder.protected)
        if (protectedPath) currentFolderId.value = null
    }

    return {
        breadcrumbs,
        dragActive,
        leaveProtectedPath,
        navigateBack,
        navigateTo,
        openMenuId,
        settingsPanel,
        showBrowser,
        showSettings,
        view,
    }
}
