import { getDefaultViewData } from '../../lib/view.js';
import {emitPageView} from '../../lib/plausible.js';
import {renderHtml} from '../../lib/sso-render.js';
import {getTemplate} from "../../lib/sso-render.js";

const template = getTemplate(import.meta.dirname, './template.html');

export const integrationsController = async (req, res) => {
	emitPageView(req);
	const { env } = req;

	const viewDefaults = await getDefaultViewData(env);
	const view = {
		...viewDefaults,
		mainClass: 'about body',
		title: 'Kukei.eu integrations',
	};
	const html = await renderHtml(template, view);

	res.status(200).send(html);
};
