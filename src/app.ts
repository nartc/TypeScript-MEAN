// Import Core Dependencies
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import {Request, Response} from 'express';
import * as express from 'express';
import {MongoError} from 'mongodb';
import {Mongoose} from 'mongoose';
import * as mongoose from 'mongoose';
import * as logger from 'morgan';
import * as passport from 'passport';
import * as path from 'path';
import * as swaggerUI from 'swagger-ui-express';

import {coreConfig} from './config/keys';
import {TaskRouter} from './routes/TaskRouter';
import {UserRouter} from './routes/UserRouter';
import {APIDocsRouter} from './routes/Swagger';

// Import Config
// Import Routes
class App {
    public app: express.Application;
    private userRouter: UserRouter = new UserRouter();
    private taskRouter: TaskRouter = new TaskRouter();
    private apiDocsRouter: APIDocsRouter = new APIDocsRouter();
    private swaggerOptions: Object = {};
    private environmentHosting: string = process.env.NODE_ENV || 'Development';

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    public config(): void {
        // Connect to MongoDB
        (<Mongoose>mongoose).Promise = global.Promise;
        mongoose
            .connect(coreConfig.mongoURI)
            .then(() => console.log('Connected to database'))
            .catch((error: MongoError) => console.log(`Error on connection ${error}`));

        // CORS Middleware
        this.app.use(cors());
        this.app.options('*', cors());

        // Morgan Middleware
        this.app.use(logger('dev'));

        // Bodyparser Middleware
        this.app.use(bodyParser.json());
        this.app.use(
            bodyParser.urlencoded({
                extended: false,
                limit: '5mb',
                parameterLimit: 5000
            })
        );

        // Passport Middleware
        this.app.use(passport.initialize());
        this.app.use(passport.session());

        // Static
        this.app.use(express.static(path.join(__dirname, '../public')));

        // Call Routes
        this.userRouter.routes();
        this.taskRouter.routes();
    }

    public routes(): void {
        // Test our Index
        this.app.get('/', (req: Request, res: Response) => {
            res.send('Testing Index Worked');
        });

        if (this.environmentHosting === 'Development') {
            this.swaggerOptions = {
                explorer: true,
                swaggerUrl: 'http://localhost:3000/api/docs/swagger.json'
            };
        }

        this.app.use('/', this.apiDocsRouter.getRouter());
        this.app.use('/api/docs', swaggerUI.serve, swaggerUI.setup(null, this.swaggerOptions));

        // Load Routes
        this.app.use('/api/auth', this.userRouter.router);
        this.app.use('/api/tasks', this.taskRouter.router);
    }
}

export default new App().app;
