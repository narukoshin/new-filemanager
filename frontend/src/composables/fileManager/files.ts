import type {
    EntryType,
    FileEntry,
    SortDirection,
    SortKey,
} from "../../types/fileManager"

const archiveExtensions = new Set(["zip", "tar", "gz", "7z", "rar"])
const databaseExtensions = new Set(["db", "sqlite", "sqlite3"])
const imageExtensions = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg"])
const textExtensions = new Set(["txt", "md", "json", "html", "css", "js", "ts"])

/** Makes raw byte counts presentable enough for polite company. */
export const formatFileSize = (bytes: number): string => {
    if (!bytes) return "—"
    if (bytes < 1_000_000)
        return `${(bytes / 1_000).toFixed(bytes < 10_000 ? 1 : 0)} kb`

    return `${(bytes / 1_000_000).toFixed(1)} mb`
}

/** Judges an entry by its extension. Shallow, perhaps, but effective. */
export const getEntryType = (name: string): EntryType => {
    const extension = name.split(".").pop()?.toLowerCase() ?? ""

    if (archiveExtensions.has(extension)) return "archive"
    if (imageExtensions.has(extension)) return "image"
    if (databaseExtensions.has(extension)) return "database"
    if (textExtensions.has(extension)) return "text"

    return "generic"
}

/** Coaxes a root-to-leaf trail out of our deliberately flat collection. */
export const getFolderTrail = (
    entries: FileEntry[],
    folderId: number | null,
): FileEntry[] => {
    const trail: FileEntry[] = []
    let folder = entries.find((entry) => entry.id === folderId)

    while (folder) {
        trail.unshift(folder)
        folder = entries.find((entry) => entry.id === folder?.parentId)
    }

    return trail
}

/** Sorts a fresh copy while letting folders enjoy their usual privilege. */
export const sortEntries = (
    entries: FileEntry[],
    sortKey: SortKey,
    direction: SortDirection,
): FileEntry[] =>
    [...entries].sort((left, right) => {
        if (left.type === "folder" && right.type !== "folder") return -1
        if (left.type !== "folder" && right.type === "folder") return 1

        let result: number
        if (sortKey === "size") result = left.size - right.size
        else if (sortKey === "modified")
            result = left.modifiedAt - right.modifiedAt
        else
            result = left.name.localeCompare(right.name, undefined, {
                sensitivity: "base",
                numeric: true,
            })

        return direction === "asc" ? result : -result
    })

/** Finds a unique name without starting an unnecessary little conflict. */
export const getUniqueEntryName = (
    entries: FileEntry[],
    name: string,
    parentId: number | null,
): string => {
    /** Checks this folder only; identical names elsewhere are perfectly innocent. */
    const exists = (candidate: string): boolean =>
        entries.some(
            (entry) =>
                entry.parentId === parentId &&
                entry.name.toLowerCase() === candidate.toLowerCase(),
        )

    if (!exists(name)) return name

    const dot = name.lastIndexOf(".")
    const stem = dot > 0 ? name.slice(0, dot) : name
    const extension = dot > 0 ? name.slice(dot) : ""
    let index = 2

    while (exists(`${stem}-${index}${extension}`)) index += 1

    return `${stem}-${index}${extension}`
}
