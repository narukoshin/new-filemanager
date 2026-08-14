import { onMounted, ref, watch } from "vue"

import { getBackendError, type FileManagerBackend } from "../backend/contracts"

interface AuthOptions {
    backend: Pick<FileManagerBackend, "authenticate" | "logout">
    onLogin: (username: string) => void
    onLogout: () => void
    showToast: (message: string) => void
}

/** Owns reactive session state and delegates verification to the active backend. */
export const useAuth = ({
    backend,
    onLogin,
    onLogout,
    showToast,
}: AuthOptions) => {
    const isAuthenticated = ref(false)
    const currentUsername = ref("")

    /** Applies session state and lets neighbouring domains tidy themselves. */
    const setAuthenticated = (value: boolean, username = ""): void => {
        isAuthenticated.value = value
        if (value) {
            currentUsername.value = username
            onLogin(username)
        } else {
            onLogout()
        }
    }

    /** Authenticates through the selected backend implementation. */
    const login = async (
        username: string,
        password: string,
    ): Promise<string | null> => {
        try {
            const session = await backend.authenticate({ username, password })
            setAuthenticated(true, session.username)
            showToast(`welcome back, ${session.username}`)
            return null
        } catch (error) {
            return getBackendError(error)
        }
    }

    /** Ends the session through the backend before clearing private state. */
    const logout = async (): Promise<void> => {
        try {
            await backend.logout()
            setAuthenticated(false)
            showToast("signed out · file actions locked")
        } catch (error) {
            showToast(getBackendError(error))
        }
    }

    /** Restores the public identity supplied by the startup snapshot. */
    const hydrate = (username: string): void => {
        currentUsername.value = username
    }

    watch(
        isAuthenticated,
        (value) => {
            document.body.dataset.auth = String(value)
        },
        { immediate: true },
    )

    onMounted(() => setAuthenticated(false))

    return { currentUsername, hydrate, isAuthenticated, login, logout }
}
