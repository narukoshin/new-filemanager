import type {
    FileEntry,
    ManagedUser,
    SecurityMode,
    SecuritySettings,
    SiteSettings,
    UserRole,
} from "../types/fileManager"

export interface LoginCredentials {
    password: string
    username: string
}

export interface AccountInput {
    confirmPassword: string
    currentPassword: string
    newPassword: string
    username: string
}

export interface UserInput {
    password: string
    role: UserRole
    username: string
}

export interface FolderSecurityInput {
    confirmation: string
    currentPassword: string
    entryId: number
    mode: SecurityMode
    newPassword: string
}

export interface SessionIdentity {
    username: string
}

export interface BackendSnapshot {
    currentUsername: string
    entries: FileEntry[]
    securitySettings: SecuritySettings
    siteSettings: SiteSettings
    users: ManagedUser[]
}

export interface DownloadResource {
    disposable: boolean
    filename: string
    source: string
}

export interface UploadProgressOptions {
    onComplete: () => void
    onProgress: (progress: number) => void
    reducedMotion: boolean
}

/** A predictable failure safe enough to show beside a frontend form. */
export class BackendError extends Error {}

/** Contract between Vue state and whichever backend implementation is active. */
export interface FileManagerBackend {
    readonly mode: "http" | "mock"
    authenticate: (credentials: LoginCredentials) => Promise<SessionIdentity>
    createFolder: (parentId: number | null, name: string) => Promise<FileEntry>
    deleteEntry: (entryId: number) => Promise<FileEntry>
    downloadEntry: (entryId: number) => Promise<DownloadResource>
    loadSnapshot: () => Promise<BackendSnapshot>
    lockFolder: (entryId: number) => Promise<FileEntry>
    logout: () => Promise<void>
    protectFolder: (input: FolderSecurityInput) => Promise<FileEntry>
    removeUser: (userId: number) => Promise<ManagedUser>
    renameEntry: (entryId: number, name: string) => Promise<FileEntry>
    saveAccount: (input: AccountInput) => Promise<SessionIdentity>
    saveSecuritySettings: (
        settings: SecuritySettings,
    ) => Promise<SecuritySettings>
    saveSiteSettings: (settings: SiteSettings) => Promise<SiteSettings>
    saveUser: (userId: number | null, input: UserInput) => Promise<ManagedUser>
    startUploadProgress: (options: UploadProgressOptions) => () => void
    unlockFolder: (entryId: number, password: string) => Promise<FileEntry>
    uploadFile: (file: File, parentId: number | null) => Promise<FileEntry>
}

/** Turns unknown adapter failures into one restrained UI message. */
export const getBackendError = (error: unknown): string =>
    error instanceof Error ? error.message : "the backend refused the request"
