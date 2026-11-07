/*
 * Carries what a visitor typed on the landing page over to the workspace after they sign
 * up, so they don't paste the job description twice. Lives in sessionStorage (this tab only).
 */
const KEY = "rehearse:draft"

export function saveDraft(draft) {
    try { sessionStorage.setItem(KEY, JSON.stringify(draft)) } catch { /* storage unavailable */ }
}

export function loadDraft() {
    try { return JSON.parse(sessionStorage.getItem(KEY)) || null } catch { return null }
}

export function clearDraft() {
    try { sessionStorage.removeItem(KEY) } catch { /* storage unavailable */ }
}
