import * as passport from 'passport';
import {Router} from 'express';

import {TaskController} from '../controllers/TaskController';

export class TaskRouter {
    router: Router;
    taskController: TaskController;

    constructor() {
        this.router = Router();
        this.taskController = new TaskController();
    }

    routes() {
        this.router.get('/my-tasks', passport.authenticate('jwt', {session: false}), this.taskController.getUserTasks);
        this.router.post('/create', passport.authenticate('jwt', {session: false}), this.taskController.createTask);
        this.router
            .use(passport.authenticate('jwt', {session: false}))
            .route('/task/:slug')
            .get(this.taskController.getSingleTask)
            .put(this.taskController.updateTask)
            .delete(this.taskController.removeTask);
    }
}
