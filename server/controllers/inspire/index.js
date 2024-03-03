import { getDefaultViewData } from '../../lib/view.js';
import {emitPageView} from '../../lib/plausible.js';
import {getTemplate, renderHtml} from '../../lib/sso-render.js';
import {getRandomBlog} from '../../lib/search.js';

const template = getTemplate(import.meta.dirname, './template.html');
export const inspireController = async (req, res) => {
	emitPageView(req);
	const { env } = req;

	const entry = await getRandomBlog(env);

	const viewDefaults = await getDefaultViewData(env);
	const view = {
		...viewDefaults,
		mainClass: 'body inspire',
		title: 'Get inspired - random blog post per load - kukei.eu',
		entries: [entry],
	};
	const html = await renderHtml(template, view);

	res.status(200).send(html);
};
