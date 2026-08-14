<script setup lang="ts">
    import { computed, nextTick, ref, watch } from "vue"
    import type { FileManager } from "../composables/fileManager"
    import { typeDetails } from "../utils/filePresentation"
    import type { UserRole } from "../types/fileManager"
    import { formatFileSize } from "../utils/fileEntries"

    const { manager } = defineProps<{ manager: FileManager }>()
    const modal = ref<HTMLDialogElement | null>(null)
    const username = ref("")
    const loginPassword = ref("")
    const unlockPassword = ref("")
    const currentFolderPassword = ref("")
    const newFolderPassword = ref("")
    const confirmFolderPassword = ref("")
    const name = ref("")
    const managedUsername = ref("")
    const managedRole = ref<UserRole>("editor")
    const managedPassword = ref("")
    const error = ref("")

    const previewDetails = computed(() => {
        const type = manager.activeEntry?.type ?? "generic"
        return typeDetails[type] ?? typeDetails.generic
    })

    const previewMessage = computed(() => {
        const entry = manager.activeEntry
        if (!entry) return "preview unavailable"
        return entry.type === "image"
            ? "image preview placeholder · connect the storage URL later"
            : `${entry.type} preview · ${formatFileSize(entry.size)}`
    })

    /** Restores clean form state whenever a different modal enters the scene. */
    const resetDialogState = (): void => {
        error.value = ""
        username.value = ""
        loginPassword.value = ""
        unlockPassword.value = ""
        currentFolderPassword.value = ""
        newFolderPassword.value = ""
        confirmFolderPassword.value = ""
        name.value =
            manager.dialog.nameMode === "rename"
                ? (manager.activeEntry?.name ?? "")
                : ""
        managedUsername.value = manager.activeUser?.username ?? ""
        managedRole.value = manager.activeUser?.role ?? "editor"
        managedPassword.value = ""
    }

    /** Hands the login form to the prototype session controller. */
    const submitLogin = async (): Promise<void> => {
        error.value =
            (await manager.login(username.value, loginPassword.value)) ?? ""
    }

    /** Attempts the current folder challenge without leaking it into markup. */
    const submitUnlock = async (): Promise<void> => {
        error.value = (await manager.unlockFolder(unlockPassword.value)) ?? ""
    }

    /** Saves folder protection or password rotation and reports friendly errors. */
    const submitSecurity = async (): Promise<void> => {
        error.value =
            (await manager.saveFolderSecurity(
                currentFolderPassword.value,
                newFolderPassword.value,
                confirmFolderPassword.value,
            )) ?? ""
    }

    /** Creates or renames the active entry through reactive state. */
    const submitName = async (): Promise<void> => {
        error.value = (await manager.saveName(name.value)) ?? ""
    }

    /** Creates or edits a managed identity in the prototype. */
    const submitUser = async (): Promise<void> => {
        error.value =
            (await manager.saveUser({
                username: managedUsername.value,
                role: managedRole.value,
                password: managedPassword.value,
            })) ?? ""
    }

    /** Mirrors reactive dialog state into the native modal browser API. */
    const syncModal = async (): Promise<void> => {
        const kind = manager.dialog.kind
        if (!kind) return

        resetDialogState()
        await nextTick()
        if (manager.dialog.kind !== kind) return
        if (modal.value && !modal.value.open) modal.value.showModal()
    }

    watch(() => manager.dialog.kind, syncModal)
</script>

