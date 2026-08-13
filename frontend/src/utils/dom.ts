/** Finds a required node—or complains immediately, as it rightly should. */
export const getElement = <T extends Element>(selector: string): T => {
    const element = document.querySelector<T>(selector)

    if (!element) {
        throw new Error(`Required element not found: ${selector}`)
    }

    return element
}

/** Collects every matching node into an array, nice and easy to command. */
export const getElements = <T extends Element>(selector: string): T[] => [
    ...document.querySelectorAll<T>(selector),
]
