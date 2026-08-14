<script setup lang="ts">
    import { reactive, ref } from "vue"
    import type { FileManager } from "../composables/useFileManager"
    import type { SettingsPanel } from "../types/fileManager"
    import UserList from "./UserList.vue"

    const { manager } = defineProps<{ manager: FileManager }>()
    const panels: SettingsPanel[] = ["account", "users", "site", "security"]
    const account = reactive({
        username: manager.currentUsername,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })
    const site = reactive({ ...manager.siteSettings })
    const security = reactive({ ...manager.securitySettings })
    const accountError = ref("")

    /** Selects a panel and supports the vertical tab keyboard pattern. */
    const selectPanel = (panel: SettingsPanel): void => {
        manager.settingsPanel = panel
        if (panel === "account") account.username = manager.currentUsername
    }

    /** Moves through settings tabs without involving global DOM selectors. */
    const movePanel = (event: KeyboardEvent, index: number): void => {
        if (
            !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(
                event.key,
            )
        )
            return
        event.preventDefault()
        const forward = event.key === "ArrowDown" || event.key === "ArrowRight"
        const next =
            panels[(index + (forward ? 1 : -1) + panels.length) % panels.length]
        if (next) selectPanel(next)
    }

    /** Validates and saves the account form through the controller. */
    const submitAccount = (): void => {
        accountError.value = manager.saveAccount(account) ?? ""
        if (accountError.value) return
        account.currentPassword = ""
        account.newPassword = ""
        account.confirmPassword = ""
    }

    /** Applies the site draft only after the user asks to save it. */
    const submitSite = (): void => {
        manager.saveSiteSettings({ ...site })
    }

    /** Applies the security draft to the temporary settings state. */
    const submitSecurity = (): void => {
        manager.saveSecuritySettings({ ...security })
    }
</script>

