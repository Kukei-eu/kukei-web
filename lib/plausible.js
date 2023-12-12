import { createHash } from 'node:crypto';

const hash = (str) => {
	const hash = createHash('sha256');
	hash.update(str);
	return hash.digest('hex');
};

const emitEvent = async (context, name, props = {}) => {
	const { request, env } = context;
	const userAgent = request.headers.get('user-agent');
	let ip = request.headers.get('cf-connecting-ip');

	if (!ip) {
		console.warn('No IP address provided. Falling back to random seed');
		ip = `${Math.random()}`;
	}

	const hashedIp = hash(ip);

	const plausibleHeaders = {
		'User-Agent': userAgent,
		'X-Forwarded-For': hashedIp,
		'Content-Type': 'application/json',
	};

	const response = await fetch('https://plausible.io/api/event', {
		headers: plausibleHeaders,
		method: 'POST',
		body: JSON.stringify({
			name,
			url: request.url,
			domain: env.PLAUSIBLE_REPORTED_DOMAIN,
			props,
		}),
	});

	if (response.status !== 202) {
		console.error('Plausible failed', await response.text());
	}
};
/**
 * Emits PageView to Plausible.io
 * Note: this is filly GDPR/Telecom compliant as we don't even send the IP address.
 * Should never throw. Should be fire and forget.
 * @param context
 */
export const emitPageView = (context, props) => {
	emitEvent(context, 'pageview', props)
		.catch((error) => {
			console.error('Plausible failed', error);
		});
};
