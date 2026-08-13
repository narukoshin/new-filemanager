<template>
    <svg class="icon-sprite" aria-hidden="true">
        <defs>
            <symbol id="icon-folder" viewBox="0 0 16 16">
                <path fill="var(--icon-detail, #dc7d9b)" d="M2 3h5v2H2z" />
                <path fill="var(--icon-main, #8f73b7)" d="M1 5h14v8H1z" />
                <path fill="var(--icon-light, #c1a0dc)" d="M2 5h12v1H2z" />
                <path
                    fill="var(--icon-dark, #4b3a62)"
                    d="M2 12h12v1H2zM6 9h1v1H6zM9 9h1v1H9z"
                />
            </symbol>

            <symbol id="icon-text" viewBox="0 0 16 16">
                <path fill="var(--icon-main, #898394)" d="M3 1h7l3 3v11H3z" />
                <path
                    fill="var(--icon-light, #b8b0c1)"
                    d="M4 2h5v4h3v8H4zM10 2l2 2h-2z"
                />
                <path
                    fill="var(--icon-detail, #625a70)"
                    d="M5 8h6v1H5zM5 10h5v1H5zM5 12h4v1H5z"
                />
                <path fill="var(--icon-dark, #4c4854)" d="M3 14h10v1H3z" />
            </symbol>

            <symbol id="icon-archive" viewBox="0 0 16 16">
                <path fill="var(--icon-main, #c99536)" d="M3 1h7l3 3v11H3z" />
                <path
                    fill="var(--icon-light, #edc15b)"
                    d="M4 2h5v3h3v2H4zM10 2l2 2h-2z"
                />
                <path fill="var(--icon-dark, #725121)" d="M3 14h10v1H3z" />
                <path
                    fill="var(--icon-detail, #312719)"
                    d="M7 2h2v2H7zM8 4h2v2H8zM7 6h2v2H7zM8 8h2v2H8zM7 10h2v3H7z"
                />
            </symbol>

            <symbol id="icon-image" viewBox="0 0 16 16">
                <path fill="var(--icon-main, #559d97)" d="M3 1h7l3 3v11H3z" />
                <path
                    fill="var(--icon-light, #85c9c0)"
                    d="M4 2h5v4h3v4l-2-2-2 3-1-1-3 3zM10 2l2 2h-2z"
                />
                <path fill="var(--icon-detail, #dc7d9b)" d="M5 4h2v2H5z" />
                <path
                    fill="var(--icon-dark, #285e5b)"
                    d="M4 13l3-3 1 1 2-3 2 2v4H4zM3 14h10v1H3z"
                />
            </symbol>

            <symbol id="icon-database" viewBox="0 0 16 16">
                <path
                    fill="var(--icon-main, #607cae)"
                    d="M3 2h10v1h1v10h-1v1H3v-1H2V3h1z"
                />
                <path
                    fill="var(--icon-light, #8fa8db)"
                    d="M4 2h8v1h1v1h-1v1H4V4H3V3h1zM3 7h1v1h8V7h1v2h-1v1H4V9H3z"
                />
                <path
                    fill="var(--icon-dark, #35486f)"
                    d="M3 11h1v1h8v-1h1v2h-1v1H4v-1H3z"
                />
                <path
                    fill="var(--icon-detail, #252d42)"
                    d="M5 7h1v1H5zM10 7h1v1h-1z"
                />
            </symbol>

            <symbol id="icon-search" viewBox="0 0 16 16">
                <path
                    fill="var(--icon-main, #77777f)"
                    fill-rule="evenodd"
                    d="M4 2h6v1h2v2h1v5h-1v2h-2v1H4v-1H2v-2H1V5h1V3h2zm0 2v1H3v5h1v1h6v-1h1V5h-1V4z"
                />
                <path
                    fill="var(--icon-light, #8b8b94)"
                    d="M11 11h2v2h2v2h-2v-2h-2z"
                />
            </symbol>

            <symbol id="icon-new-folder" viewBox="0 0 16 16">
                <path fill="var(--icon-dark, #dc7d9b)" d="M2 3h5v2H2z" />
                <path fill="var(--icon-main, #9474b8)" d="M1 5h13v8H1z" />
                <path fill="var(--icon-light, #c3a0dc)" d="M2 5h11v1H2z" />
                <path fill="#0d0d0f" d="M10 8h2v2h2v2h-2v2h-2v-2H8v-2h2z" />
                <path fill="#77cbb9" d="M10 9h2v2h2v1h-2v2h-1v-2H9v-1h2V9z" />
            </symbol>

            <symbol id="icon-upload" viewBox="0 0 16 16">
                <path
                    fill="var(--icon-main, #bc6984)"
                    d="M7 2h2v1h1v1h1v1h1v2H9v5H7V7H4V5h1V4h1V3h1z"
                />
                <path fill="var(--icon-light, #efb0c4)" d="M7 3h1v8H7z" />
                <path
                    fill="var(--icon-dark, #704052)"
                    d="M2 11h2v2h8v-2h2v4H2z"
                />
            </symbol>

            <symbol id="icon-login" viewBox="0 0 16 16">
                <path
                    fill="var(--icon-main, #dc7d9b)"
                    d="M7 1h7v14H7v-2h2V3H7z"
                />
                <path fill="var(--icon-light, #e6a0b6)" d="M9 3h4v11H9z" />
                <path fill="var(--icon-dark, #6e3d4d)" d="M11 8h1v1h-1z" />
                <path fill="#77cbb9" d="M1 7h5V5l3 3-3 3V9H1z" />
            </symbol>

            <symbol id="icon-account" viewBox="0 0 16 16">
                <path
                    fill="var(--icon-dark, #6e3d4d)"
                    d="M5 2h6v1h1v5h-1v1H5V8H4V3h1z"
                />
                <path
                    fill="var(--icon-light, #e6a0b6)"
                    d="M6 3h4v1h1v3h-1v1H6V7H5V4h1z"
                />
                <path
                    fill="var(--icon-main, #dc7d9b)"
                    d="M4 10h8v1h2v4H2v-4h2z"
                />
                <path fill="#77cbb9" d="M6 5h1v1H6zM9 5h1v1H9z" />
            </symbol>

            <symbol id="icon-settings" viewBox="0 0 16 16">
                <path
                    fill="var(--icon-dark, #4b3a62)"
                    d="M6 1h4l1 3 3 1v4l-3 1-1 4H6l-1-4-3-1V5l3-1z"
                />
                <path
                    fill="var(--icon-main, #9474b8)"
                    d="M6 3h4l1 2 2 1v2l-2 1-1 3H6L5 9 3 8V6l2-1z"
                />
                <path
                    fill="var(--icon-light, #c3a0dc)"
                    d="M7 5h2l2 2v2l-2 2H7L5 9V7z"
                />
                <path fill="#171016" d="M7 7h2v2H7z" />
            </symbol>

            <symbol id="icon-lock" viewBox="0 0 16 16">
                <path
                    fill="var(--icon-dark, #603746)"
                    d="M5 1h6v1h1v5h2v8H2V7h2V2h1zm1 2v4h4V3z"
                />
                <path fill="var(--icon-main, #b86f86)" d="M3 8h10v6H3z" />
                <path fill="var(--icon-light, #e3a0b5)" d="M4 8h8v1H4z" />
                <path fill="#24151a" d="M7 10h2v2H8v1H7z" />
            </symbol>
        </defs>
    </svg>
</template>
