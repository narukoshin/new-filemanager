import { computed, onUnmounted, ref, type Ref } from "vue"

import {
    getBackendError,
    type AccountInput,
    type FileManagerBackend,
    type UserInput,
} from "../backend/contracts"
import type { ManagedUser } from "../types/fileManager"

interface UsersOptions {
    backend: Pick<FileManagerBackend, "removeUser" | "saveAccount" | "saveUser">
    currentUsername: Ref<string>
    selectedUserId: Ref<number | null>
    showToast: (message: string) => void
}

/** Owns the reactive user projection; persistence belongs to the backend. */
export const useUsers = ({
    backend,
    currentUsername,
    selectedUserId,
    showToast,
}: UsersOptions) => {
    const users = ref<ManagedUser[]>([])
    const confirmingUserId = ref<number | null>(null)
    let confirmationTimer: ReturnType<typeof setTimeout> | undefined

    /** Resolves the identity currently targeted by the shared dialog. */
    const activeUser = computed(() =>
        users.value.find((user) => user.id === selectedUserId.value),
    )

    /** Replaces the user projection with a backend snapshot. */
    const hydrate = (snapshot: ManagedUser[]): void => {
        users.value = snapshot
    }

    /** Keeps the owner row aligned with a successful session login. */
    const renameOwner = (username: string): void => {
        if (users.value[0]) users.value[0].username = username
    }

    /** Saves account details through the backend. */
    const saveAccount = async (input: AccountInput): Promise<string | null> => {
        try {
            const changingPassword = Boolean(
                input.currentPassword ||
                input.newPassword ||
                input.confirmPassword,
            )
            const session = await backend.saveAccount(input)
            currentUsername.value = session.username
            renameOwner(session.username)
            showToast(
                changingPassword
                    ? "account and password updated"
                    : "account updated",
            )
            return null
        } catch (error) {
            return getBackendError(error)
        }
    }

    /** Creates or updates a managed user through the backend. */
    const saveUser = async (input: UserInput): Promise<string | null> => {
        try {
            const user = await backend.saveUser(selectedUserId.value, input)
            const index = users.value.findIndex(
                (candidate) => candidate.id === user.id,
            )
            if (index === -1) users.value.push(user)
            else users.value[index] = user
            showToast(
                selectedUserId.value === null
                    ? `created user ${user.username}`
                    : `updated user ${user.username}${input.password ? " and rotated their password" : ""}`,
            )
            return null
        } catch (error) {
            return getBackendError(error)
        }
    }

    /** Requires a deliberate second click before asking the backend to remove. */
    const removeUser = async (user: ManagedUser): Promise<void> => {
        if (user.id === 1) return
        if (confirmingUserId.value !== user.id) {
            clearTimeout(confirmationTimer)
            confirmingUserId.value = user.id
            confirmationTimer = setTimeout(() => {
                confirmingUserId.value = null
            }, 2600)
            return
        }

        try {
            const removed = await backend.removeUser(user.id)
            users.value = users.value.filter(
                (candidate) => candidate.id !== removed.id,
            )
            confirmingUserId.value = null
            showToast(`removed user ${removed.username}`)
        } catch (error) {
            showToast(getBackendError(error))
        }
    }

    onUnmounted(() => clearTimeout(confirmationTimer))

    return {
        activeUser,
        confirmingUserId,
        hydrate,
        removeUser,
        renameOwner,
        saveAccount,
        saveUser,
        users,
    }
}
