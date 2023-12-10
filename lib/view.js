import hash from './version.js';
import {stats} from './search.js';

export const getDefaultViewData = async (env) => {
	const [
		blogPages,
		docsPages,
		magazinesPages,
	] = await stats(env);

	const totalPages = blogPages + docsPages + magazinesPages;

	return {
		hash,
		blogPages,
		docsPages,
		magazinesPages,
		totalPages,
	};
};
