export type LeadPayload = Record<string, unknown>

export async function postLead(payload: LeadPayload): Promise<{ ok: boolean }> {
	const language = navigator.language || (document.documentElement.getAttribute('lang') || '')
	const enriched: LeadPayload = {
		...payload,
		created_at: new Date().toISOString(),
		source_page: window.location.pathname,
		language,
		honeypot_passed: true,
	}
	const res = await fetch('/api/send-lead', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(enriched),
	})
	if (!res.ok) {
		const error = await res.json().catch(() => ({ error: 'Unknown error' }))
		throw new Error(error.error || 'Request failed')
	}
	return res.json()
}
