export type LeadPayload = Record<string, unknown>

export async function postLead(payload: LeadPayload): Promise<{ ok: boolean }> {
	// Simulate network delay and successful response
	await new Promise((resolve) => setTimeout(resolve, 600))
	return { ok: true }
}
