export const parseQuery = (rawQuery) => {
	if (!rawQuery) {
		return { q: undefined, lang: undefined };
	}

	const trimmed = rawQuery.trim();
	let q = trimmed.length > 0 ? trimmed : undefined;

	if (!q) {
		return { q };
	}

	const lang = trimmed.match(/lang:(\w{2})/)?.[1];
	if (lang) {
		q = q.replace(/lang:\w{2}/, '').trim();
	}

	return { q, lang };
};
