import type { FileEntry, ManagedUser } from "../types/fileManager"

/** Conjures a fresh file tree for our charmingly temporary frontend session. */
export const createMockEntries = (): FileEntry[] => [
    {
        id: 1,
        parentId: null,
        name: "builds",
        type: "folder",
        size: 0,
        modified: "today, 02:14",
        modifiedAt: 1723508040000,
    },
    {
        id: 2,
        parentId: null,
        name: "screenshots",
        type: "folder",
        size: 0,
        modified: "08 aug",
        modifiedAt: 1723132800000,
        protected: true,
        password: "threshold",
        unlocked: false,
    },
    {
        id: 3,
        parentId: null,
        name: "therxwold-release.zip",
        type: "archive",
        size: 18_400_000,
        modified: "07 aug",
        modifiedAt: 1723046400000,
    },
    {
        id: 4,
        parentId: null,
        name: "notes.txt",
        type: "text",
        size: 4_200,
        modified: "02 aug",
        modifiedAt: 1722614400000,
        content:
            "// PROJECT ÞERXWOLD\n\nkeep the signal quiet.\nkeep the archive readable.\nkeep building beyond the threshold.\n",
    },
    {
        id: 5,
        parentId: null,
        name: "void_004.png",
        type: "image",
        size: 812_000,
        modified: "28 jul",
        modifiedAt: 1722124800000,
    },
    {
        id: 6,
        parentId: null,
        name: "archive.db",
        type: "database",
        size: 2_100_000,
        modified: "13 jul",
        modifiedAt: 1720828800000,
    },
    {
        id: 7,
        parentId: 1,
        name: "nightly-v0.4.2.zip",
        type: "archive",
        size: 6_800_000,
        modified: "today, 02:12",
        modifiedAt: 1723507920000,
    },
    {
        id: 8,
        parentId: 1,
        name: "README.md",
        type: "text",
        size: 2_800,
        modified: "today, 01:58",
        modifiedAt: 1723507080000,
        content:
            "# nightly builds\n\nExperimental artifacts from file node 01.\n\n- verify checksums\n- keep releases reproducible\n- do not cross the threshold alone\n",
    },
    {
        id: 9,
        parentId: 2,
        name: "signal-room.png",
        type: "image",
        size: 940_000,
        modified: "08 aug",
        modifiedAt: 1723132800000,
    },
    {
        id: 10,
        parentId: 2,
        name: "capture-notes.txt",
        type: "text",
        size: 1_700,
        modified: "08 aug",
        modifiedAt: 1723132700000,
        content:
            "capture 01 // signal stable\ncapture 02 // presence detected\n",
    },
]

/** Supplies fresh administrators for the settings panel to boss around. */
export const createMockUsers = (): ManagedUser[] => [
    { id: 1, username: "naru", role: "owner", activity: "active now" },
    { id: 2, username: "moth", role: "editor", activity: "2 days ago" },
    { id: 3, username: "observer", role: "viewer", activity: "never" },
]