<template>
    <section
        id="settings-view"
        class="settings-view"
        aria-labelledby="settings-title"
        tabindex="-1"
    >
        <header class="settings-header">
            <button
                class="settings-return"
                type="button"
                @click="manager.showBrowser"
            >
                ← back to files
            </button>
            <p class="eyebrow">node administration · private</p>
            <h1 id="settings-title" class="settings-title">
                <span class="title-prefix">#</span>settings<span class="accent"
                    >.</span
                >panel
            </h1>
            <p class="intro">
                manage identities, access rules and the way this file node
                behaves.
            </p>
        </header>

        <div class="settings-layout">
            <nav
                class="settings-nav"
                aria-label="Settings sections"
                role="tablist"
                aria-orientation="vertical"
            >
                <p class="settings-nav-label">configuration</p>
                <button
                    v-for="(panel, index) in panels"
                    :id="`settings-tab-${panel}`"
                    :key="panel"
                    class="settings-tab"
                    type="button"
                    role="tab"
                    :tabindex="manager.settingsPanel === panel ? 0 : -1"
                    :aria-selected="manager.settingsPanel === panel"
                    :aria-controls="`settings-${panel}`"
                    @click="selectPanel(panel)"
                    @keydown="movePanel($event, index)"
                >
                    {{ panel }}
                </button>
            </nav>

            <div class="settings-content">
                <section
                    v-if="manager.settingsPanel === 'account'"
                    id="settings-account"
                    class="settings-panel"
                    role="tabpanel"
                    aria-labelledby="settings-tab-account"
                >
                    <header class="settings-section-head">
                        <h2 class="settings-section-title">your account</h2>
                        <p class="settings-section-copy">
                            Update the identity used for this session and rotate
                            your password.
                        </p>
                    </header>
                    <div class="settings-card">
                        <div class="settings-card-head">
                            <h3 class="settings-card-title">identity</h3>
                            <span class="settings-badge">owner</span>
                        </div>
                        <div class="settings-card-body identity-row">
                            <span class="identity-avatar" aria-hidden="true"
                                >Þ</span
                            >
                            <div class="identity-meta">
                                <strong>{{ manager.currentUsername }}</strong>
                                <span>full node access · user 001</span>
                            </div>
                        </div>
                    </div>
                    <form class="settings-card" @submit.prevent="submitAccount">
                        <div class="settings-card-head">
                            <h3 class="settings-card-title">credentials</h3>
                            <span class="settings-card-note"
                                >frontend preview</span
                            >
                        </div>
                        <div class="settings-card-body settings-grid">
                            <label class="field full">
                                username
                                <input
                                    v-model="account.username"
                                    class="field-input"
                                    autocomplete="username"
                                    maxlength="40"
                                    required
                                    @input="accountError = ''"
                                />
                                <span class="field-help"
                                    >Used to sign in and shown in the file
                                    path.</span
                                >
                            </label>
                            <label class="field">
                                current password
                                <input
                                    v-model="account.currentPassword"
                                    class="field-input"
                                    type="password"
                                    autocomplete="current-password"
                                    @input="accountError = ''"
                                />
                            </label>
                            <span></span>
                            <label class="field">
                                new password
                                <input
                                    v-model="account.newPassword"
                                    class="field-input"
                                    type="password"
                                    autocomplete="new-password"
                                    minlength="8"
                                    @input="accountError = ''"
                                />
                            </label>
                            <label class="field">
                                confirm new password
                                <input
                                    v-model="account.confirmPassword"
                                    class="field-input"
                                    type="password"
                                    autocomplete="new-password"
                                    minlength="8"
                                    @input="accountError = ''"
                                />
                            </label>
                            <p class="field-error full" aria-live="polite">
                                {{ accountError }}
                            </p>
                        </div>
                        <div class="settings-actions">
                            <button class="dialog-button primary" type="submit">
                                save account
                            </button>
                        </div>
                    </form>
                </section>

                <section
                    v-else-if="manager.settingsPanel === 'users'"
                    id="settings-users"
                    class="settings-panel"
                    role="tabpanel"
                    aria-labelledby="settings-tab-users"
                >
                    <header class="settings-section-head">
                        <h2 class="settings-section-title">users</h2>
                        <p class="settings-section-copy">
                            Create accounts and decide who may manage files or
                            the whole node.
                        </p>
                    </header>
                    <div class="settings-card">
                        <div class="settings-card-head">
                            <h3 class="settings-card-title">
                                {{ manager.users.length }} identities
                            </h3>
                            <button
                                class="dialog-button primary"
                                type="button"
                                @click="manager.openDialog('user')"
                            >
                                + new user
                            </button>
                        </div>
                        <UserList :manager="manager" />
                    </div>
                    <p class="settings-warning">
                        <strong>Permissions are server-enforced.</strong>
                        The Go backend must hash passwords, check roles on every
                        action, and prevent the final owner from being removed.
                    </p>
                </section>

                <section
                    v-else-if="manager.settingsPanel === 'site'"
                    id="settings-site"
                    class="settings-panel"
                    role="tabpanel"
                    aria-labelledby="settings-tab-site"
                >
                    <header class="settings-section-head">
                        <h2 class="settings-section-title">site</h2>
                        <p class="settings-section-copy">
                            Control public-facing labels, limits and basic
                            file-node behavior.
                        </p>
                    </header>
                    <form class="settings-card" @submit.prevent="submitSite">
                        <div class="settings-card-head">
                            <h3 class="settings-card-title">general</h3>
                            <span class="settings-card-note">node 01</span>
                        </div>
                        <div class="settings-card-body settings-grid">
                            <label class="field">
                                site label
                                <input
                                    v-model="site.label"
                                    class="field-input"
                                    maxlength="32"
                                    required
                                />
                            </label>
                            <label class="field">
                                node name
                                <input
                                    v-model="site.nodeName"
                                    class="field-input"
                                    maxlength="48"
                                    required
                                />
                            </label>
                            <label class="field full">
                                welcome message
                                <input
                                    v-model="site.intro"
                                    class="field-input"
                                    maxlength="140"
                                    required
                                />
                            </label>
                            <label class="field">
                                maximum upload size
                                <input
                                    v-model.number="site.maxUploadMegabytes"
                                    class="field-input"
                                    type="number"
                                    min="1"
                                    max="5000"
                                    required
                                />
                                <span class="field-help"
                                    >Megabytes per file.</span
                                >
                            </label>
                            <label class="field">
                                default sort
                                <select
                                    v-model="site.defaultSort"
                                    class="field-input"
                                >
                                    <option value="name">name</option>
                                    <option value="modified">
                                        last modified
                                    </option>
                                    <option value="size">size</option>
                                </select>
                            </label>
                        </div>
                        <div class="settings-actions">
                            <button class="dialog-button primary" type="submit">
                                save site
                            </button>
                        </div>
                    </form>
                    <div class="settings-card">
                        <div class="settings-card-head">
                            <h3 class="settings-card-title">public access</h3>
                        </div>
                        <label class="switch-row">
                            <span class="switch-copy"
                                ><strong>allow public downloads</strong
                                ><span
                                    >Signed-out visitors can download files they
                                    can see.</span
                                ></span
                            >
                            <span class="switch"
                                ><input
                                    v-model="site.publicDownloads"
                                    type="checkbox" /><span
                                    class="switch-track"
                                    aria-hidden="true"
                                ></span
                            ></span>
                        </label>
                        <label class="switch-row">
                            <span class="switch-copy"
                                ><strong>show file previews</strong
                                ><span
                                    >Render supported images and text inside the
                                    browser.</span
                                ></span
                            >
                            <span class="switch"
                                ><input
                                    v-model="site.filePreviews"
                                    type="checkbox" /><span
                                    class="switch-track"
                                    aria-hidden="true"
                                ></span
                            ></span>
                        </label>
                    </div>
                </section>

                <section
                    v-else
                    id="settings-security"
                    class="settings-panel"
                    role="tabpanel"
                    aria-labelledby="settings-tab-security"
                >
                    <header class="settings-section-head">
                        <h2 class="settings-section-title">security</h2>
                        <p class="settings-section-copy">
                            Set session policy and safeguards for private areas
                            of the archive.
                        </p>
                    </header>
                    <form
                        class="settings-card"
                        @submit.prevent="submitSecurity"
                    >
                        <div class="settings-card-head">
                            <h3 class="settings-card-title">access policy</h3>
                            <span class="settings-card-note"
                                >recommended defaults</span
                            >
                        </div>
                        <label class="switch-row">
                            <span class="switch-copy"
                                ><strong>require folder protection</strong
                                ><span
                                    >Allow owners and admins to create
                                    password-protected folders.</span
                                ></span
                            >
                            <span class="switch"
                                ><input
                                    v-model="security.folderProtection"
                                    type="checkbox" /><span
                                    class="switch-track"
                                    aria-hidden="true"
                                ></span
                            ></span>
                        </label>
                        <label class="switch-row">
                            <span class="switch-copy"
                                ><strong>record destructive actions</strong
                                ><span
                                    >Keep an audit event for deletes, renames
                                    and permission changes.</span
                                ></span
                            >
                            <span class="switch"
                                ><input
                                    v-model="security.auditLog"
                                    type="checkbox" /><span
                                    class="switch-track"
                                    aria-hidden="true"
                                ></span
                            ></span>
                        </label>
                        <div class="settings-card-body settings-grid">
                            <label class="field">
                                session lifetime
                                <select
                                    v-model.number="security.sessionLifetime"
                                    class="field-input"
                                >
                                    <option :value="1">1 hour</option>
                                    <option :value="8">8 hours</option>
                                    <option :value="24">24 hours</option>
                                    <option :value="168">7 days</option>
                                </select>
                            </label>
                            <label class="field">
                                failed-login limit
                                <input
                                    v-model.number="security.loginLimit"
                                    class="field-input"
                                    type="number"
                                    min="1"
                                    max="20"
                                    required
                                />
                            </label>
                        </div>
                        <div class="settings-actions">
                            <button class="dialog-button primary" type="submit">
                                save security
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>

        <footer class="footer">
            <span class="footer-command">admin console / frontend preview</span>
            <span>ÞERXWOLD // SETTINGS</span>
        </footer>
    </section>
</template>
