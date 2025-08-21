export function getStory(options ) {
    const key = options.key;
    if (!key) throw new Error("key is required");

    /** Load state 
     * 
     * @param {Function} defaultStateFactory - A function to create a default state,
     * f.ex. load(() => ({ someArrayIwantToStore: [], someThemeColor: "red" }))
     */
    function load(defaultStateFactory) {
        try {
            const keyContents = localStorage.getItem(key);
            if (!keyContents) return defaultStateFactory?.() ?? {};
            return JSON.parse(keyContents);
        } catch (e) {
            throw new Error(`Failed to load state from localStorage: ${e.message}`);
        }
    }

    /** Save state, returns saved state with meta. */
    function save(state) {
        const withUpdAt = _withUpdatedAt(state);
        const json = JSON.stringify(withUpdAt);
        localStorage.setItem(key, json);
        return withUpdAt;
    }

    /** Is this a bit sketchy to listen to events on storage..? */
    function onExternalChange(callback) {
        window.addEventListener("storage", (e) => {
            if (e.key === key && e.newValue) {
                try { callback(JSON.parse(e.newValue)); } catch {}
            }
        });
    }

    /** Export to a downloadable JSON file. Real neat creating a link and clicking it... */
    function exportState(filename = "state.json", state) {
        const s = state ?? load(() => ({}));
        const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement("a"), { href: url, download: filename });
        a.click();
        URL.revokeObjectURL(url);
    }

    /** Import a state object. 
     * No way of knowing if it's the right schema yet, better handle that elsewhere 
     */
    function importStateObject(obj) {
        if (typeof obj !== "object" || obj == null) throw new Error("Invalid state object");
        return save(obj);
    }


    /** Adds a timestamp */
    function _withUpdatedAt(s) { return { ...s, updatedAt: new Date().toISOString() }; }

    return { load, save, exportState, importStateObject, onExternalChange, key };
}
