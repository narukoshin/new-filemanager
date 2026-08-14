import {
    BackendError,
    type AccountInput,
    type BackendSnapshot,
    type FileManagerBackend,
    type FolderSecurityInput,
    type LoginCredentials,
    type UploadProgressOptions,
    type UserInput,
} from "../backend/contracts"
import type {
    FileEntry,
    ManagedUser,
    SecuritySettings,
    SiteSettings,
} from "../types/fileManager"
import { getEntryType, getUniqueEntryName } from "../utils/fileEntries"
import {
    createMockEntries,
    createMockUsers,
    type MockFileEntry,
} from "./fixtures"

interface MockState {
    currentUsername: string
    entries: MockFileEntry[]
    securitySettings: SecuritySettings
    siteSettings: SiteSettings
    users: ManagedUser[]
}

const createState = (): MockState => ({
    currentUsername: "naru",
    entries: createMockEntries(),
    securitySettings: {
        auditLog: true,
        folderProtection: true,
        loginLimit: 5,
        sessionLifetime: 8,
    },
    siteSettings: {
        defaultSort: "name",
        filePreviews: true,
        intro: "a quiet place for files, builds and things worth keeping around.",
        label: "files",
        maxUploadMegabytes: 25,
        nodeName: "FILE NODE 01",
        publicDownloads: true,
    },
    users: createMockUsers(),
})

let state = createState()
let nextEntryId = Math.max(...state.entries.map((entry) => entry.id)) + 1
let nextUserId = Math.max(...state.users.map((user) => user.id)) + 1

/** Removes backend-only secrets before an entry crosses into Vue state. */
const exposeEntry = (entry: MockFileEntry): FileEntry => {
    const exposed = structuredClone(entry)
    delete exposed.password
    return exposed
}

/** Returns detached mock data so Vue never mutates the adapter by accident. */
const loadSnapshot = async (): Promise<BackendSnapshot> => ({
    currentUsername: state.currentUsername,
    entries: state.entries.map(exposeEntry),
    securitySettings: structuredClone(state.securitySettings),
    siteSettings: structuredClone(state.siteSettings),
    users: structuredClone(state.users),
})

/** Finds an entry or responds with the same error shape an API would use. */
const requireEntry = (entryId: number): MockFileEntry => {
    const entry = state.entries.find((candidate) => candidate.id === entryId)
    if (!entry) throw new BackendError("item no longer exists")
    return entry
}

/** Refuses duplicate sibling names for both files and folders. */
const assertUniqueName = (
    name: string,
    parentId: number | null,
    ignoredId: number | null = null,
): void => {
    const duplicate = state.entries.some(
        (entry) =>
            entry.parentId === parentId &&
            entry.id !== ignoredId &&
            entry.name.toLowerCase() === name.toLowerCase(),
    )
    if (duplicate)
        throw new BackendError("an item with this name already exists")
}

/** Accepts any non-empty credentials, as promised by the preview dialog. */
const authenticate = async ({ password, username }: LoginCredentials) => {
    const normalized = username.trim()
    if (!normalized || !password)
        throw new BackendError("enter both credentials")
    state.currentUsername = normalized
    if (state.users[0]) state.users[0].username = normalized
    return { username: normalized }
}

/** Creates a folder in mock persistence rather than inside Vue state. */
const createFolder = async (
    parentId: number | null,
    name: string,
): Promise<FileEntry> => {
    const value = name.trim()
    assertUniqueName(value, parentId)
    const entry: MockFileEntry = {
        id: nextEntryId++,
        parentId,
        name: value,
        type: "folder",
        size: 0,
        modified: "just now",
        modifiedAt: Date.now(),
    }
    state.entries.unshift(entry)
    return exposeEntry(entry)
}

/** Renames an entry in mock persistence. */
const renameEntry = async (
    entryId: number,
    name: string,
): Promise<FileEntry> => {
    const entry = requireEntry(entryId)
    const value = name.trim()
    assertUniqueName(value, entry.parentId, entry.id)
    entry.name = value
    entry.type = entry.type === "folder" ? "folder" : getEntryType(value)
    entry.modified = "just now"
    entry.modifiedAt = Date.now()
    return exposeEntry(entry)
}

