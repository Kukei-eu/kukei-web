import {searchNPM} from './searchNPM.js';
import {searchCrates} from './searchCrates.js';

export const searchRegistries = async (env, results, q) => {
	results.hits.registries = [];
	const npm = await searchNPM(env, q);
	if (npm) {
		results.hits.registries.push(npm);
	}

	const crates = await searchCrates(env, q);
	if (crates) {
		results.hits.registries.push(crates);
	}
};
