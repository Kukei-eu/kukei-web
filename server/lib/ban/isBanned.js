import shortener from './shortener.js';

export const isBanned = (query) => {
	if (shortener.includes(query)) {
		return true;
	}

	return false;
};
