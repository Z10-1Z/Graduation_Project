import { AI } from './endpoints';
import { clearAuthData, getToken } from '../utils/authStorage';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api').replace(/\/$/, '');

function buildUrl(path) {
	return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

function resolveToken(token) {
	return token || getToken();
}

function buildHeaders(extra = {}, token = null) {
	const headers = { ...extra };
	const authToken = resolveToken(token);
	if (authToken) headers.Authorization = `Bearer ${authToken}`;
	return headers;
}

function handleUnauthorized() {
	clearAuthData();
	if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
		window.location.assign('/login');
	}
}

async function buildResponseError(response) {
	const contentType = response.headers.get('content-type') || '';
	let data = null;

	try {
		data = contentType.includes('application/json') ? await response.json() : await response.text();
	} catch {
		data = null;
	}

	const message =
		(typeof data === 'string' && data.trim()) ||
		data?.message ||
		data?.error ||
		`Request failed with status ${response.status}`;

	const error = new Error(message);
	error.response = { status: response.status, data };
	return error;
}

async function requestJson(path, { method = 'GET', body, token, signal } = {}) {
	const response = await fetch(buildUrl(path), {
		method,
		headers: buildHeaders({ Accept: 'application/json', 'Content-Type': 'application/json' }, token),
		body: body == null ? undefined : JSON.stringify(body),
		signal,
	});

	if (response.status === 401) handleUnauthorized();
	if (!response.ok) throw await buildResponseError(response);
	if (response.status === 204) return null;

	return response.json();
}

export async function createChatConversation(metadata = {}, options = {}) {
	const data = await requestJson(AI.CONVERSATIONS, {
		method: 'POST',
		body: { metadata },
		token: options.token,
		signal: options.signal,
	});

	return data.conversation;
}

export async function listChatConversations(options = {}) {
	const data = await requestJson(AI.CONVERSATIONS, {
		token: options.token,
		signal: options.signal,
	});

	return data.conversations || [];
}

export async function fetchChatConversation(conversationId, options = {}) {
	const data = await requestJson(AI.CONVERSATION(conversationId), {
		token: options.token,
		signal: options.signal,
	});

	return data.conversation;
}

function readSseEvent(eventText, onPayload) {
	const dataLines = eventText
		.split(/\r?\n/)
		.filter((line) => line.startsWith('data:'))
		.map((line) => line.slice(5).trimStart());

	if (dataLines.length === 0) return;

	const rawPayload = dataLines.join('\n').trim();
	if (!rawPayload || rawPayload === '[DONE]') return;

	onPayload(JSON.parse(rawPayload));
}

export async function sendChatMessageStream({ conversationId, message, token, signal, onDelta }) {
	const response = await fetch(buildUrl(AI.SEND), {
		method: 'POST',
		headers: buildHeaders({ Accept: 'text/event-stream', 'Content-Type': 'application/json' }, token),
		body: JSON.stringify({ conversation_id: conversationId, message }),
		signal,
	});

	if (response.status === 401) handleUnauthorized();
	if (!response.ok) throw await buildResponseError(response);
	if (!response.body) return { citations: [], model: null };

	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let buffer = '';
	const result = { citations: [], model: null };

	const handlePayload = (payload) => {
		if (payload.delta) onDelta?.(payload.delta);

		if (payload.error) {
			const error = new Error(payload.error);
			error.response = { status: 200, data: payload };
			throw error;
		}

		if (payload.done) {
			result.citations = payload.citations || [];
			result.model = payload.model || null;
		}
	};

	while (true) {
		const { value, done } = await reader.read();
		buffer += decoder.decode(value || new Uint8Array(), { stream: !done });

		const events = buffer.split(/\n\n/);
		buffer = events.pop() || '';

		events.forEach((eventText) => readSseEvent(eventText, handlePayload));

		if (done) break;
	}

	if (buffer.trim()) readSseEvent(buffer, handlePayload);

	return result;
}
