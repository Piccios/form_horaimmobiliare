export type LeadPayload = Record<string, unknown>

// Renamed `payload` to `data` and ensured it is spread into the `enriched` object to satisfy `noUnusedParameters`.
export async function postLead(data: LeadPayload): Promise<{ ok: boolean }> {
	const language = navigator.language || (document.documentElement.getAttribute('lang') || '')
	const enriched: LeadPayload = {
		...data,
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
