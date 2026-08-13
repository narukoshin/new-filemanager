<template>
    <dialog
        class="preview-dialog"
        id="preview-dialog"
        aria-labelledby="preview-title"
    >
        <div class="preview-shell">
            <header class="preview-head">
                <div class="preview-heading">
                    <h2 class="preview-title" id="preview-title">
                        file preview
                    </h2>
                    <p class="preview-meta" id="preview-meta"></p>
                </div>
                <button
                    class="preview-close"
                    type="button"
                    data-close="preview-dialog"
                    aria-label="Close preview"
                >
                    ×
                </button>
            </header>
            <div class="preview-content" id="preview-content"></div>
            <footer class="preview-foot">
                <button
                    class="dialog-button"
                    id="preview-download"
                    type="button"
                >
                    download ↓
                </button>
                <button
                    class="dialog-button primary"
                    type="button"
                    data-close="preview-dialog"
                >
                    done
                </button>
            </footer>
        </div>
    </dialog>

    <dialog id="login-dialog" aria-labelledby="login-title">
        <form class="dialog-form" id="login-form">
            <p class="dialog-kicker">private access</p>
            <h2 class="dialog-title" id="login-title">
                log in to file node 01
            </h2>
            <p class="dialog-copy">
                Frontend preview: any non-empty credentials unlock file
                management for this session.
            </p>
            <label class="field"
                >username
                <input
                    class="field-input"
                    id="username"
                    name="username"
                    autocomplete="username"
                    required
                />
            </label>
            <label class="field"
                >password
                <input
                    class="field-input"
                    name="password"
                    type="password"
                    autocomplete="current-password"
                    required
                />
            </label>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    data-close="login-dialog"
                >
                    cancel
                </button>
                <button class="dialog-button primary" type="submit">
                    log in →
                </button>
            </div>
        </form>
    </dialog>

    <dialog id="unlock-dialog" aria-labelledby="unlock-title">
        <form class="dialog-form" id="unlock-form">
            <p class="dialog-kicker">protected folder</p>
            <h2 class="dialog-title" id="unlock-title">
                unlock <span id="unlock-name"></span>
            </h2>
            <p class="dialog-copy">
                Enter the folder password to continue. It will remain unlocked
                for this session.
            </p>
            <p class="security-note">
                Frontend preview password: <code>threshold</code>
            </p>
            <label class="field"
                >folder password
                <input
                    class="field-input"
                    id="unlock-password"
                    type="password"
                    autocomplete="off"
                    required
                />
            </label>
            <p class="field-error" id="unlock-error" aria-live="polite"></p>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    data-close="unlock-dialog"
                >
                    cancel
                </button>
                <button class="dialog-button primary" type="submit">
                    unlock →
                </button>
            </div>
        </form>
    </dialog>

    <dialog id="security-dialog" aria-labelledby="security-title">
        <form class="dialog-form" id="security-form">
            <p class="dialog-kicker">folder security</p>
            <h2 class="dialog-title" id="security-title">protect folder</h2>
            <p class="dialog-copy" id="security-copy">
                Require a password before this folder can be opened.
            </p>
            <label class="field" id="current-password-field" hidden
                >current password
                <input
                    class="field-input"
                    id="current-password"
                    type="password"
                    autocomplete="off"
                />
            </label>
            <label class="field"
                >new password
                <input
                    class="field-input"
                    id="new-password"
                    type="password"
                    autocomplete="new-password"
                    minlength="4"
                    required
                />
            </label>
            <label class="field"
                >confirm new password
                <input
                    class="field-input"
                    id="confirm-password"
                    type="password"
                    autocomplete="new-password"
                    minlength="4"
                    required
                />
            </label>
            <p class="field-error" id="security-error" aria-live="polite"></p>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    data-close="security-dialog"
                >
                    cancel
                </button>
                <button
                    class="dialog-button primary"
                    id="security-submit"
                    type="submit"
                >
                    protect folder
                </button>
            </div>
        </form>
    </dialog>

    <dialog id="name-dialog" aria-labelledby="name-title">
        <form class="dialog-form" id="name-form">
            <p class="dialog-kicker" id="name-kicker">file action</p>
            <h2 class="dialog-title" id="name-title">rename item</h2>
            <p class="dialog-copy" id="name-copy">Choose a new name.</p>
            <label class="field"
                ><span id="name-label">name</span>
                <input
                    class="field-input"
                    id="name-input"
                    required
                    maxlength="120"
                />
            </label>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    data-close="name-dialog"
                >
                    cancel
                </button>
                <button
                    class="dialog-button primary"
                    id="name-submit"
                    type="submit"
                >
                    save
                </button>
            </div>
        </form>
    </dialog>

    <dialog id="delete-dialog" aria-labelledby="delete-title">
        <form class="dialog-form" id="delete-form">
            <p class="dialog-kicker">destructive action</p>
            <h2 class="dialog-title" id="delete-title">delete this item?</h2>
            <p class="dialog-copy" id="delete-copy">
                This will remove <strong id="delete-name"></strong> from the
                current frontend session.
            </p>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    data-close="delete-dialog"
                >
                    cancel
                </button>
                <button class="dialog-button danger" type="submit">
                    delete permanently
                </button>
            </div>
        </form>
    </dialog>

    <dialog id="user-dialog" aria-labelledby="user-dialog-title">
        <form class="dialog-form" id="user-form">
            <p class="dialog-kicker" id="user-dialog-kicker">
                identity management
            </p>
            <h2 class="dialog-title" id="user-dialog-title">create user</h2>
            <p class="dialog-copy" id="user-dialog-copy">
                Add an identity that can access this file node.
            </p>
            <label class="field"
                >username
                <input
                    class="field-input"
                    id="managed-username"
                    autocomplete="off"
                    maxlength="40"
                    required
                />
            </label>
            <label class="field"
                >role
                <select class="field-input" id="managed-role">
                    <option value="viewer">viewer · browse and download</option>
                    <option value="editor" selected>
                        editor · manage files
                    </option>
                    <option value="admin">
                        admin · manage files and users
                    </option>
                </select>
            </label>
            <label class="field"
                ><span id="managed-password-label">temporary password</span>
                <input
                    class="field-input"
                    id="managed-password"
                    type="password"
                    autocomplete="new-password"
                    minlength="8"
                    required
                />
                <span class="field-help" id="managed-password-help"
                    >The user should replace this after signing in.</span
                >
            </label>
            <p class="field-error" id="user-form-error" aria-live="polite"></p>
            <div class="dialog-actions">
                <button
                    class="dialog-button"
                    type="button"
                    data-close="user-dialog"
                >
                    cancel
                </button>
                <button
                    class="dialog-button primary"
                    id="user-form-submit"
                    type="submit"
                >
                    create user
                </button>
            </div>
        </form>
    </dialog>

    <div class="toast" id="toast" role="status" aria-live="polite" hidden></div>
</template>
