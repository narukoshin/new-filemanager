import { reactive } from "vue"

import { getBackendError, type FileManagerBackend } from "../backend/contracts"
import type {
    SecuritySettings,
    SiteSettings,
    SortKey,
} from "../types/fileManager"

interface SettingsOptions {
    backend: Pick<
        FileManagerBackend,
        "saveSecuritySettings" | "saveSiteSettings"
    >
    onDefaultSort: (sortKey: SortKey) => void
    showToast: (message: string) => void
}

const emptySiteSettings: SiteSettings = {
    defaultSort: "name",
    filePreviews: false,
    intro: "",
    label: "files",
    maxUploadMegabytes: 0,
    nodeName: "",
    publicDownloads: false,
}

const emptySecuritySettings: SecuritySettings = {
    auditLog: false,
    folderProtection: false,
    loginLimit: 0,
    sessionLifetime: 0,
}

/** Owns the editable settings projection supplied by the active backend. */
export const useSettings = ({
    backend,
    onDefaultSort,
    showToast,
}: SettingsOptions) => {
    const siteSettings = reactive<SiteSettings>({ ...emptySiteSettings })
    const securitySettings = reactive<SecuritySettings>({
        ...emptySecuritySettings,
    })

    /** Replaces both settings projections with a backend snapshot. */
    const hydrate = (site: SiteSettings, security: SecuritySettings): void => {
        Object.assign(siteSettings, site)
        Object.assign(securitySettings, security)
        onDefaultSort(site.defaultSort)
    }

    /** Saves site settings and applies the backend-confirmed result. */
    const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
        try {
            const saved = await backend.saveSiteSettings(settings)
            Object.assign(siteSettings, saved)
            onDefaultSort(saved.defaultSort)
            showToast("site settings saved")
        } catch (error) {
            showToast(getBackendError(error))
        }
    }

    /** Saves security settings and applies the backend-confirmed result. */
    const saveSecuritySettings = async (
        settings: SecuritySettings,
    ): Promise<void> => {
        try {
            const saved = await backend.saveSecuritySettings(settings)
            Object.assign(securitySettings, saved)
            showToast("security policy saved")
        } catch (error) {
            showToast(getBackendError(error))
        }
    }

    return {
        hydrate,
        saveSecuritySettings,
        saveSiteSettings,
        securitySettings,
        siteSettings,
    }
}
