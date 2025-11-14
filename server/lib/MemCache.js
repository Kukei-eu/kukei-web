/**
 * @typedef {Object} CacheItem
 * @property {string} value
 * @property {Date} expiresAt
 */
export class MemCache {
	constructor(name) {
		this.name = name;
		// Default to 1 hour
		this.TtlInMs = 1000 * 60 * 60;
		/**
		 *
		 * @type {Map<string, CacheItem>}
		 */
		this.cache = new Map();
	}

	async get(key) {
		if (this.cache.has(key)) {
			const item = this.cache.get(key);
			return item.value;
		}

		return null;
	}

	async cleanUp() {
		let removed = 0;
		const now = new Date();
		for (const [key, item] of this.cache.entries()) {
			if (item.expiresAt < now) {
				removed++;
				this.cache.delete(key);
			}
		}
		console.log(`Removed ${removed} items from ${this.name} cache`);
	}
	async set(key, value) {
		await this.cleanUp();
		this.cache.set(key, {
			value,
			expiresAt: new Date(Date.now() + this.TtlInMs),
		})
	}
}
