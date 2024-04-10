import shortener from './shortener.js';
import phrases from './phrases.js';

export const isBanned = (query) => {
	if (!query) {
		return false;
	}

	// Check for shorteners
	if (shortener.includes(query)) {
		return true;
	}

	// Check for banned phrases
	for (const phrase of phrases) {
		if (query.toLowerCase().includes(phrase)) {
			return true;
		}
	}

	return false;
};
