import type { SettingsPanel, SortKey, UserRole } from "../types/fileManager"

/** Keeps a wandering data attribute inside the approved settings panels. */
export const isSettingsPanel = (
    value: string | undefined,
): value is SettingsPanel =>
    ["account", "security", "site", "users"].includes(value ?? "")

/** Decides whether a role is legitimate or merely feeling ambitious. */
export const isUserRole = (value: string): value is UserRole =>
    ["admin", "editor", "owner", "viewer"].includes(value)

/** Allows only sort keys the file list actually knows how to obey. */
export const isSortKey = (value: string | undefined): value is SortKey =>
    ["modified", "name", "size"].includes(value ?? "")
