import { computed, onMounted, reactive, ref, toRef } from "vue"

import { backend } from "../backend"
import { getBackendError } from "../backend/contracts"
import type {
    DialogState,
    FileEntry,
    NameMode,
    SecurityMode,
} from "../types/fileManager"
import { useAuth } from "./auth"
import { useFiles } from "./files"
import { useNavigation } from "./navigation"
import { useNotifications } from "./notifications"
import { useProtectedFolders } from "./protectedFolders"
import { useSettings } from "./settings"
import { useUploads } from "./uploads"
import { useUsers } from "./users"

/**
 * Composes the file-manager domains and arbitrates the few commands they share.
 * A tidy little court, now that no single composable is pretending to be king.
 */
export const useFileManager = () => {
    const dialog = reactive<DialogState>({
        entryId: null,
        kind: null,
        nameMode: "rename",
        securityMode: "protect",
        userId: null,
    })
    const currentFolderId = ref<number | null>(null)
    const searchQuery = ref("")
    const notifications = useNotifications()

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

    const files = useFiles({
        backend,
        currentFolderId,
        searchQuery,
        showToast: notifications.showToast,
    })
    const protectedFolders = useProtectedFolders({
        backend,
        entries: files.entries,
        showToast: notifications.showToast,
    })
    const navigation = useNavigation({
        currentFolderId,
        entries: files.entries,
        onLockedFolder: (entry) => openDialog("unlock", { entryId: entry.id }),
        searchQuery,
    })

    let renameOwner = (_username: string): void => undefined
    const auth = useAuth({
        backend,
        onLogin: (username) => renameOwner(username),
        onLogout: () => {
            protectedFolders.lockAll()
            navigation.leaveProtectedPath()
            navigation.showBrowser()
            navigation.openMenuId.value = null
        },
        showToast: notifications.showToast,
    })
    const users = useUsers({
        backend,
        currentUsername: auth.currentUsername,
        selectedUserId: toRef(dialog, "userId"),
        showToast: notifications.showToast,
    })
    renameOwner = users.renameOwner

    const settings = useSettings({
        backend,
        onDefaultSort: files.setDefaultSort,
        showToast: notifications.showToast,
    })
    const uploads = useUploads({
        addUploadedFile: files.addUploadedFile,
        currentFolderId,
        isAuthenticated: auth.isAuthenticated,
        maxUploadMegabytes: () => settings.siteSettings.maxUploadMegabytes,
        requestLogin: () => openDialog("login"),
        showToast: notifications.showToast,
        startUploadProgress: backend.startUploadProgress,
    })

    /** Resolves the file currently addressed by a dialog. */
    const activeEntry = computed(() =>
        files.entries.value.find((entry) => entry.id === dialog.entryId),
    )

    const statusLabel = computed(() => {
        if (navigation.view.value === "settings") return "admin console"
        return auth.isAuthenticated.value ? "private access" : "public node"
    })

    const brandLabel = computed(() =>
        navigation.view.value === "settings"
            ? "settings"
            : settings.siteSettings.label,
    )

    /** Completes login and dismisses the credentials dialog on success. */
    const login = async (
        username: string,
        password: string,
    ): Promise<string | null> => {
        const error = await auth.login(username, password)
        if (!error) closeDialog()
        return error
    }

    /** Guards the administrative view behind the current session. */
    const showSettings = (): void => {
        if (auth.isAuthenticated.value) navigation.showSettings()
    }

    /** Opens a folder or chooses preview/download behavior for a file. */
    const openEntry = (entry: FileEntry): void => {
        if (entry.type === "folder") {
            navigation.navigateTo(entry.id)
            return
        }
        if (settings.siteSettings.filePreviews) {
            openDialog("preview", { entryId: entry.id })
            return
        }
        downloadEntry(entry)
    }

    /** Downloads with access rules supplied by auth and site settings. */
    const downloadEntry = (entry: FileEntry): void => {
        void files.downloadEntry(entry, {
            authenticated: auth.isAuthenticated.value,
            publicDownloads: settings.siteSettings.publicDownloads,
        })
    }

    /** Verifies the selected folder, then enters it if the password behaved. */
    const unlockFolder = async (password: string): Promise<string | null> => {
        const entryId = activeEntry.value?.id ?? null
        const error = await protectedFolders.unlockFolder(
            activeEntry.value,
            password,
        )
        if (error) return error

        closeDialog()
        navigation.navigateTo(entryId)
        return null
    }

    /** Saves protection settings for the folder selected by the dialog. */
    const saveFolderSecurity = async (
        currentPassword: string,
        newPassword: string,
        confirmation: string,
    ): Promise<string | null> => {
        const error = await protectedFolders.saveFolderSecurity(
            activeEntry.value,
            dialog.securityMode,
            currentPassword,
            newPassword,
            confirmation,
        )
        if (!error) closeDialog()
        return error
    }

    /** Creates or renames the dialog target, then closes a successful form. */
    const saveName = async (name: string): Promise<string | null> => {
        const error = await files.saveName({
            entryId: dialog.entryId,
            mode: dialog.nameMode,
            name,
            parentId: currentFolderId.value,
        })
        if (!error) closeDialog()
        return error
    }

    /** Deletes the selected entry and all descendants. */
    const deleteEntry = async (): Promise<void> => {
        if (dialog.entryId === null) return
        if (await files.deleteEntry(dialog.entryId)) closeDialog()
    }

    /** Creates or edits a user and dismisses a successful form. */
    const saveUser = async (
        input: Parameters<typeof users.saveUser>[0],
    ): Promise<string | null> => {
        const error = await users.saveUser(input)
        if (!error) closeDialog()
        return error
    }

    /** Dispatches a row action after the authentication courtesy check. */
    const handleEntryCommand = (command: string, entry: FileEntry): void => {
        navigation.openMenuId.value = null
        if (!auth.isAuthenticated.value) return

        // This is where all the magic happens
        // typescript should learn from golang switch
        // "break" is useless
        switch (command) {
            case "download":
                downloadEntry(entry)
                break
            case "rename":
                openDialog("name", { entryId: entry.id, nameMode: "rename" })
                break
            case "unlock":
                openDialog("unlock", { entryId: entry.id })
                break
            case "relock":
                void protectedFolders.relockFolder(entry)
                break
            case "protect":
                openDialog("security", {
                    entryId: entry.id,
                    securityMode: "protect",
                })
                break
            case "change-password":
                openDialog("security", {
                    entryId: entry.id,
                    securityMode: "change",
                })
                break
            case "delete":
                openDialog("delete", { entryId: entry.id })
                break
        }
    }

    /** Loads the selected backend once and hydrates every reactive projection. */
    const hydrate = async (): Promise<void> => {
        try {
            const snapshot = await backend.loadSnapshot()
            files.hydrate(snapshot.entries)
            users.hydrate(snapshot.users)
            settings.hydrate(snapshot.siteSettings, snapshot.securitySettings)
            auth.hydrate(snapshot.currentUsername)
        } catch (error) {
            notifications.showToast(getBackendError(error))
        }
    }

    onMounted(() => void hydrate())

    // The proxy keeps templates pleasant while each domain retains proper refs.
    return reactive({
        activeEntry,
        activeUser: users.activeUser,
        brandLabel,
        breadcrumbs: navigation.breadcrumbs,
        clearFinishedUploads: uploads.clearFinishedUploads,
        closeDialog,
        confirmingUserId: users.confirmingUserId,
        currentFolderId,
        currentUsername: auth.currentUsername,
        deleteEntry,
        dialog,
        downloadEntry,
        dragActive: navigation.dragActive,
        emptyMessage: files.emptyMessage,
        entries: files.entries,
        handleEntryCommand,
        handleUploads: uploads.handleUploads,
        isAuthenticated: auth.isAuthenticated,
        login,
        logout: auth.logout,
        navigateBack: navigation.navigateBack,
        navigateTo: navigation.navigateTo,
        openDialog,
        openEntry,
        openMenuId: navigation.openMenuId,
        removeUser: users.removeUser,
        saveAccount: users.saveAccount,
        saveFolderSecurity,
        saveName,
        saveSecuritySettings: settings.saveSecuritySettings,
        saveSiteSettings: settings.saveSiteSettings,
        saveUser,
        searchQuery,
        securitySettings: settings.securitySettings,
        setSort: files.setSort,
        settingsPanel: navigation.settingsPanel,
        showBrowser: navigation.showBrowser,
        showSettings,
        showToast: notifications.showToast,
        siteSettings: settings.siteSettings,
        sortDirection: files.sortDirection,
        sortKey: files.sortKey,
        statusLabel,
        toastMessage: notifications.toastMessage,
        unlockFolder,
        uploads: uploads.uploads,
        users: users.users,
        view: navigation.view,
        visibleEntries: files.visibleEntries,
        visibleSize: files.visibleSize,
    })
}

export type FileManager = ReturnType<typeof useFileManager>
