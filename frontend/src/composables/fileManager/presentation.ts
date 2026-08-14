import type { EntryType, TypeDetails } from "../../types/fileManager"

/** Dresses each entry type in the proper class and icon. Presentation matters. */
export const typeDetails: Record<EntryType, TypeDetails> = {
    folder: { className: "folder", icon: "folder" },
    archive: { className: "archive-file", icon: "archive" },
    text: { className: "text-file", icon: "text" },
    image: { className: "image-file", icon: "image" },
    database: { className: "database-file", icon: "database" },
    generic: { className: "text-file", icon: "text" },
}
