import express from 'express';
import bodyParser from 'body-parser';
import { withAsyncErrorHandler } from './lib/withAsyncErrorHandler.js';
import { indexController } from './controllers/index.js';
import { statusController } from './controllers/status/index.js';
import { aboutController } from './controllers/about/index.js';
import { inspireController } from './controllers/inspire/index.js';
import { integrationsController } from './controllers/integrations/index.js';
import { postApiFeedbackController } from './controllers/api/feedback/index.js';
import { postFeedbackEnhanceController } from './controllers/api/feedback/enhance/index.js';

const main = async () => {
	const app = express();
	app.use((req, res, next) => {
		console.log(`Request: ${req.get('cf-connecting-ip')}, ${req.originalUrl}`);
		next();
	});
	app.use('/', bodyParser.urlencoded({ extended: false }));
	app.use((req, res, next) => {
		req.env = process.env;
		next();
	});
	app.use(
		express.static('dist', {
			maxAge: '1y',
		}),
	);

	app.get('/', withAsyncErrorHandler(indexController));
	app.get('/status', withAsyncErrorHandler(statusController));
	app.get('/about', withAsyncErrorHandler(aboutController));
	app.get('/inspire', withAsyncErrorHandler(inspireController));
	app.get('/integrations', withAsyncErrorHandler(integrationsController));

	app.post('/api/feedback', withAsyncErrorHandler(postApiFeedbackController));
	app.post(
		'/api/feedback/enhance',
		withAsyncErrorHandler(postFeedbackEnhanceController),
	);

	app.listen(3001, () => {
		console.log('Server up');
	});
};

main();
