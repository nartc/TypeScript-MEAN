import {Request, Response} from 'express';
import {MongoError} from 'mongodb';

import {ITask, Task} from '../models/Task';
import {IUser} from '../models/User';

export class TaskController {
    private static resolveErrorResponse(response: Response, message: string, statusCode: number): Response {
        return response.status(statusCode).json({
            status: statusCode,
            message: message
        });
    }

    private static resolveAPIResponse(response: Response, result: ITask | ITask[] | MongoError = null): Response {
        if (result instanceof MongoError) {
            return response.status(500).json({
                status: 500,
                mongoError: result.code,
                message: result.message,
                error: result.name
            });
        }

        return response.status(response.statusCode).json({
            status: response.statusCode,
            result
        });
    }

    async getUserTasks(request: Request, response: Response): Promise<Response> {
        const currentUser: IUser = request.user;
        
        if (!currentUser) return TaskController.resolveErrorResponse(response, 'Not authorized', 403);

        const result = await Task.getTasksByUser(currentUser._id);

        return TaskController.resolveAPIResponse(response, result);
    }

    async createTask(request: Request, response: Response): Promise<Response> {
        const currentUser: IUser = request.user;

        if (!currentUser) return TaskController.resolveErrorResponse(response, 'Not authorized', 403);

        const titleInput: string = request.body.title;
        const contentInput: string = request.body.content;

        if (!titleInput || !contentInput) return TaskController.resolveErrorResponse(response, 'Title and Content cannot be emptied', 500);

        const slugInput: string = titleInput.replace(/\s+/g, '-').toLowerCase();

        const newTask: ITask = new Task();
        newTask.title = titleInput;
        newTask.content = contentInput;

        const lastEight = newTask._id.toString().slice(-8);
        newTask.slug = slugInput.concat(`-${lastEight}`);
        newTask.user = currentUser._id;
        const result = await Task.createTask(newTask);

        if (result && !(result instanceof MongoError)) {
            currentUser.tasks.push(result._id);
        } 
        return TaskController.resolveAPIResponse(response, result);
    }

    async updateTask(request: Request, response: Response): Promise<Response> {
        const slugParam: string = request.params.slug;

        if (!slugParam || slugParam === null) return TaskController.resolveErrorResponse(response, 'Slug Parameter is missing', 500);

        const updatedTask: ITask = request.body.task;

        const result = await Task.updateTask(slugParam, updatedTask);

        return TaskController.resolveAPIResponse(response, result);
    }

    async getSingleTask(request: Request, response: Response): Promise<Response> {
        const slugParam: string = request.params.slug;

        if (!slugParam || slugParam === null) return TaskController.resolveErrorResponse(response, 'Slug Parameter is missing', 500);

        const result = await Task.getTaskBySlug(slugParam);

        return TaskController.resolveAPIResponse(response, result);
    }

    async removeTask(request: Request, response: Response): Promise<Response> {
        const slugParam: string = request.params.slug;

        if (!slugParam || slugParam === null) return TaskController.resolveErrorResponse(response, 'Slug Parameter is missing', 500);

        const result = await Task.deleteTask(slugParam);

        return TaskController.resolveAPIResponse(response, result);
    }
}
