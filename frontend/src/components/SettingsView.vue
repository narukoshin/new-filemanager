<template>
    <section
        class="settings-view"
        id="settings-view"
        aria-labelledby="settings-title"
        tabindex="-1"
        hidden
    >
        <header class="settings-header">
            <button class="settings-return" id="settings-return" type="button">
                ← back to files
            </button>
            <p class="eyebrow">node administration · private</p>
            <h1 class="settings-title" id="settings-title">
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
                    class="settings-tab"
                    id="settings-tab-account"
                    type="button"
                    role="tab"
                    aria-selected="true"
                    aria-controls="settings-account"
                    data-settings-tab="account"
                >
                    account
                </button>
                <button
                    class="settings-tab"
                    id="settings-tab-users"
                    type="button"
                    role="tab"
                    aria-selected="false"
                    aria-controls="settings-users"
                    data-settings-tab="users"
                >
                    users
                </button>
                <button
                    class="settings-tab"
                    id="settings-tab-site"
                    type="button"
                    role="tab"
                    aria-selected="false"
                    aria-controls="settings-site"
                    data-settings-tab="site"
                >
                    site
                </button>
                <button
                    class="settings-tab"
                    id="settings-tab-security"
                    type="button"
                    role="tab"
                    aria-selected="false"
                    aria-controls="settings-security"
                    data-settings-tab="security"
                >
                    security
                </button>
            </nav>

            <div class="settings-content">
                <section
                    class="settings-panel"
                    id="settings-account"
                    role="tabpanel"
                    aria-labelledby="settings-tab-account"
                    data-settings-panel="account"
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
                                <strong id="identity-name">naru</strong
                                ><span>full node access · user 001</span>
                            </div>
                        </div>
                    </div>

                    <form class="settings-card" id="account-settings-form">
                        <div class="settings-card-head">
                            <h3 class="settings-card-title">credentials</h3>
                            <span class="settings-card-note"
                                >frontend preview</span
                            >
                        </div>
                        <div class="settings-card-body settings-grid">
                            <label class="field full"
                                >username
                                <input
                                    class="field-input"
                                    id="account-username"
                                    autocomplete="username"
                                    maxlength="40"
                                    required
                                />
                                <span class="field-help"
                                    >Used to sign in and shown in the file
                                    path.</span
                                >
                            </label>
                            <label class="field"
                                >current password
                                <input
                                    class="field-input"
                                    id="account-current-password"
                                    type="password"
                                    autocomplete="current-password"
                                />
                            </label>
                            <span></span>
                            <label class="field"
                                >new password
                                <input
                                    class="field-input"
                                    id="account-new-password"
                                    type="password"
                                    autocomplete="new-password"
                                    minlength="8"
                                />
                            </label>
                            <label class="field"
                                >confirm new password
                                <input
                                    class="field-input"
                                    id="account-confirm-password"
                                    type="password"
                                    autocomplete="new-password"
                                    minlength="8"
                                />
                            </label>
                            <p
                                class="field-error full"
                                id="account-settings-error"
                                aria-live="polite"
                            ></p>
                        </div>
                        <div class="settings-actions">
                            <button class="dialog-button primary" type="submit">
                                save account
                            </button>
                        </div>
                    </form>
                </section>

                <section
                    class="settings-panel"
                    id="settings-users"
                    role="tabpanel"
                    aria-labelledby="settings-tab-users"
                    data-settings-panel="users"
                    hidden
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
                                <span id="user-count">3</span> identities
                            </h3>
                            <button
                                class="dialog-button primary"
                                id="add-user-button"
                                type="button"
                            >
                                + new user
                            </button>
                        </div>
                        <div class="users-list" id="settings-user-list"></div>
                    </div>
                    <p class="settings-warning">
                        <strong>Permissions are server-enforced.</strong>
                        The Go backend must hash passwords, check roles on every
                        action, and prevent the final owner from being removed.
                    </p>
                </section>

                <section
                    class="settings-panel"
                    id="settings-site"
                    role="tabpanel"
                    aria-labelledby="settings-tab-site"
                    data-settings-panel="site"
                    hidden
                >
                    <header class="settings-section-head">
                        <h2 class="settings-section-title">site</h2>
                        <p class="settings-section-copy">
                            Control public-facing labels, limits and basic
                            file-node behavior.
                        </p>
                    </header>
                    <form class="settings-card" id="site-settings-form">
                        <div class="settings-card-head">
                            <h3 class="settings-card-title">general</h3>
                            <span class="settings-card-note">node 01</span>
                        </div>
                        <div class="settings-card-body settings-grid">
                            <label class="field"
                                >site label
                                <input
                                    class="field-input"
                                    id="site-label-input"
                                    value="files"
                                    maxlength="32"
                                    required
                                />
                            </label>
                            <label class="field"
                                >node name
                                <input
                                    class="field-input"
                                    id="node-name-input"
                                    value="FILE NODE 01"
                                    maxlength="48"
                                    required
                                />
                            </label>
                            <label class="field full"
                                >welcome message
                                <input
                                    class="field-input"
                                    id="site-intro-input"
                                    value="a quiet place for files, builds and things worth keeping around."
                                    maxlength="140"
                                    required
                                />
                            </label>
                            <label class="field"
                                >maximum upload size
                                <input
                                    class="field-input"
                                    id="upload-limit-input"
                                    type="number"
                                    value="25"
                                    min="1"
                                    max="5000"
                                    required
                                />
                                <span class="field-help"
                                    >Megabytes per file.</span
                                >
                            </label>
                            <label class="field"
                                >default sort
                                <select
                                    class="field-input"
                                    id="default-sort-input"
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
                                    id="public-downloads-input"
                                    type="checkbox"
                                    checked /><span
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
                                    id="file-previews-input"
                                    type="checkbox"
                                    checked /><span
                                    class="switch-track"
                                    aria-hidden="true"
                                ></span
                            ></span>
                        </label>
                    </div>
                </section>

                <section
                    class="settings-panel"
                    id="settings-security"
                    role="tabpanel"
                    aria-labelledby="settings-tab-security"
                    data-settings-panel="security"
                    hidden
                >
                    <header class="settings-section-head">
                        <h2 class="settings-section-title">security</h2>
                        <p class="settings-section-copy">
                            Set session policy and safeguards for private areas
                            of the archive.
                        </p>
                    </header>
                    <form class="settings-card" id="security-settings-form">
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
                                    id="folder-protection-input"
                                    type="checkbox"
                                    checked /><span
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
                                    id="audit-log-input"
                                    type="checkbox"
                                    checked /><span
                                    class="switch-track"
                                    aria-hidden="true"
                                ></span
                            ></span>
                        </label>
                        <div class="settings-card-body settings-grid">
                            <label class="field"
                                >session lifetime
                                <select
                                    class="field-input"
                                    id="session-lifetime-input"
                                >
                                    <option value="1">1 hour</option>
                                    <option value="8" selected>8 hours</option>
                                    <option value="24">24 hours</option>
                                    <option value="168">7 days</option>
                                </select>
                            </label>
                            <label class="field"
                                >failed-login limit
                                <input
                                    class="field-input"
                                    id="login-limit-input"
                                    type="number"
                                    value="5"
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
