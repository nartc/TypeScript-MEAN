import { Response, Router } from 'express';
import { readdirSync } from 'fs';
import { resolve } from 'path';
import swaggerJSDoc = require('swagger-jsdoc');

export class APIDocsRouter {
    private router: Router = Router();

    private static getAllRoutes(dir: string, filelist: string[]): string[] {
        const files = readdirSync(dir);
        filelist = filelist || [];

        files.map(file => {
            if (file.search('.map') < 0 && file.search(/^\./) < 0) {
                filelist.push(`build/routes/${file}`);
            }
        });

        return filelist;
    }

    public getRouter(): Router {
        this.router.get('/api/docs/swagger.json', (_: {}, response: Response) => {
            const urls: string[] = [];

            APIDocsRouter.getAllRoutes(resolve(__dirname), urls);

            const options = {
                swaggerDefinition: {
                    info: {
                        title: 'TS-MEN',
                        version: '1.0.0',
                        description: 'TypeScript MongoDB Express Node OpenAPI Documentations'
                    },
                    host: 'localhost:3000',
                    basePath: '/',
                    tags: [
                        {
                            name: 'Authentication',
                            description: 'Authentication Routes'
                        },
                        {
                            name: 'Task',
                            description: 'Task Routes'
                        }
                    ],
                    schemes: ['http', 'https'],
                    securityDefinitions: {
                        JWT: {
                            type: 'apiKey',
                            name: 'Authorization',
                            in: 'header'
                        }
                    },
                    consumes: ['application/json'],
                    produces: ['application/json']
                },
                apis: urls
            };

            response.setHeader('Content-Type', 'application/json');
            response.send(swaggerJSDoc(options));
        });

        return this.router;
    }
}
