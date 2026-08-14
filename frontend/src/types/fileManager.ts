// The little vocabulary shared by files, identities, and their settings.
export type EntryType =
    "archive" | "database" | "folder" | "generic" | "image" | "text"

export type UserRole = "admin" | "editor" | "owner" | "viewer"
export type SortKey = "modified" | "name" | "size"
export type SortDirection = "asc" | "desc"
export type SettingsPanel = "account" | "security" | "site" | "users"
export type NameMode = "create" | "rename"
export type SecurityMode = "change" | "protect"
export type AppView = "browser" | "settings"
export type DialogKind =
    "delete" | "login" | "name" | "preview" | "security" | "unlock" | "user"
export type UploadStatus = "complete" | "failed" | "uploading"

/** A file or directory behaving itself in the temporary hierarchy. */
export interface FileEntry {
    id: number
    parentId: number | null
    name: string
    type: EntryType
    size: number
    modified: string
    modifiedAt: number
    content?: string
    objectUrl?: string
    protected?: boolean
    unlocked?: boolean
}

/** An identity the administrative UI is gracious enough to manage. */
export interface ManagedUser {
    id: number
    username: string
    role: UserRole
    activity: string
}

/** One reactive upload simulation, soon to be replaced by a backend transfer. */
export interface UploadJob {
    id: number
    name: string
    progress: number
    status: UploadStatus
    statusLabel: string
}

/** The small wardrobe of classes and icons used to dress a file row. */
export interface TypeDetails {
    className: string
    icon: string
}

/** Public-facing and behavioral settings used by the frontend prototype. */
export interface SiteSettings {
    defaultSort: SortKey
    filePreviews: boolean
    intro: string
    label: string
    maxUploadMegabytes: number
    nodeName: string
    publicDownloads: boolean
}

/** Administrative safeguards represented in the settings preview. */
export interface SecuritySettings {
    auditLog: boolean
    folderProtection: boolean
    loginLimit: number
    sessionLifetime: number
}

/** Minimal state needed to render whichever modal currently has business here. */
export interface DialogState {
    entryId: number | null
    kind: DialogKind | null
    nameMode: NameMode
    securityMode: SecurityMode
    userId: number | null
}
