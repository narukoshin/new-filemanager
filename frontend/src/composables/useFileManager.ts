import { onMounted } from "vue"

import {
    createMockEntries,
    createMockUsers,
    typeDetails,
} from "../data/mockFileManager"
import type {
    FileEntry,
    ManagedUser,
    NameMode,
    SecurityMode,
    SettingsPanel,
    SortDirection,
    SortKey,
    UploadUI,
} from "../types/fileManager"
import { getElement, getElements } from "../utils/dom"
import { isSettingsPanel, isSortKey, isUserRole } from "../utils/guards"
import { getFileManagerElements } from "./fileManager/elements"
import {
    createMenuItem,
    createPreviewPlaceholder,
    createUploadItem,
} from "./fileManager/elementsFactory"
import {
    escapeHTML,
    formatFileSize,
    getEntryType,
    getFolderTrail,
    getUniqueEntryName,
    sortEntries,
} from "./fileManager/files"

/**
 * Wakes the file-manager prototype and introduces its Vue markup to the
 * temporary in-memory data layer. They get along surprisingly well.
 *
 * The local mutations retire once the Go API arrives; no need to grow attached.
 */
export const useFileManager = (): void => {
    onMounted(() => {
        // A perfectly convincing little session—until the Go API takes over.
        const entries: FileEntry[] = createMockEntries()
        const users: ManagedUser[] = createMockUsers()

        // One registry, because hunting selectors in every feature is rather dull.
        const {
            accountConfirmPassword,
            accountCurrentPassword,
            accountMenu,
            accountName,
            accountNewPassword,
            accountSettingsError,
            accountSettingsForm,
            accountUsername,
            addUserButton,
            authButton,
            authIcon,
            authLabel,
            backButton,
            brandAppName,
            breadcrumbs,
            browserFooter,
            browserHero,
            confirmPassword,
            currentPassword,
            currentPasswordField,
            defaultSortInput,
            deleteCopy,
            deleteDialog,
            deleteForm,
            deleteName,
            dropMessageText,
            dropOverlay,
            emptyMessage,
            emptyState,
            entryLabel,
            fileBrowser,
            fileList,
            filePicker,
            filePreviewsInput,
            footerNodeName,
            identityName,
            loginDialog,
            loginForm,
            managedPassword,
            managedPasswordHelp,
            managedPasswordLabel,
            managedRole,
            managedUsername,
            nameCopy,
            nameDialog,
            nameForm,
            nameInput,
            nameKicker,
            nameSubmit,
            nameTitle,
            newFolderButton,
            newPassword,
            nodeNameInput,
            pathPrefix,
            previewContent,
            previewDialog,
            previewDownload,
            previewMeta,
            previewTitle,
            publicDownloadsInput,
            searchInput,
            securityCopy,
            securityDialog,
            securityError,
            securityForm,
            securitySettingsForm,
            securitySubmit,
            securityTitle,
            settingsButton,
            settingsPanels,
            settingsReturn,
            settingsTabs,
            settingsUserList,
            settingsView,
            signoutButton,
            siteIntro,
            siteIntroInput,
            siteLabelInput,
            siteSettingsForm,
            skipLink,
            sortButtons,
            statusLabel,
            toast,
            unlockDialog,
            unlockError,
            unlockForm,
            unlockName,
            unlockPassword,
            uploadButton,
            uploadClear,
            uploadLimitInput,
            uploadList,
            uploadPanel,
            userCount,
            userDialog,
            userDialogCopy,
            userDialogTitle,
            userForm,
            userFormError,
            userFormSubmit,
            usernameInput,
            visibleCount,
            visibleSize,
        } = getFileManagerElements()

        // Our little imitation backend, all obediently waiting under one `let`.
        let isAuthenticated = false,
            activeEntryId: number | null = null,
            nameMode: NameMode = "rename",
            securityMode: SecurityMode = "protect",
            currentFolderId: number | null = null,
            sortKey: SortKey = "name",
            sortDirection: SortDirection = "asc",
            nextId = 11,
            nextUserId = 4,
            managedUserId: number | null = null,
            currentUsername = "naru",
            siteLabel = "files",
            maxUploadBytes = 25_000_000,
            dragDepth = 0,
            toastTimer: ReturnType<typeof setTimeout> | undefined

        /** Downloads an entry when the current access policy permits it. */
        const downloadEntry = (entry: FileEntry): void => {
            if (!isAuthenticated && !publicDownloadsInput.checked) {
                showToast("public downloads are disabled · log in to continue")
                return
            }
            const source =
                entry.objectUrl ||
                URL.createObjectURL(
                    new Blob(
                        [
                            entry.content ||
                                `Frontend preview for ${entry.name}\n`,
                        ],
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

            // Uploaded files keep their URL for previews; disposable blobs do not.
            if (!entry.objectUrl)
                setTimeout(() => URL.revokeObjectURL(source), 0)
            showToast(`downloading <strong>${escapeHTML(entry.name)}</strong>`)
        }

        /** Opens the best available preview, or downloads when previews are off. */
        const openPreview = (entry: FileEntry): void => {
            if (!filePreviewsInput.checked) {
                downloadEntry(entry)
                return
            }
            previewTitle.textContent = entry.name
            previewMeta.textContent = `${entry.type} · ${formatFileSize(entry.size)} · modified ${entry.modified}`
            previewContent.replaceChildren()

            if (entry.type === "text") {
                const text = document.createElement("pre")
                text.className = "preview-text"
                text.textContent =
                    entry.content ||
                    `// ${entry.name}\n\nText preview is available when file content is loaded.`
                previewContent.append(text)
            } else if (entry.type === "image" && entry.objectUrl) {
                const image = document.createElement("img")
                image.className = "preview-image"
                image.src = entry.objectUrl
                image.alt = `Preview of ${entry.name}`
                previewContent.append(image)
            } else {
                // Remote assets receive a pleasant placeholder until storage exists.
                const details = typeDetails[entry.type] || typeDetails.generic
                const message =
                    entry.type === "image"
                        ? "image preview placeholder · connect the storage URL later"
                        : `${entry.type} preview · ${formatFileSize(entry.size)}`
                previewContent.append(
                    createPreviewPlaceholder(details.icon, message),
                )
            }

            previewDownload.onclick = () => downloadEntry(entry)
            previewDialog.showModal()
        }

        /** Shows one transient notice and politely dismisses the previous one. */
        const showToast = (message: string): void => {
            clearTimeout(toastTimer)
            toast.innerHTML = message
            toast.hidden = false
            toastTimer = setTimeout(() => {
                toast.hidden = true
            }, 2600)
        }

        /** Closes every row menu and restores its trigger's accessibility state. */
        const closeMenus = (): void => {
            getElements<HTMLElement>(".row-menu").forEach((menu) => {
                menu.hidden = true
            })
            getElements<HTMLButtonElement>(".more-button").forEach((button) =>
                button.setAttribute("aria-expanded", "false"),
            )
        }

        /** Selects one settings panel and optionally moves keyboard focus to it. */
        const switchSettingsPanel = (
            panelName: SettingsPanel,
            moveFocus = false,
        ): void => {
            settingsTabs.forEach((tab) => {
                const selected = tab.dataset.settingsTab === panelName
                tab.setAttribute("aria-selected", String(selected))
                tab.tabIndex = selected ? 0 : -1
                if (selected && moveFocus) tab.focus()
            })
            settingsPanels.forEach((panel) => {
                panel.hidden = panel.dataset.settingsPanel !== panelName
            })
        }

        /** Trades the browser for the authenticated settings view. */
        const showSettings = (): void => {
            if (!isAuthenticated) return
            browserHero.hidden = true
            fileBrowser.hidden = true
            browserFooter.hidden = true
            settingsView.hidden = false
            brandAppName.textContent = "settings"
            statusLabel.textContent = "admin console"
            skipLink.href = "#settings-view"
            skipLink.textContent = "skip to settings"
            accountUsername.value = currentUsername
            identityName.textContent = currentUsername
            renderUsers()
            settingsView.focus({ preventScroll: true })
            window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                    .matches
                    ? "auto"
                    : "smooth",
            })
        }

        /** Returns from settings and restores the file-browser chrome. */
        const showBrowser = (): void => {
            settingsView.hidden = true
            browserHero.hidden = false
            fileBrowser.hidden = false
            browserFooter.hidden = false
            brandAppName.textContent = siteLabel
            statusLabel.textContent = isAuthenticated
                ? "private access"
                : "public node"
            skipLink.href = "#file-browser"
            skipLink.textContent = "skip to files"
            fileBrowser.focus({ preventScroll: true })
            window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                    .matches
                    ? "auto"
                    : "smooth",
            })
        }

        /** Prepares the user dialog for either creation or editing. How versatile. */
        const openUserDialog = (user: ManagedUser | null = null): void => {
            managedUserId = user?.id ?? null
            const editing = user !== null
            userForm.reset()
            userFormError.textContent = ""
            userDialogTitle.textContent = editing ? "edit user" : "create user"
            userDialogCopy.textContent = editing
                ? `Change access details for “${user?.username ?? ""}”.`
                : "Add an identity that can access this file node."
            userFormSubmit.textContent = editing ? "save user" : "create user"
            managedPasswordLabel.textContent = editing
                ? "new password"
                : "temporary password"
            managedPasswordHelp.textContent = editing
                ? "Leave empty to keep the current password."
                : "The user should replace this after signing in."
            managedPassword.required = !editing
            managedUsername.value = user?.username ?? ""
            managedRole.value = user?.role ?? "editor"
            userDialog.showModal()
            managedUsername.focus()
            managedUsername.select()
        }

        /** Rebuilds the administrative user list from current session data. */
        const renderUsers = (): void => {
            settingsUserList.replaceChildren()
            userCount.textContent = String(users.length)
            users.forEach((user) => {
                const row = document.createElement("div")
                row.className = "user-row"

                const name = document.createElement("span")
                name.className = "user-name"
                name.textContent = user.username
                if (user.id === 1) {
                    const marker = document.createElement("small")
                    marker.textContent = "current account"
                    name.append(marker)
                }

                const role = document.createElement("span")
                role.className = "user-role"
                role.textContent = user.role

                const activity = document.createElement("span")
                activity.className = "user-activity"
                activity.textContent = user.activity

                const actions = document.createElement("span")
                actions.className = "user-actions"
                const edit = document.createElement("button")
                edit.type = "button"
                edit.className = "micro-button"
                edit.textContent = user.id === 1 ? "account" : "edit"
                edit.addEventListener("click", () => {
                    if (user.id === 1) switchSettingsPanel("account", true)
                    else openUserDialog(user)
                })
                const remove = document.createElement("button")
                remove.type = "button"
                remove.className = "micro-button danger"
                remove.textContent = "remove"
                remove.disabled = user.id === 1
                remove.title =
                    user.id === 1
                        ? "The owner cannot be removed"
                        : `Remove ${user.username}`
                remove.addEventListener("click", () => {
                    // Destructive buttons demand a second click, just this once.
                    if (remove.dataset.confirming !== "true") {
                        remove.dataset.confirming = "true"
                        remove.textContent = "confirm?"
                        setTimeout(() => {
                            if (remove.isConnected) {
                                remove.dataset.confirming = "false"
                                remove.textContent = "remove"
                            }
                        }, 2600)
                        return
                    }
                    const index = users.findIndex((item) => item.id === user.id)
                    if (index !== -1) users.splice(index, 1)
                    renderUsers()
                    showToast(
                        `removed user <strong>${escapeHTML(user.username)}</strong>`,
                    )
                })
                actions.append(edit, remove)
                row.append(name, role, activity, actions)
                settingsUserList.append(row)
            })
        }

        /** Rebuilds the breadcrumb trail for the active folder. */
        const renderBreadcrumbs = (): void => {
            breadcrumbs.replaceChildren()
            const trail = getFolderTrail(entries, currentFolderId)
            const parts = [{ id: null, name: "~/uploads" }, ...trail]
            parts.forEach((part, index) => {
                if (index > 0) {
                    const separator = document.createElement("span")
                    separator.className = "breadcrumb-separator"
                    separator.textContent = "/"
                    separator.setAttribute("aria-hidden", "true")
                    breadcrumbs.append(separator)
                }
                const crumb = document.createElement("button")
                crumb.type = "button"
                crumb.className = "breadcrumb"
                crumb.textContent = part.name
                if (index === parts.length - 1)
                    crumb.setAttribute("aria-current", "page")
                else crumb.addEventListener("click", () => navigateTo(part.id))
                breadcrumbs.append(crumb)
            })
            backButton.disabled = currentFolderId === null
        }

        /** Navigates to an accessible folder and resets the local search. */
        const navigateTo = (folderId: number | null): void => {
            if (folderId !== null) {
                const folder = entries.find(
                    (entry) => entry.id === folderId && entry.type === "folder",
                )
                if (!folder) return

                // Locked folders never reveal their children before a challenge.
                if (folder.protected && !folder.unlocked) {
                    openUnlockDialog(folder)
                    return
                }
            }
            currentFolderId = folderId
            searchInput.value = ""
            closeMenus()
            renderFiles()
            fileBrowser.focus({ preventScroll: true })
        }

        /** Synchronizes sort labels, direction indicators, and ARIA metadata. */
        const updateSortControls = (): void => {
            sortButtons.forEach((button) => {
                const active = button.dataset.sort === sortKey
                button.setAttribute("aria-pressed", String(active))
                button.parentElement?.setAttribute(
                    "aria-sort",
                    active
                        ? sortDirection === "asc"
                            ? "ascending"
                            : "descending"
                        : "none",
                )
                const indicator =
                    button.querySelector<HTMLElement>(".sort-indicator")
                if (indicator)
                    indicator.textContent = active
                        ? sortDirection === "asc"
                            ? "↑"
                            : "↓"
                        : ""
                button.setAttribute(
                    "aria-label",
                    `Sort by ${button.dataset.sort}${active ? `, currently ${sortDirection === "asc" ? "ascending" : "descending"}` : ""}`,
                )
            })
        }

        /** Builds one interactive file row and its authenticated action menu. */
        const createRow = (entry: FileEntry): HTMLDivElement => {
            const details = typeDetails[entry.type] || typeDetails.generic
            const row = document.createElement("div")
            row.className = `file-row ${details.className}`
            row.dataset.file = ""
            row.dataset.id = String(entry.id)
            row.dataset.name = entry.name
            row.setAttribute("role", "listitem")

            const openButton = document.createElement("button")
            openButton.type = "button"
            openButton.className = "file-open"
            openButton.setAttribute(
                "aria-label",
                `${entry.type === "folder" ? "Open folder" : "Open file"} ${entry.name}`,
            )

            const name = document.createElement("span")
            name.className = "name"
            const icon = document.createElement("span")
            icon.className = "icon"
            icon.setAttribute("aria-hidden", "true")
            icon.innerHTML = `<svg class="pixel-icon" viewBox="0 0 16 16"><use href="#icon-${details.icon}"></use></svg>`
            const filename = document.createElement("span")
            filename.className = "filename"
            filename.textContent = entry.name
            name.append(icon, filename)
            if (entry.type === "folder" && entry.protected) {
                const badge = document.createElement("span")
                badge.className = `protected-badge${entry.unlocked ? " unlocked" : ""}`
                badge.innerHTML = `<svg class="pixel-icon" viewBox="0 0 16 16" aria-hidden="true"><use href="#icon-lock"></use></svg><span>${entry.unlocked ? "unlocked" : "locked"}</span>`
                name.append(badge)
            }
            openButton.append(name)
            openButton.addEventListener("click", () => {
                if (entry.type === "folder") navigateTo(entry.id)
                else openPreview(entry)
            })

            const size = document.createElement("span")
            size.className = "size"
            size.textContent = formatFileSize(entry.size)
            const modified = document.createElement("span")
            modified.className = "modified"
            modified.textContent = entry.modified

            const actions = document.createElement("div")
            actions.className = "row-actions"
            const more = document.createElement("button")
            more.type = "button"
            more.className = "more-button"
            more.setAttribute("aria-label", `Actions for ${entry.name}`)
            more.setAttribute("aria-haspopup", "menu")
            more.setAttribute("aria-expanded", "false")
            more.textContent = "…"
            const menu = document.createElement("div")
            menu.className = "row-menu"
            menu.setAttribute("role", "menu")
            menu.hidden = true
            if (entry.type !== "folder")
                menu.append(createMenuItem("download", "↓", "download"))
            if (entry.type === "folder") {
                if (entry.protected && entry.unlocked)
                    menu.append(createMenuItem("lock again", "⌁", "relock"))
                if (entry.protected && !entry.unlocked)
                    menu.append(createMenuItem("unlock", "◇", "unlock"))
                menu.append(
                    createMenuItem(
                        entry.protected ? "change password" : "protect folder",
                        "◆",
                        entry.protected ? "change-password" : "protect",
                    ),
                )
            }
            menu.append(createMenuItem("rename", "↗", "rename"))
            menu.append(createMenuItem("delete", "×", "delete", true))
            more.addEventListener("click", (event) => {
                event.stopPropagation()
                const willOpen = menu.hidden
                closeMenus()
                menu.hidden = !willOpen
                more.setAttribute("aria-expanded", String(willOpen))
            })
            menu.addEventListener("click", (event) => {
                const command = (
                    event.target as HTMLElement
                ).closest<HTMLElement>("[data-command]")?.dataset.command
                if (!command) return
                closeMenus()
                handleCommand(command, entry.id)
            })
            actions.append(more, menu)
            row.append(openButton, size, modified, actions)
            return row
        }

        /** Renders, sorts, and filters the entries in the current folder. */
        const renderFiles = (): void => {
            fileList
                .querySelectorAll("[data-file]")
                .forEach((row) => row.remove())
            const folderEntries = entries.filter(
                (entry) => entry.parentId === currentFolderId,
            )
            sortEntries(folderEntries, sortKey, sortDirection).forEach(
                (entry) => fileList.insertBefore(createRow(entry), emptyState),
            )
            renderBreadcrumbs()
            updateSortControls()
            filterFiles()
        }

        /** Applies the search query and refreshes the visible-entry summary. */
        const filterFiles = (): void => {
            const query = searchInput.value.trim().toLowerCase()
            const matchingEntries = entries.filter(
                (entry) =>
                    entry.parentId === currentFolderId &&
                    entry.name.toLowerCase().includes(query),
            )
            getElements<HTMLElement>("[data-file]").forEach((row) => {
                row.hidden = !(row.dataset.name ?? "")
                    .toLowerCase()
                    .includes(query)
            })
            visibleCount.textContent = String(matchingEntries.length)
            entryLabel.textContent =
                matchingEntries.length === 1 ? "entry" : "entries"
            const totalSize = matchingEntries.reduce(
                (total, entry) => total + entry.size,
                0,
            )
            visibleSize.textContent = totalSize
                ? formatFileSize(totalSize)
                : "0 b"
            emptyState.hidden = matchingEntries.length !== 0
            emptyMessage.textContent = query
                ? `no files matching “${searchInput.value.trim()}”`
                : "this folder is empty"
        }

        /** Updates prototype permissions and every visible identity affordance. */
        const setAuthenticated = (value: boolean, username = "naru"): void => {
            isAuthenticated = value
            if (value) {
                currentUsername = username
                users[0].username = username
            }
            if (!value) {
                // Signing out seals protected folders again. Sensible, isn't it?
                entries.forEach((entry) => {
                    if (entry.protected) entry.unlocked = false
                })
                if (
                    getFolderTrail(entries, currentFolderId).some(
                        (folder) => folder.protected,
                    )
                )
                    currentFolderId = null
            }
            document.body.dataset.auth = String(value)
            authLabel.textContent = value ? currentUsername : "log in"
            authIcon.setAttribute(
                "href",
                value ? "#icon-account" : "#icon-login",
            )
            accountName.textContent = currentUsername
            identityName.textContent = currentUsername
            pathPrefix.textContent = `${currentUsername}@wold:`
            statusLabel.textContent = value ? "private access" : "public node"
            authButton.setAttribute("aria-haspopup", value ? "menu" : "dialog")
            newFolderButton.disabled = !value
            uploadButton.disabled = !value
            newFolderButton.title = value
                ? "Create a folder"
                : "Log in to create folders"
            uploadButton.title = value
                ? "Upload files"
                : "Log in to upload files"
            accountMenu.hidden = true
            closeMenus()
            if (fileList.querySelector("[data-file]")) renderFiles()
        }

        /** Opens the password challenge for a protected folder. */
        const openUnlockDialog = (entry: FileEntry): void => {
            activeEntryId = entry.id
            unlockName.textContent = `“${entry.name}”`
            unlockPassword.value = ""
            unlockError.textContent = ""
            unlockDialog.showModal()
            unlockPassword.focus()
        }

        /** Configures the folder-security dialog for protection or rotation. */
        const openSecurityDialog = (
            mode: SecurityMode,
            entry: FileEntry,
        ): void => {
            securityMode = mode
            activeEntryId = entry.id
            securityTitle.textContent =
                mode === "protect" ? "protect folder" : "change folder password"
            securityCopy.textContent =
                mode === "protect"
                    ? `Require a password before “${entry.name}” can be opened.`
                    : `Replace the password for “${entry.name}”.`
            securitySubmit.textContent =
                mode === "protect" ? "protect folder" : "change password"
            currentPasswordField.hidden = mode !== "change"
            currentPassword.required = mode === "change"
            securityForm.reset()
            securityError.textContent = ""
            securityDialog.showModal()
            const passwordInput =
                mode === "change" ? currentPassword : newPassword
            passwordInput.focus()
        }

        /** Configures the shared naming dialog for creation or renaming. */
        const openNameDialog = (
            mode: NameMode,
            entry: FileEntry | null = null,
        ): void => {
            nameMode = mode
            activeEntryId = entry?.id ?? null
            nameKicker.textContent =
                mode === "rename" ? "file action" : "new directory"
            nameTitle.textContent =
                mode === "rename" ? "rename item" : "create folder"
            nameCopy.textContent =
                mode === "rename"
                    ? `Rename “${entry?.name ?? ""}”.`
                    : "Add a folder to the current path."
            nameSubmit.textContent =
                mode === "rename" ? "save name" : "create folder"
            nameInput.value = mode === "rename" ? (entry?.name ?? "") : ""
            nameInput.setCustomValidity("")
            nameDialog.showModal()
            nameInput.focus()
            nameInput.select()
        }

        /** Dispatches an authenticated row-menu command to its proper ritual. */
        const handleCommand = (command: string, id: number): void => {
            if (!isAuthenticated) return
            const entry = entries.find((item) => item.id === id)
            if (!entry) return
            if (command === "rename") openNameDialog("rename", entry)
            if (command === "unlock") openUnlockDialog(entry)
            if (command === "relock") {
                entry.unlocked = false
                renderFiles()
                showToast(`locked <strong>${escapeHTML(entry.name)}</strong>`)
            }
            if (command === "protect") openSecurityDialog("protect", entry)
            if (command === "change-password")
                openSecurityDialog("change", entry)
            if (command === "delete") {
                activeEntryId = id
                deleteName.textContent = `“${entry.name}”`
                if (deleteCopy.lastChild) {
                    deleteCopy.lastChild.textContent =
                        entry.type === "folder"
                            ? " and everything inside it from the current frontend session."
                            : " from the current frontend session."
                }
                deleteDialog.showModal()
            }
            if (command === "download") downloadEntry(entry)
        }

        /** Commits a completed upload to the temporary entry collection. */
        const finishUpload = (
            file: File,
            ui: UploadUI,
            parentId: number | null,
        ): void => {
            const type = getEntryType(file.name)
            const entry: FileEntry = {
                id: nextId++,
                parentId,
                name: getUniqueEntryName(entries, file.name, parentId),
                type,
                size: file.size,
                modified: "just now",
                modifiedAt: Date.now(),
            }

            // This URL belongs to the entry and survives until that entry is deleted.
            entry.objectUrl = URL.createObjectURL(file)
            if (type === "text")
                file.text().then((content) => {
                    entry.content = content
                })
            entries.push(entry)
            ui.item.classList.add("complete")
            ui.status.textContent = "done"
            ui.progress.style.width = "100%"
            if (currentFolderId === parentId) renderFiles()
        }

        /** Validates a file and performs our very convincing upload simulation. */
        const queueUpload = (file: File, parentId: number | null): void => {
            const ui = createUploadItem(file, uploadList)
            if (file.size > maxUploadBytes) {
                ui.item.classList.add("failed")
                ui.status.textContent = "too large"
                ui.progress.style.width = "100%"
                return
            }

            let progress = 0
            const reducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches
            const timer = setInterval(
                () => {
                    // Reduced motion skips the theatrics and completes immediately.
                    progress = reducedMotion
                        ? 100
                        : Math.min(
                              100,
                              progress + Math.ceil(Math.random() * 17),
                          )
                    ui.progress.style.width = `${progress}%`
                    ui.status.textContent = `${progress}%`
                    if (progress === 100) {
                        clearInterval(timer)
                        finishUpload(file, ui, parentId)
                    }
                },
                reducedMotion ? 20 : 90,
            )
        }

        /** Queues a selected or dropped file collection for the active folder. */
        const handleUploads = (fileCollection: FileList | null): void => {
            if (!fileCollection) return
            const files = [...fileCollection]
            if (!files.length) return
            if (!isAuthenticated) {
                showToast("log in before uploading files")
                loginDialog.showModal()
                usernameInput.focus()
                return
            }
            uploadPanel.hidden = false
            const targetFolderId = currentFolderId
            files.forEach((file) => queueUpload(file, targetFolderId))
            showToast(
                `queued <strong>${files.length}</strong> ${files.length === 1 ? "file" : "files"}`,
            )
        }

        // Handlers first, listeners second. Even chaos appreciates good timing.
        authButton.addEventListener("click", (event) => {
            event.stopPropagation()
            if (!isAuthenticated) {
                loginDialog.showModal()
                usernameInput.focus()
                return
            }
            accountMenu.hidden = !accountMenu.hidden
            authButton.setAttribute(
                "aria-expanded",
                String(!accountMenu.hidden),
            )
        })

        settingsButton.addEventListener("click", (event) => {
            event.stopPropagation()
            accountMenu.hidden = true
            authButton.setAttribute("aria-expanded", "false")
            showSettings()
        })

        settingsReturn.addEventListener("click", showBrowser)

        settingsTabs.forEach((tab, index) => {
            tab.addEventListener("click", () => {
                const panel = tab.dataset.settingsTab
                if (isSettingsPanel(panel)) switchSettingsPanel(panel)
            })
            tab.addEventListener("keydown", (event) => {
                if (
                    ![
                        "ArrowDown",
                        "ArrowUp",
                        "ArrowLeft",
                        "ArrowRight",
                    ].includes(event.key)
                )
                    return
                event.preventDefault()
                const forward =
                    event.key === "ArrowDown" || event.key === "ArrowRight"
                const nextIndex =
                    (index + (forward ? 1 : -1) + settingsTabs.length) %
                    settingsTabs.length
                const panel = settingsTabs[nextIndex]?.dataset.settingsTab
                if (isSettingsPanel(panel)) switchSettingsPanel(panel, true)
            })
        })

        accountSettingsForm.addEventListener("submit", (event) => {
            event.preventDefault()
            accountSettingsError.textContent = ""
            accountUsername.setCustomValidity("")
            accountConfirmPassword.setCustomValidity("")
            const nextUsername = accountUsername.value.trim()
            const changingPassword = Boolean(
                accountCurrentPassword.value ||
                accountNewPassword.value ||
                accountConfirmPassword.value,
            )
            if (
                users.some(
                    (user) =>
                        user.id !== 1 &&
                        user.username.toLowerCase() ===
                            nextUsername.toLowerCase(),
                )
            ) {
                accountUsername.setCustomValidity(
                    "This username is already in use.",
                )
                accountSettingsError.textContent = "choose a unique username"
            }
            if (!accountSettingsForm.reportValidity()) return
            if (changingPassword && !accountCurrentPassword.value) {
                accountSettingsError.textContent =
                    "enter your current password before choosing a new one"
                accountCurrentPassword.focus()
                return
            }
            if (changingPassword && !accountNewPassword.value) {
                accountSettingsError.textContent =
                    "enter a new password or clear the password fields"
                accountNewPassword.focus()
                return
            }
            if (
                changingPassword &&
                accountNewPassword.value !== accountConfirmPassword.value
            ) {
                accountConfirmPassword.setCustomValidity(
                    "Passwords do not match.",
                )
                accountSettingsError.textContent = "new passwords do not match"
            }
            if (!accountSettingsForm.reportValidity()) return
            currentUsername = nextUsername
            users[0].username = nextUsername
            authLabel.textContent = nextUsername
            accountName.textContent = nextUsername
            identityName.textContent = nextUsername
            pathPrefix.textContent = `${nextUsername}@wold:`
            accountCurrentPassword.value = ""
            accountNewPassword.value = ""
            accountConfirmPassword.value = ""
            renderUsers()
            showToast(
                changingPassword
                    ? "account and password updated"
                    : "account updated",
            )
        })

        const accountPasswordInputs = [
            accountCurrentPassword,
            accountNewPassword,
            accountConfirmPassword,
        ]
        accountPasswordInputs.forEach((input) => {
            input.addEventListener("input", () => {
                accountConfirmPassword.setCustomValidity("")
                accountSettingsError.textContent = ""
            })
        })

        accountUsername.addEventListener("input", () => {
            accountUsername.setCustomValidity("")
            accountSettingsError.textContent = ""
        })

        addUserButton.addEventListener("click", () => openUserDialog())

        userForm.addEventListener("submit", (event) => {
            event.preventDefault()
            const username = managedUsername.value.trim()
            const duplicate = users.some(
                (user) =>
                    user.username.toLowerCase() === username.toLowerCase() &&
                    user.id !== managedUserId,
            )
            managedUsername.setCustomValidity(
                duplicate ? "This username is already in use." : "",
            )
            userFormError.textContent = duplicate
                ? "choose a unique username"
                : ""
            if (!userForm.reportValidity()) return

            const role = managedRole.value
            if (!isUserRole(role)) return

            if (managedUserId === null) {
                users.push({
                    id: nextUserId++,
                    username,
                    role,
                    activity: "invited just now",
                })
                showToast(
                    `created user <strong>${escapeHTML(username)}</strong>`,
                )
            } else {
                const user = users.find((item) => item.id === managedUserId)
                if (!user) return
                user.username = username
                user.role = role
                showToast(
                    `updated user <strong>${escapeHTML(username)}</strong>${managedPassword.value ? " and rotated their password" : ""}`,
                )
            }
            userDialog.close()
            renderUsers()
        })

        managedUsername.addEventListener("input", () => {
            managedUsername.setCustomValidity("")
            userFormError.textContent = ""
        })

        siteSettingsForm.addEventListener("submit", (event) => {
            event.preventDefault()
            if (!siteSettingsForm.reportValidity()) return
            siteLabel = siteLabelInput.value.trim()
            siteIntro.textContent = siteIntroInput.value.trim()
            footerNodeName.textContent = `ÞERXWOLD // ${nodeNameInput.value.trim().toUpperCase()}`
            maxUploadBytes = Number(uploadLimitInput.value) * 1_000_000
            const nextSortKey = defaultSortInput.value
            if (!isSortKey(nextSortKey)) return
            sortKey = nextSortKey
            sortDirection = sortKey === "modified" ? "desc" : "asc"
            renderFiles()
            showToast("site settings saved")
        })

        const siteBehaviorInputs = [publicDownloadsInput, filePreviewsInput]
        siteBehaviorInputs.forEach((input) => {
            input.addEventListener("change", () =>
                showToast("site behavior updated for this preview"),
            )
        })

        securitySettingsForm.addEventListener("submit", (event) => {
            event.preventDefault()
            if (!securitySettingsForm.reportValidity()) return
            showToast("security policy saved")
        })

        loginForm.addEventListener("submit", (event) => {
            event.preventDefault()
            if (!loginForm.reportValidity()) return
            const username = usernameInput.value.trim()
            setAuthenticated(true, username)
            loginDialog.close()
            loginForm.reset()
            showToast(`welcome back, <strong>${escapeHTML(username)}</strong>`)
        })

        unlockForm.addEventListener("submit", (event) => {
            event.preventDefault()
            const entry = entries.find((item) => item.id === activeEntryId)
            if (!entry) return
            if (unlockPassword.value !== entry.password) {
                unlockError.textContent = "incorrect password · try again"
                unlockPassword.select()
                return
            }
            entry.unlocked = true
            unlockDialog.close()
            navigateTo(entry.id)
            showToast(
                `unlocked and opened <strong>${escapeHTML(entry.name)}</strong>`,
            )
        })

        unlockPassword.addEventListener("input", () => {
            unlockError.textContent = ""
        })

        securityForm.addEventListener("submit", (event) => {
            event.preventDefault()
            const entry = entries.find((item) => item.id === activeEntryId)
            if (!entry) return
            securityError.textContent = ""
            confirmPassword.setCustomValidity("")

            if (
                securityMode === "change" &&
                currentPassword.value !== entry.password
            ) {
                securityError.textContent = "the current password is incorrect"
                currentPassword.select()
                return
            }

            if (newPassword.value !== confirmPassword.value) {
                confirmPassword.setCustomValidity("Passwords do not match.")
                securityError.textContent = "new passwords do not match"
            }

            if (!securityForm.reportValidity()) return
            entry.protected = true
            entry.password = newPassword.value
            entry.unlocked = true
            securityDialog.close()
            renderFiles()
            showToast(
                `${securityMode === "protect" ? "protected" : "updated password for"} <strong>${escapeHTML(entry.name)}</strong>`,
            )
        })

        confirmPassword.addEventListener("input", () => {
            confirmPassword.setCustomValidity("")
            securityError.textContent = ""
        })

        currentPassword.addEventListener("input", () => {
            securityError.textContent = ""
        })

        signoutButton.addEventListener("click", () => {
            if (!settingsView.hidden) showBrowser()
            setAuthenticated(false)
            showToast("signed out · file actions locked")
        })

        newFolderButton.addEventListener("click", () =>
            openNameDialog("create"),
        )
        uploadButton.addEventListener("click", () => filePicker.click())
        filePicker.addEventListener("change", () => {
            handleUploads(filePicker.files)
            filePicker.value = ""
        })

        uploadClear.addEventListener("click", () => {
            uploadList
                .querySelectorAll(".complete, .failed")
                .forEach((item) => item.remove())
            uploadPanel.hidden = !uploadList.children.length
        })

        nameForm.addEventListener("submit", (event) => {
            event.preventDefault()
            const value = nameInput.value.trim()
            const activeEntry = entries.find(
                (entry) => entry.id === activeEntryId,
            )
            const targetParentId =
                nameMode === "rename"
                    ? (activeEntry?.parentId ?? null)
                    : currentFolderId
            const duplicate = entries.some(
                (entry) =>
                    entry.parentId === targetParentId &&
                    entry.name.toLowerCase() === value.toLowerCase() &&
                    entry.id !== activeEntryId,
            )
            nameInput.setCustomValidity(
                duplicate ? "An item with this name already exists." : "",
            )
            if (!nameForm.reportValidity()) return
            if (nameMode === "rename") {
                const entry = entries.find((item) => item.id === activeEntryId)
                if (!entry) return
                const oldName = entry.name
                entry.name = value
                entry.type =
                    entry.type === "folder" ? "folder" : getEntryType(value)
                entry.modified = "just now"
                entry.modifiedAt = Date.now()
                showToast(
                    `renamed <strong>${escapeHTML(oldName)}</strong> to <strong>${escapeHTML(value)}</strong>`,
                )
            } else {
                entries.unshift({
                    id: nextId++,
                    parentId: currentFolderId,
                    name: value,
                    type: "folder",
                    size: 0,
                    modified: "just now",
                    modifiedAt: Date.now(),
                })
                showToast(
                    `created folder <strong>${escapeHTML(value)}</strong>`,
                )
            }
            nameDialog.close()
            renderFiles()
        })

        deleteForm.addEventListener("submit", (event) => {
            event.preventDefault()
            const index = entries.findIndex(
                (entry) => entry.id === activeEntryId,
            )
            if (index < 0) return
            const [deleted] = entries.splice(index, 1)
            if (!deleted) return

            // The store is flat, so descendants must be discovered layer by layer.
            const descendantIds = new Set([deleted.id])
            let foundChildren = true
            while (foundChildren) {
                foundChildren = false
                entries.forEach((entry) => {
                    if (
                        entry.parentId !== null &&
                        descendantIds.has(entry.parentId) &&
                        !descendantIds.has(entry.id)
                    ) {
                        descendantIds.add(entry.id)
                        foundChildren = true
                    }
                })
            }
            let childIndex = entries.length - 1
            while (childIndex >= 0) {
                const childEntry = entries[childIndex]
                if (childEntry && descendantIds.has(childEntry.id)) {
                    // Release browser-owned blobs before their entries disappear.
                    if (childEntry.objectUrl)
                        URL.revokeObjectURL(childEntry.objectUrl)
                    entries.splice(childIndex, 1)
                }
                childIndex -= 1
            }
            if (deleted.objectUrl) URL.revokeObjectURL(deleted.objectUrl)
            deleteDialog.close()
            renderFiles()
            showToast(`deleted <strong>${escapeHTML(deleted.name)}</strong>`)
        })

        getElements<HTMLButtonElement>("[data-close]").forEach((button) => {
            button.addEventListener("click", () => {
                const dialogId = button.dataset.close
                if (!dialogId) return
                getElement<HTMLDialogElement>(`#${dialogId}`).close()
            })
        })

        backButton.addEventListener("click", () => {
            if (currentFolderId === null) return
            const currentFolder = entries.find(
                (entry) => entry.id === currentFolderId,
            )
            navigateTo(currentFolder?.parentId ?? null)
        })

        sortButtons.forEach((button) => {
            button.addEventListener("click", () => {
                const nextKey = button.dataset.sort
                if (!isSortKey(nextKey)) return
                if (sortKey === nextKey)
                    sortDirection = sortDirection === "asc" ? "desc" : "asc"
                else {
                    sortKey = nextKey
                    sortDirection = nextKey === "modified" ? "desc" : "asc"
                }
                renderFiles()
            })
        })

        fileBrowser.addEventListener("dragenter", (event) => {
            const dragEvent = event as DragEvent
            if (
                !dragEvent.dataTransfer ||
                ![...dragEvent.dataTransfer.types].includes("Files")
            )
                return
            event.preventDefault()
            dragDepth += 1
            dropMessageText.textContent = isAuthenticated
                ? "drop files into this folder"
                : "log in to upload these files"
            dropOverlay.hidden = false
        })

        fileBrowser.addEventListener("dragover", (event) => {
            const dragEvent = event as DragEvent
            if (
                !dragEvent.dataTransfer ||
                ![...dragEvent.dataTransfer.types].includes("Files")
            )
                return
            event.preventDefault()
            dragEvent.dataTransfer.dropEffect = isAuthenticated
                ? "copy"
                : "none"
        })

        fileBrowser.addEventListener("dragleave", (event) => {
            event.preventDefault()
            dragDepth = Math.max(0, dragDepth - 1)
            if (dragDepth === 0) dropOverlay.hidden = true
        })

        fileBrowser.addEventListener("drop", (event) => {
            const dragEvent = event as DragEvent
            event.preventDefault()
            dragDepth = 0
            dropOverlay.hidden = true
            handleUploads(dragEvent.dataTransfer?.files ?? null)
        })

        window.addEventListener("dragend", () => {
            dragDepth = 0
            dropOverlay.hidden = true
        })

        searchInput.addEventListener("input", filterFiles)
        document.addEventListener("click", () => {
            closeMenus()
            accountMenu.hidden = true
            authButton.setAttribute("aria-expanded", "false")
        })

        document.addEventListener("keydown", (event) => {
            // Shortcuts retreat while the user is typing or answering a dialog.
            const isTyping = /input|textarea/i.test(
                document.activeElement?.tagName ?? "",
            )
            if (event.key === "Escape") {
                closeMenus()
                accountMenu.hidden = true
                authButton.setAttribute("aria-expanded", "false")
            }
            if (
                event.key === "/" &&
                !isTyping &&
                !document.querySelector("dialog[open]")
            ) {
                event.preventDefault()
                searchInput.focus()
            }
            if (
                event.key === "Escape" &&
                document.activeElement === searchInput
            ) {
                searchInput.value = ""
                filterFiles()
                searchInput.blur()
            }
            if (
                event.altKey &&
                event.key === "ArrowLeft" &&
                !document.querySelector("dialog[open]")
            ) {
                event.preventDefault()
                backButton.click()
            }
        })

        // Begin in public view; revealing everything at once would be gauche.
        setAuthenticated(false)
        switchSettingsPanel("account")
        renderUsers()
        renderFiles()
    })
}
