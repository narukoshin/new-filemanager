// The little vocabulary shared by files, identities, and their settings.
export type EntryType =
    "archive" | "database" | "folder" | "generic" | "image" | "text"

export type UserRole = "admin" | "editor" | "owner" | "viewer"
export type SortKey = "modified" | "name" | "size"
export type SortDirection = "asc" | "desc"
export type SettingsPanel = "account" | "security" | "site" | "users"
export type NameMode = "create" | "rename"
export type SecurityMode = "change" | "protect"

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
    password?: string
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

/** The DOM pieces required to make a simulated upload look convincing. */
export interface UploadUI {
    item: HTMLDivElement
    status: HTMLSpanElement
    progress: HTMLDivElement
}

/** The small wardrobe of classes and icons used to dress a file row. */
export interface TypeDetails {
    className: string
    icon: string
}
