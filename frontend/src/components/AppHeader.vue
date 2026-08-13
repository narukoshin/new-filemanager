<template>
    <header class="topbar">
        <div class="brand">
            <span class="brand-project">PROJECT</span>
            <span class="brand-mark"
                ><span class="brand-thorn">Þ</span>ERXWOLD</span
            >
            <span class="slash">/</span>
            <span id="brand-app-name">files</span>
        </div>

        <div class="top-actions">
            <div class="status">
                <span class="status-dot" aria-hidden="true"></span>
                <span class="status-label" id="status-label">public node</span>
            </div>
            <div class="account">
                <button
                    class="login"
                    id="auth-button"
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded="false"
                >
                    <svg
                        class="pixel-icon"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                    >
                        <use id="auth-icon" href="#icon-login" />
                    </svg>
                    <span id="auth-label">log in</span>
                </button>
                <div class="account-menu" id="account-menu" role="menu" hidden>
                    <div class="account-summary">
                        signed in as<strong id="account-name">naru</strong>
                    </div>
                    <button
                        class="menu-item"
                        id="settings-button"
                        type="button"
                        role="menuitem"
                    >
                        ⚙ settings
                    </button>
                    <button
                        class="account-signout"
                        id="signout-button"
                        type="button"
                        role="menuitem"
                    >
                        ← sign out
                    </button>
                </div>
            </div>
        </div>
    </header>
</template>
