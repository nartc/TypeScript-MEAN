import {Router} from 'express';

import {UserController} from '../controllers/UserController';

export class UserRouter {
    router: Router;
    userController: UserController;

    constructor() {
        this.router = Router();
        this.userController = new UserController();
        this.routes();
    }

    routes() {
        this.router.post('/register', this.userController.register);
        this.router.post('/login', this.userController.login);
    }
}
