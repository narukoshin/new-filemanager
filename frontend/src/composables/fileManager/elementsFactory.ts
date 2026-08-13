import type { UploadUI } from "../../types/fileManager"

/** Gives unsupported previews something prettier than an awkward blank stare. */
export const createPreviewPlaceholder = (
    iconName: string,
    message: string,
): HTMLDivElement => {
    const placeholder = document.createElement("div")
    placeholder.className = "preview-placeholder"

    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    icon.setAttribute("class", "pixel-icon")
    icon.setAttribute("viewBox", "0 0 16 16")

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use")
    use.setAttribute("href", `#icon-${iconName}`)
    icon.append(use)

    const label = document.createElement("span")
    label.textContent = message
    placeholder.append(icon, label)

    return placeholder
}

/** Builds an accessible row command, because even mischief needs labels. */
export const createMenuItem = (
    label: string,
    symbol: string,
    command: string,
    danger = false,
): HTMLButtonElement => {
    const button = document.createElement("button")
    button.type = "button"
    button.className = `menu-item${danger ? " danger" : ""}`
    button.dataset.command = command
    button.setAttribute("role", "menuitem")
    button.innerHTML = `<span>${label}</span><span class="menu-symbol" aria-hidden="true">${symbol}</span>`

    return button
}

/** Gives a queued upload its tiny stage, status, and progress bar. */
export const createUploadItem = (
    file: File,
    uploadList: HTMLElement,
): UploadUI => {
    const item = document.createElement("div")
    item.className = "upload-item"

    const filename = document.createElement("span")
    filename.className = "upload-item-name"
    filename.textContent = file.name

    const status = document.createElement("span")
    status.className = "upload-item-status"
    status.textContent = "0%"

    const track = document.createElement("div")
    track.className = "upload-track"

    const progress = document.createElement("div")
    progress.className = "upload-progress"
    track.append(progress)
    item.append(filename, status, track)
    uploadList.append(item)

    return { item, status, progress }
}
