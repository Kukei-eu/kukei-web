import { enhanceFeedbackVote } from '../../../../lib/mongo.js';
import {getTemplate, renderHtml} from '../../../../lib/sso-render.js';

const template = getTemplate(import.meta.dirname, './template.html');

export const postFeedbackEnhanceController = async (req, res) => {
	const data = req.body;
	const {
		q,
		token,
		contact,
		comment
	} = data;
	const success = await enhanceFeedbackVote({token, comment, contact});

	const view = {
		success,
		noSuccess: !success,
		q,
	};

	const html = await renderHtml(template, view);

	res.status(201).send(html);
};
