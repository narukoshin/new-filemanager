import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue"

import { createMockEntries, createMockUsers } from "../data/mockFileManager"
import type {
    DialogState,
    FileEntry,
    ManagedUser,
    NameMode,
    SecurityMode,
    SecuritySettings,
    SettingsPanel,
    SiteSettings,
    SortKey,
    UploadJob,
    UserRole,
} from "../types/fileManager"
import {
    formatFileSize,
    getEntryType,
    getFolderTrail,
    getUniqueEntryName,
    sortEntries,
} from "./fileManager/files"

interface AccountInput {
    confirmPassword: string
    currentPassword: string
    newPassword: string
    username: string
}

interface UserInput {
    password: string
    role: UserRole
    username: string
}

const rootBreadcrumb = { id: null, name: "~/uploads" }

/**
 * Owns the reactive frontend prototype while the Go API is still backstage.
 * Components render this state; they are no longer puppets pulled by selectors.
 */
export const useFileManager = () => {
    const entries = ref<FileEntry[]>(createMockEntries())
    const users = ref<ManagedUser[]>(createMockUsers())
    const uploads = ref<UploadJob[]>([])
    const isAuthenticated = ref(false)
    const currentUsername = ref("naru")
    const currentFolderId = ref<number | null>(null)
    const searchQuery = ref("")
    const sortKey = ref<SortKey>("name")
    const sortDirection = ref<"asc" | "desc">("asc")
    const view = ref<"browser" | "settings">("browser")
    const settingsPanel = ref<SettingsPanel>("account")
    const openMenuId = ref<number | null>(null)
    const dragActive = ref(false)
    const confirmingUserId = ref<number | null>(null)
    const toastMessage = ref("")
    const dialog = reactive<DialogState>({
        entryId: null,
        kind: null,
        nameMode: "rename",
        securityMode: "protect",
        userId: null,
    })
    const siteSettings = reactive<SiteSettings>({
        defaultSort: "name",
        filePreviews: true,
        intro: "a quiet place for files, builds and things worth keeping around.",
        label: "files",
        maxUploadMegabytes: 25,
        nodeName: "FILE NODE 01",
        publicDownloads: true,
    })
    const securitySettings = reactive<SecuritySettings>({
        auditLog: true,
        folderProtection: true,
        loginLimit: 5,
        sessionLifetime: 8,
    })

    let nextEntryId = 11,
        nextUploadId = 1,
        nextUserId = 4,
        toastTimer: ReturnType<typeof setTimeout> | undefined,
        userConfirmationTimer: ReturnType<typeof setTimeout> | undefined

    const uploadTimers = new Set<ReturnType<typeof setInterval>>()

    /** The entry currently addressed by a dialog, if it has not vanished. */
    const activeEntry = computed(() =>
        entries.value.find((entry) => entry.id === dialog.entryId),
    )

    /** The managed identity currently being edited. */
    const activeUser = computed(() =>
        users.value.find((user) => user.id === dialog.userId),
    )

    /** A stable root-to-current-folder trail for declarative breadcrumbs. */
    const breadcrumbs = computed(() => [
        rootBreadcrumb,
        ...getFolderTrail(entries.value, currentFolderId.value).map(
            (entry) => ({
                id: entry.id,
                name: entry.name,
            }),
        ),
    ])

    /** Entries filtered and sorted for the active folder. Vue handles the rest. */
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

    const statusLabel = computed(() => {
        if (view.value === "settings") return "admin console"
        return isAuthenticated.value ? "private access" : "public node"
    })

    const brandLabel = computed(() =>
        view.value === "settings" ? "settings" : siteSettings.label,
    )

    /** Shows a plain-text notice and retires the previous one politely. */
    const showToast = (message: string): void => {
        clearTimeout(toastTimer)
        toastMessage.value = message
        toastTimer = setTimeout(() => {
            toastMessage.value = ""
        }, 2600)
    }

    /** Opens one dialog with its optional entry or user target. */
    const openDialog = (
        kind: DialogState["kind"],
        options: {
            entryId?: number | null
            nameMode?: NameMode
            securityMode?: SecurityMode
            userId?: number | null
        } = {},
    ): void => {
        dialog.entryId = options.entryId ?? null
        dialog.nameMode = options.nameMode ?? "rename"
        dialog.securityMode = options.securityMode ?? "protect"
        dialog.userId = options.userId ?? null
        dialog.kind = kind
    }

    /** Closes the active modal and forgets its targets. */
    const closeDialog = (): void => {
        dialog.kind = null
        dialog.entryId = null
        dialog.userId = null
    }

    /** Updates the mock session and seals protected folders on sign-out. */
    const setAuthenticated = (value: boolean, username = "naru"): void => {
        isAuthenticated.value = value

        if (value) {
            currentUsername.value = username
            if (users.value[0]) users.value[0].username = username
        } else {
            entries.value.forEach((entry) => {
                if (entry.protected) entry.unlocked = false
            })

            const insideProtectedFolder = getFolderTrail(
                entries.value,
                currentFolderId.value,
            ).some((folder) => folder.protected)
            if (insideProtectedFolder) currentFolderId.value = null
            view.value = "browser"
        }

        openMenuId.value = null
    }

    /** Accepts the prototype login; the real backend will verify it soon enough. */
    const login = (username: string): void => {
        const normalized = username.trim()
        if (!normalized) return
        setAuthenticated(true, normalized)
        closeDialog()
        showToast(`welcome back, ${normalized}`)
    }

    /** Ends the mock session and returns to the public file browser. */
    const logout = (): void => {
        setAuthenticated(false)
        showToast("signed out · file actions locked")
    }

    /** Returns to the top without forcing animation on motion-sensitive visitors. */
    const scrollToTop = (): void => {
        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches
        window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })
    }

    /** Enters the administrative view when the current session may do so. */
    const showSettings = (): void => {
        if (!isAuthenticated.value) return
        openMenuId.value = null
        view.value = "settings"
        scrollToTop()
    }

    /** Returns to files without disturbing the active folder. */
    const showBrowser = (): void => {
        view.value = "browser"
        scrollToTop()
    }

    /** Navigates only after a protected folder has granted this session access. */
    const navigateTo = (folderId: number | null): void => {
        if (folderId !== null) {
            const folder = entries.value.find(
                (entry) => entry.id === folderId && entry.type === "folder",
            )
            if (!folder) return
            if (folder.protected && !folder.unlocked) {
                openDialog("unlock", { entryId: folder.id })
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

    /** Opens a folder or previews a file according to its type. */
    const openEntry = (entry: FileEntry): void => {
        if (entry.type === "folder") navigateTo(entry.id)
        else if (siteSettings.filePreviews)
            openDialog("preview", { entryId: entry.id })
        else downloadEntry(entry)
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

    /** Uses the browser download primitive after checking public access. */
    const downloadEntry = (entry: FileEntry): void => {
        if (!isAuthenticated.value && !siteSettings.publicDownloads) {
            showToast("public downloads are disabled · log in to continue")
            return
        }

        const disposable = !entry.objectUrl
        const source =
            entry.objectUrl ??
            URL.createObjectURL(
                new Blob(
                    [entry.content ?? `Frontend preview for ${entry.name}\n`],
                    {
                        type:
                            entry.type === "text"
                                ? "text/plain"
                                : "application/octet-stream",
                    },
                ),
            )
        const link = document.createElement("a")
        link.href = source
        link.download = entry.name
        link.click()
        if (disposable) setTimeout(() => URL.revokeObjectURL(source), 0)
        showToast(`downloading ${entry.name}`)
    }

    /** Verifies and unlocks the folder targeted by the active dialog. */
    const unlockFolder = (password: string): string | null => {
        const entry = activeEntry.value
        if (!entry) return "folder no longer exists"
        if (password !== entry.password) return "incorrect password · try again"

        entry.unlocked = true
        closeDialog()
        navigateTo(entry.id)
        showToast(`unlocked and opened ${entry.name}`)
        return null
    }

    /** Protects a folder or rotates its temporary frontend password. */
    const saveFolderSecurity = (
        currentPassword: string,
        newPassword: string,
        confirmation: string,
    ): string | null => {
        const entry = activeEntry.value
        if (!entry) return "folder no longer exists"
        if (
            dialog.securityMode === "change" &&
            currentPassword !== entry.password
        )
            return "the current password is incorrect"
        if (newPassword !== confirmation) return "new passwords do not match"

        const action =
            dialog.securityMode === "protect"
                ? "protected"
                : "updated password for"
        entry.protected = true
        entry.password = newPassword
        entry.unlocked = true
        closeDialog()
        showToast(`${action} ${entry.name}`)
        return null
    }

    /** Creates or renames an entry after checking sibling uniqueness. */
    const saveName = (name: string): string | null => {
        const value = name.trim()
        const entry = activeEntry.value
        const targetParentId =
            dialog.nameMode === "rename"
                ? (entry?.parentId ?? null)
                : currentFolderId.value
        const duplicate = entries.value.some(
            (candidate) =>
                candidate.parentId === targetParentId &&
                candidate.name.toLowerCase() === value.toLowerCase() &&
                candidate.id !== dialog.entryId,
        )
        if (duplicate) return "an item with this name already exists"

        if (dialog.nameMode === "rename") {
            if (!entry) return "item no longer exists"
            const oldName = entry.name
            entry.name = value
            entry.type =
                entry.type === "folder" ? "folder" : getEntryType(value)
            entry.modified = "just now"
            entry.modifiedAt = Date.now()
            showToast(`renamed ${oldName} to ${value}`)
        } else {
            entries.value.unshift({
                id: nextEntryId++,
                parentId: currentFolderId.value,
                name: value,
                type: "folder",
                size: 0,
                modified: "just now",
                modifiedAt: Date.now(),
            })
            showToast(`created folder ${value}`)
        }

        closeDialog()
        return null
    }

    /** Deletes an entry, all descendants, and any browser-owned object URLs. */
    const deleteEntry = (): void => {
        const entry = activeEntry.value
        if (!entry) return

        const descendantIds = new Set([entry.id])
        let changed = true
        while (changed) {
            changed = false
            entries.value.forEach((candidate) => {
                if (
                    candidate.parentId !== null &&
                    descendantIds.has(candidate.parentId) &&
                    !descendantIds.has(candidate.id)
                ) {
                    descendantIds.add(candidate.id)
                    changed = true
                }
            })
        }

        entries.value = entries.value.filter((candidate) => {
            const deleting = descendantIds.has(candidate.id)
            if (deleting && candidate.objectUrl)
                URL.revokeObjectURL(candidate.objectUrl)
            return !deleting
        })
        closeDialog()
        showToast(`deleted ${entry.name}`)
    }

    /** Dispatches a row action after the authentication courtesy check. */
    const handleEntryCommand = (command: string, entry: FileEntry): void => {
        openMenuId.value = null
        if (!isAuthenticated.value) return

        if (command === "download") downloadEntry(entry)
        else if (command === "rename")
            openDialog("name", { entryId: entry.id, nameMode: "rename" })
        else if (command === "unlock")
            openDialog("unlock", { entryId: entry.id })
        else if (command === "relock") {
            entry.unlocked = false
            showToast(`locked ${entry.name}`)
        } else if (command === "protect")
            openDialog("security", {
                entryId: entry.id,
                securityMode: "protect",
            })
        else if (command === "change-password")
            openDialog("security", {
                entryId: entry.id,
                securityMode: "change",
            })
        else if (command === "delete")
            openDialog("delete", { entryId: entry.id })
    }

    /** Commits one completed simulated upload to reactive entry state. */
    const finishUpload = async (
        file: File,
        job: UploadJob,
        parentId: number | null,
    ): Promise<void> => {
        const type = getEntryType(file.name)
        const entry: FileEntry = {
            id: nextEntryId++,
            parentId,
            name: getUniqueEntryName(entries.value, file.name, parentId),
            type,
            size: file.size,
            modified: "just now",
            modifiedAt: Date.now(),
            objectUrl: URL.createObjectURL(file),
        }
        if (type === "text") entry.content = await file.text()
        entries.value.push(entry)
        job.progress = 100
        job.status = "complete"
        job.statusLabel = "done"
    }

    /** Simulates progress without constructing any DOM nodes by hand. */
    const queueUpload = (file: File, parentId: number | null): void => {
        const job = reactive<UploadJob>({
            id: nextUploadId++,
            name: file.name,
            progress: 0,
            status: "uploading",
            statusLabel: "0%",
        })
        uploads.value.push(job)

        if (file.size > siteSettings.maxUploadMegabytes * 1_000_000) {
            job.progress = 100
            job.status = "failed"
            job.statusLabel = "too large"
            return
        }

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
        ).matches
        const timer = setInterval(
            () => {
                job.progress = reducedMotion
                    ? 100
                    : Math.min(
                          100,
                          job.progress + Math.ceil(Math.random() * 17),
                      )
                job.statusLabel = `${job.progress}%`
                if (job.progress < 100) return

                clearInterval(timer)
                uploadTimers.delete(timer)
                void finishUpload(file, job, parentId)
            },
            reducedMotion ? 20 : 90,
        )
        uploadTimers.add(timer)
    }

    /** Queues selected or dropped files for the folder active at that moment. */
    const handleUploads = (files: File[]): void => {
        if (!files.length) return
        if (!isAuthenticated.value) {
            showToast("log in before uploading files")
            openDialog("login")
            return
        }

        const parentId = currentFolderId.value
        files.forEach((file) => queueUpload(file, parentId))
        showToast(
            `queued ${files.length} ${files.length === 1 ? "file" : "files"}`,
        )
    }

    /** Clears upload jobs that are no longer moving. */
    const clearFinishedUploads = (): void => {
        uploads.value = uploads.value.filter(
            (job) => job.status === "uploading",
        )
    }

    /** Updates account details after frontend-only validation. */
    const saveAccount = (input: AccountInput): string | null => {
        const username = input.username.trim()
        const duplicate = users.value.some(
            (user) =>
                user.id !== 1 &&
                user.username.toLowerCase() === username.toLowerCase(),
        )
        if (duplicate) return "choose a unique username"

        const changingPassword = Boolean(
            input.currentPassword || input.newPassword || input.confirmPassword,
        )
        if (changingPassword && !input.currentPassword)
            return "enter your current password before choosing a new one"
        if (changingPassword && !input.newPassword)
            return "enter a new password or clear the password fields"
        if (changingPassword && input.newPassword !== input.confirmPassword)
            return "new passwords do not match"

        currentUsername.value = username
        if (users.value[0]) users.value[0].username = username
        showToast(
            changingPassword
                ? "account and password updated"
                : "account updated",
        )
        return null
    }

    /** Creates or updates a managed user in temporary state. */
    const saveUser = (input: UserInput): string | null => {
        const username = input.username.trim()
        const duplicate = users.value.some(
            (user) =>
                user.id !== dialog.userId &&
                user.username.toLowerCase() === username.toLowerCase(),
        )
        if (duplicate) return "choose a unique username"

        if (dialog.userId === null) {
            users.value.push({
                id: nextUserId++,
                username,
                role: input.role,
                activity: "invited just now",
            })
            showToast(`created user ${username}`)
        } else {
            const user = activeUser.value
            if (!user) return "user no longer exists"
            user.username = username
            user.role = input.role
            showToast(
                `updated user ${username}${input.password ? " and rotated their password" : ""}`,
            )
        }

        closeDialog()
        return null
    }

    /** Requires a deliberate second click before removing a managed user. */
    const removeUser = (user: ManagedUser): void => {
        if (user.id === 1) return
        if (confirmingUserId.value !== user.id) {
            clearTimeout(userConfirmationTimer)
            confirmingUserId.value = user.id
            userConfirmationTimer = setTimeout(() => {
                confirmingUserId.value = null
            }, 2600)
            return
        }

        users.value = users.value.filter(
            (candidate) => candidate.id !== user.id,
        )
        confirmingUserId.value = null
        showToast(`removed user ${user.username}`)
    }

    /** Persists site form values into the reactive preview. */
    const saveSiteSettings = (settings: SiteSettings): void => {
        Object.assign(siteSettings, settings)
        sortKey.value = settings.defaultSort
        sortDirection.value =
            settings.defaultSort === "modified" ? "desc" : "asc"
        showToast("site settings saved")
    }

    /** Persists the security form in the frontend preview. */
    const saveSecuritySettings = (settings: SecuritySettings): void => {
        Object.assign(securitySettings, settings)
        showToast("security policy saved")
    }

    watch(
        isAuthenticated,
        (value) => {
            document.body.dataset.auth = String(value)
        },
        { immediate: true },
    )

    onMounted(() => setAuthenticated(false))

    onUnmounted(() => {
        clearTimeout(toastTimer)
        clearTimeout(userConfirmationTimer)
        uploadTimers.forEach((timer) => clearInterval(timer))
        entries.value.forEach((entry) => {
            if (entry.objectUrl) URL.revokeObjectURL(entry.objectUrl)
        })
    })

    // One proxy gives templates pleasant values while methods retain their refs.
    return reactive({
        activeEntry,
        activeUser,
        brandLabel,
        breadcrumbs,
        clearFinishedUploads,
        closeDialog,
        confirmingUserId,
        currentFolderId,
        currentUsername,
        deleteEntry,
        dialog,
        downloadEntry,
        dragActive,
        emptyMessage,
        entries,
        handleEntryCommand,
        handleUploads,
        isAuthenticated,
        login,
        logout,
        navigateBack,
        navigateTo,
        openDialog,
        openEntry,
        openMenuId,
        saveAccount,
        saveFolderSecurity,
        saveName,
        saveSecuritySettings,
        saveSiteSettings,
        saveUser,
        searchQuery,
        securitySettings,
        setSort,
        settingsPanel,
        showBrowser,
        showSettings,
        showToast,
        siteSettings,
        sortDirection,
        sortKey,
        statusLabel,
        toastMessage,
        unlockFolder,
        uploads,
        users,
        view,
        visibleEntries,
        visibleSize,
        removeUser,
    })
}

export type FileManager = ReturnType<typeof useFileManager>
