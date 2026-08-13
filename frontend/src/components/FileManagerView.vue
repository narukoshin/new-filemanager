<template>
    <section class="hero" id="browser-hero">
        <p class="eyebrow">node 01 · ~/archive</p>
        <h1>
            <span class="title-prefix">#</span>file<span class="accent">.</span
            >manager
        </h1>
        <p class="intro" id="site-intro">
            a quiet place for files, builds and things worth keeping around.
        </p>
    </section>

    <section
        class="file-browser"
        id="file-browser"
        aria-label="File browser"
        tabindex="-1"
    >
        <div class="toolbar">
            <nav class="path" aria-label="Current folder">
                <button
                    class="back-button"
                    id="back-button"
                    type="button"
                    aria-label="Go to parent folder"
                    disabled
                >
                    ←
                </button>
                <span class="path-prefix" id="path-prefix">naru@wold:</span>
                <span class="breadcrumbs" id="breadcrumbs"></span>
            </nav>

            <div class="tools">
                <label class="search">
                    <span class="search-icon" aria-hidden="true">
                        <svg class="pixel-icon" viewBox="0 0 16 16">
                            <use href="#icon-search" />
                        </svg>
                    </span>
                    <input
                        class="search-input"
                        id="file-search"
                        type="search"
                        placeholder="search files"
                        aria-label="Search files"
                        autocomplete="off"
                    />
                    <span class="search-key" aria-hidden="true">/</span>
                </label>

                <div class="actions">
                    <button
                        class="action"
                        id="new-folder-button"
                        type="button"
                        aria-label="New folder"
                        disabled
                        title="Log in to create folders"
                    >
                        <svg
                            class="pixel-icon"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                        >
                            <use href="#icon-new-folder" />
                        </svg>
                        <span class="label">folder</span>
                    </button>
                    <button
                        class="action primary"
                        id="upload-button"
                        type="button"
                        aria-label="Upload file"
                        disabled
                        title="Log in to upload files"
                    >
                        <svg
                            class="pixel-icon"
                            viewBox="0 0 16 16"
                            aria-hidden="true"
                        >
                            <use href="#icon-upload" />
                        </svg>
                        <span class="label">upload</span>
                    </button>
                    <input id="file-picker" type="file" multiple hidden />
                </div>
            </div>
        </div>

        <div class="upload-panel" id="upload-panel" aria-live="polite" hidden>
            <div class="upload-panel-head">
                <span>upload queue</span
                ><button class="upload-clear" id="upload-clear" type="button">
                    clear finished
                </button>
            </div>
            <div id="upload-list"></div>
        </div>

        <div class="file-head" role="row">
            <span role="columnheader"
                ><button class="sort-button" type="button" data-sort="name">
                    name<span
                        class="sort-indicator"
                        aria-hidden="true"
                    ></span></button
            ></span>
            <span role="columnheader"
                ><button class="sort-button" type="button" data-sort="size">
                    size<span
                        class="sort-indicator"
                        aria-hidden="true"
                    ></span></button
            ></span>
            <span role="columnheader"
                ><button class="sort-button" type="button" data-sort="modified">
                    modified<span
                        class="sort-indicator"
                        aria-hidden="true"
                    ></span></button
            ></span>
            <span>actions</span>
        </div>

        <div
            class="file-list"
            id="file-list"
            role="list"
            aria-label="Files and folders"
        >
            <div class="empty-state" id="empty-state" role="status" hidden>
                <span id="empty-message">this folder is empty</span>
            </div>
        </div>

        <div class="drop-overlay" id="drop-overlay" hidden>
            <div class="drop-message">
                <svg class="pixel-icon" viewBox="0 0 16 16" aria-hidden="true">
                    <use href="#icon-upload" />
                </svg>
                <span id="drop-message-text">drop files into this folder</span>
            </div>
        </div>
    </section>

    <footer class="footer" id="browser-footer">
        <span class="footer-command" aria-live="polite">
            <span id="visible-count">6</span>
            <span id="entry-label">entries</span>
            <span aria-hidden="true">/</span>
            <span id="visible-size">21.3 mb</span>
        </span>
        <span id="footer-node-name">ÞERXWOLD // FILE NODE 01</span>
    </footer>
</template>
