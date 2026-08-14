import { onUnmounted, ref } from "vue"

/** Owns transient notices without asking any component to manage a timer. */
export const useNotifications = () => {
    const toastMessage = ref("")
    let toastTimer: ReturnType<typeof setTimeout> | undefined

    /** Shows one plain-text notice and retires the previous one politely. */
    const showToast = (message: string): void => {
        clearTimeout(toastTimer)
        toastMessage.value = message
        toastTimer = setTimeout(() => {
            toastMessage.value = ""
        }, 2600)
    }

    /** Dismisses the active notice immediately. */
    const clearToast = (): void => {
        clearTimeout(toastTimer)
        toastMessage.value = ""
    }

    onUnmounted(() => clearTimeout(toastTimer))

    return { clearToast, showToast, toastMessage }
}