/** Deletes an entry tree from mock persistence. */
const deleteEntry = async (entryId: number): Promise<FileEntry> => {
    const entry = requireEntry(entryId)
    const descendantIds = new Set([entry.id])
    let changed = true
    while (changed) {
        changed = false
        state.entries.forEach((candidate) => {
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
    state.entries = state.entries.filter((candidate) => {
        const deleting = descendantIds.has(candidate.id)
        if (deleting && candidate.objectUrl)
            URL.revokeObjectURL(candidate.objectUrl)
        return !deleting
    })
    return exposeEntry(entry)
}

/** Produces the same download resource shape expected from the HTTP adapter. */
const downloadEntry = async (entryId: number) => {
    const entry = requireEntry(entryId)
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
    return { disposable, filename: entry.name, source }
}

/** Stores an uploaded browser file in mock persistence. */
const uploadFile = async (
    file: File,
    parentId: number | null,
): Promise<FileEntry> => {
    const type = getEntryType(file.name)
    const entry: MockFileEntry = {
        id: nextEntryId++,
        parentId,
        name: getUniqueEntryName(state.entries, file.name, parentId),
        type,
        size: file.size,
        modified: "just now",
        modifiedAt: Date.now(),
        objectUrl: URL.createObjectURL(file),
    }
    if (type === "text") entry.content = await file.text()
    state.entries.push(entry)
    return exposeEntry(entry)
}

/** Checks a mock folder password and returns its updated state. */
const unlockFolder = async (
    entryId: number,
    password: string,
): Promise<FileEntry> => {
    const entry = requireEntry(entryId)
    if (password !== entry.password)
        throw new BackendError("incorrect password · try again")
    entry.unlocked = true
    return exposeEntry(entry)
}

/** Revokes one mock folder grant. */
const lockFolder = async (entryId: number): Promise<FileEntry> => {
    const entry = requireEntry(entryId)
    entry.unlocked = false
    return exposeEntry(entry)
}

/** Applies mock protection without leaving password rules in Vue code. */
const protectFolder = async ({
    confirmation,
    currentPassword,
    entryId,
    mode,
    newPassword,
}: FolderSecurityInput): Promise<FileEntry> => {
    const entry = requireEntry(entryId)
    if (mode === "change" && currentPassword !== entry.password)
        throw new BackendError("the current password is incorrect")
    if (newPassword !== confirmation)
        throw new BackendError("new passwords do not match")
    entry.protected = true
    entry.password = newPassword
    entry.unlocked = true
    return exposeEntry(entry)
}

/** Validates and stores the mock owner account. */
const saveAccount = async (input: AccountInput) => {
    const username = input.username.trim()
    const duplicate = state.users.some(
        (user) =>
            user.id !== 1 &&
            user.username.toLowerCase() === username.toLowerCase(),
    )
    if (duplicate) throw new BackendError("choose a unique username")
    const changingPassword = Boolean(
        input.currentPassword || input.newPassword || input.confirmPassword,
    )
    if (changingPassword && !input.currentPassword)
        throw new BackendError(
            "enter your current password before choosing a new one",
        )
    if (changingPassword && !input.newPassword)
        throw new BackendError(
            "enter a new password or clear the password fields",
        )
    if (changingPassword && input.newPassword !== input.confirmPassword)
        throw new BackendError("new passwords do not match")
    state.currentUsername = username
    if (state.users[0]) state.users[0].username = username
    return { username }
}

/** Creates or updates an identity in mock persistence. */
const saveUser = async (userId: number | null, input: UserInput) => {
    const username = input.username.trim()
    const duplicate = state.users.some(
        (user) =>
            user.id !== userId &&
            user.username.toLowerCase() === username.toLowerCase(),
    )
    if (duplicate) throw new BackendError("choose a unique username")
    if (userId === null) {
        const user = {
            id: nextUserId++,
            username,
            role: input.role,
            activity: "invited just now",
        }
        state.users.push(user)
        return structuredClone(user)
    }
    const user = state.users.find((candidate) => candidate.id === userId)
    if (!user) throw new BackendError("user no longer exists")
    user.username = username
    user.role = input.role
    return structuredClone(user)
}

/** Removes one non-owner identity from mock persistence. */
const removeUser = async (userId: number) => {
    const user = state.users.find((candidate) => candidate.id === userId)
    if (!user) throw new BackendError("user no longer exists")
    if (user.id === 1) throw new BackendError("the owner cannot be removed")
    state.users = state.users.filter((candidate) => candidate.id !== user.id)
    return structuredClone(user)
}

/** Stores site settings in the mock adapter. */
const saveSiteSettings = async (
    settings: SiteSettings,
): Promise<SiteSettings> => {
    state.siteSettings = structuredClone(settings)
    return structuredClone(settings)
}

/** Stores security settings in the mock adapter. */
const saveSecuritySettings = async (
    settings: SecuritySettings,
): Promise<SecuritySettings> => {
    state.securitySettings = structuredClone(settings)
    return structuredClone(settings)
}

/** Runs fake upload progress and returns a cancellation function. */
const startUploadProgress = ({
    onComplete,
    onProgress,
    reducedMotion,
}: UploadProgressOptions): (() => void) => {
    let progress = 0
    const timer = setInterval(
        () => {
            progress = reducedMotion
                ? 100
                : Math.min(100, progress + Math.ceil(Math.random() * 17))
            onProgress(progress)
            if (progress < 100) return
            clearInterval(timer)
            onComplete()
        },
        reducedMotion ? 20 : 90,
    )
    return () => clearInterval(timer)
}

export const mockBackend: FileManagerBackend = {
    mode: "mock",
    authenticate,
    createFolder,
    deleteEntry,
    downloadEntry,
    loadSnapshot,
    lockFolder,
    logout: async () => {
        state.entries.forEach((entry) => {
            if (entry.protected) entry.unlocked = false
        })
    },
    protectFolder,
    removeUser,
    renameEntry,
    saveAccount,
    saveSecuritySettings,
    saveSiteSettings,
    saveUser,
    startUploadProgress,
    unlockFolder,
    uploadFile,
}