<template>
    <dialog
        v-if="manager.dialog.kind"
        ref="modal"
        :class="{ 'preview-dialog': manager.dialog.kind === 'preview' }"
        :aria-labelledby="
            manager.dialog.kind === 'preview' ? 'preview-title' : 'dialog-title'
        "
        @cancel.prevent="manager.closeDialog"
        @close="manager.closeDialog"
    >
        <div
            v-if="manager.dialog.kind === 'preview' && manager.activeEntry"
            class="preview-shell"
        >
            <header class="preview-head">
                <div class="preview-heading">
                    <h2 id="preview-title" class="preview-title">
                        {{ manager.activeEntry.name }}
                    </h2>
                    <p class="preview-meta">
                        {{ manager.activeEntry.type }} ·
                        {{ formatFileSize(manager.activeEntry.size) }} ·
                        modified {{ manager.activeEntry.modified }}
                    </p>
                </div>
                <button
                    class="preview-close"
                    type="button"
                    aria-label="Close preview"
                    @click="manager.closeDialog"
                >
                    ×
                </button>
            </header>
            <div class="preview-content">
                <pre
                    v-if="manager.activeEntry.type === 'text'"
                    class="preview-text"
                    >{{
                        manager.activeEntry.content ??
                        `// ${manager.activeEntry.name}\n\nText preview is available when file content is loaded.`
                    }}</pre>
                <img
                    v-else-if="
                        manager.activeEntry.type === 'image' &&
                        manager.activeEntry.objectUrl
                    "
                    class="preview-image"
                    :src="manager.activeEntry.objectUrl"
                    :alt="`Preview of ${manager.activeEntry.name}`"
                />
                <div v-else class="preview-placeholder">
                    <svg
                        class="pixel-icon"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                    >
                        <use :href="`#icon-${previewDetails.icon}`" />
                    </svg>
                    <span>{{ previewMessage }}</span>
                </div>
            </div>
            <footer class="preview-foot">
                <button
                    class="dialog-button"
                    type="button"
                    @click="manager.downloadEntry(manager.activeEntry)"
                >
                    download ↓
                </button>
                <button
                    class="dialog-button primary"
                    type="button"
                    @click="manager.closeDialog"
                >
                    done
                </button>
            </footer>
        </div>

        <form
            v-else-if="manager.dialog.kind === 'login'"
            class="dialog-form"
            @submit.prevent="submitLogin"
        >
            <p class="dialog-kicker">private access</p>
            <h2 id="dialog-title" class="dialog-title">
                log in to file node 01
            </h2>
            <p class="dialog-copy">
                Frontend preview: any non-empty credentials unlock file
                management for this session.
            </p>
            <label class="field"
                >username<input
                    v-model="username"
                    class="field-input"
                    name="username"
                    autocomplete="username"
                    required
            /></label>
            <label class="field"
                >password<input
                    v-model="loginPassword"
                    class="field-input"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
            /></label>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    @click="manager.closeDialog"
                >
                    cancel
                </button>
                <button class="dialog-button primary" type="submit">
                    log in →
                </button>
            </div>
        </form>

        <form
            v-else-if="manager.dialog.kind === 'unlock' && manager.activeEntry"
            class="dialog-form"
            @submit.prevent="submitUnlock"
        >
            <p class="dialog-kicker">protected folder</p>
            <h2 id="dialog-title" class="dialog-title">
                unlock “{{ manager.activeEntry.name }}”
            </h2>
            <p class="dialog-copy">
                Enter the folder password to continue. It will remain unlocked
                for this session.
            </p>
            <p class="security-note">
                Frontend preview password: <code>threshold</code>
            </p>
            <label class="field"
                >folder password<input
                    v-model="unlockPassword"
                    class="field-input"
                    type="password"
                    autocomplete="off"
                    required
                    @input="error = ''"
            /></label>
            <p class="field-error" aria-live="polite">{{ error }}</p>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    @click="manager.closeDialog"
                >
                    cancel
                </button>
                <button class="dialog-button primary" type="submit">
                    unlock →
                </button>
            </div>
        </form>

        <form
            v-else-if="
                manager.dialog.kind === 'security' && manager.activeEntry
            "
            class="dialog-form"
            @submit.prevent="submitSecurity"
        >
            <p class="dialog-kicker">folder security</p>
            <h2 id="dialog-title" class="dialog-title">
                {{
                    manager.dialog.securityMode === "protect"
                        ? "protect folder"
                        : "change folder password"
                }}
            </h2>
            <p class="dialog-copy">
                {{
                    manager.dialog.securityMode === "protect"
                        ? `Require a password before “${manager.activeEntry.name}” can be opened.`
                        : `Replace the password for “${manager.activeEntry.name}”.`
                }}
            </p>
            <label v-if="manager.dialog.securityMode === 'change'" class="field"
                >current password<input
                    v-model="currentFolderPassword"
                    class="field-input"
                    type="password"
                    autocomplete="off"
                    required
                    @input="error = ''"
            /></label>
            <label class="field"
                >new password<input
                    v-model="newFolderPassword"
                    class="field-input"
                    type="password"
                    autocomplete="new-password"
                    minlength="4"
                    required
                    @input="error = ''"
            /></label>
            <label class="field"
                >confirm new password<input
                    v-model="confirmFolderPassword"
                    class="field-input"
                    type="password"
                    autocomplete="new-password"
                    minlength="4"
                    required
                    @input="error = ''"
            /></label>
            <p class="field-error" aria-live="polite">{{ error }}</p>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    @click="manager.closeDialog"
                >
                    cancel
                </button>
                <button class="dialog-button primary" type="submit">
                    {{
                        manager.dialog.securityMode === "protect"
                            ? "protect folder"
                            : "change password"
                    }}
                </button>
            </div>
        </form>

        <form
            v-else-if="manager.dialog.kind === 'name'"
            class="dialog-form"
            @submit.prevent="submitName"
        >
            <p class="dialog-kicker">
                {{
                    manager.dialog.nameMode === "rename"
                        ? "file action"
                        : "new directory"
                }}
            </p>
            <h2 id="dialog-title" class="dialog-title">
                {{
                    manager.dialog.nameMode === "rename"
                        ? "rename item"
                        : "create folder"
                }}
            </h2>
            <p class="dialog-copy">
                {{
                    manager.dialog.nameMode === "rename"
                        ? `Rename “${manager.activeEntry?.name ?? ""}”.`
                        : "Add a folder to the current path."
                }}
            </p>
            <label class="field"
                >name<input
                    v-model="name"
                    class="field-input"
                    required
                    maxlength="120"
                    @input="error = ''"
            /></label>
            <p class="field-error" aria-live="polite">{{ error }}</p>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    @click="manager.closeDialog"
                >
                    cancel
                </button>
                <button class="dialog-button primary" type="submit">
                    {{
                        manager.dialog.nameMode === "rename"
                            ? "save name"
                            : "create folder"
                    }}
                </button>
            </div>
        </form>

        <form
            v-else-if="manager.dialog.kind === 'delete' && manager.activeEntry"
            class="dialog-form"
            @submit.prevent="manager.deleteEntry"
        >
            <p class="dialog-kicker">destructive action</p>
            <h2 id="dialog-title" class="dialog-title">delete this item?</h2>
            <p class="dialog-copy">
                This will remove
                <strong>“{{ manager.activeEntry.name }}”</strong
                >{{
                    manager.activeEntry.type === "folder"
                        ? " and everything inside it"
                        : ""
                }}
                from the current frontend session.
            </p>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    @click="manager.closeDialog"
                >
                    cancel
                </button>
                <button class="dialog-button danger" type="submit">
                    delete permanently
                </button>
            </div>
        </form>

        <form
            v-else-if="manager.dialog.kind === 'user'"
            class="dialog-form"
            @submit.prevent="submitUser"
        >
            <p class="dialog-kicker">identity management</p>
            <h2 id="dialog-title" class="dialog-title">
                {{ manager.activeUser ? "edit user" : "create user" }}
            </h2>
            <p class="dialog-copy">
                {{
                    manager.activeUser
                        ? `Change access details for “${manager.activeUser.username}”.`
                        : "Add an identity that can access this file node."
                }}
            </p>
            <label class="field"
                >username<input
                    v-model="managedUsername"
                    class="field-input"
                    autocomplete="off"
                    maxlength="40"
                    required
                    @input="error = ''"
            /></label>
            <label class="field"
                >role<select v-model="managedRole" class="field-input">
                    <option value="viewer">viewer · browse and download</option>
                    <option value="editor">editor · manage files</option>
                    <option value="admin">
                        admin · manage files and users
                    </option>
                </select></label
            >
            <label class="field"
                >{{ manager.activeUser ? "new password" : "temporary password"
                }}<input
                    v-model="managedPassword"
                    class="field-input"
                    type="password"
                    autocomplete="new-password"
                    minlength="8"
                    :required="!manager.activeUser"
                /><span class="field-help">{{
                    manager.activeUser
                        ? "Leave empty to keep the current password."
                        : "The user should replace this after signing in."
                }}</span></label
            >
            <p class="field-error" aria-live="polite">{{ error }}</p>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    @click="manager.closeDialog"
                >
                    cancel
                </button>
                <button class="dialog-button primary" type="submit">
                    {{ manager.activeUser ? "save user" : "create user" }}
                </button>
            </div>
        </form>
    </dialog>

    <div
        v-if="manager.toastMessage"
        class="toast"
        role="status"
        aria-live="polite"
    >
        {{ manager.toastMessage }}
    </div>
</template>
