import * as bcrypt from 'bcryptjs';
import {Request, Response} from 'express';
import {sign as JWTSign, SignOptions} from 'jsonwebtoken';
import {MongoError} from 'mongodb';

import {coreConfig} from '../config/keys';
import {IUser, User} from '../models/User';

export class UserController {
    private _jwtSignOptions: SignOptions = {
        expiresIn: 1800 // Half an hour,
    };

    private static resolveErrorResponse(response: Response, message: string, statusCode: number): Response {
        return response.status(statusCode).json({
            status: statusCode,
            message
        });
    }

    private static resolveAPIResponse(response: Response, result: IUser | MongoError = null): Response {
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

    async register(request: Request, response: Response): Promise<Response> {
        const usernameInput: string = request.body.username;
        const passwordInput: string = request.body.password;

        if (!usernameInput || !passwordInput) {
            return UserController.resolveErrorResponse(response, 'Username and Password cannot be emptied', 400);
        }

        const newUser: IUser = new User();
        newUser.username = usernameInput;

        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(passwordInput, salt);

        const result: IUser | MongoError = await User.createUser(newUser);

        if (result === null) return UserController.resolveErrorResponse(response, 'Error registering new User', 500);

        return UserController.resolveAPIResponse(response, result);
    }

    async login(request: Request, response: Response): Promise<Response> {
        const usernameInput: string = request.body.username;
        const passwordInput: string = request.body.password;

        const fetchedUser = await User.getUserByUsername(usernameInput);

        if (fetchedUser instanceof MongoError) return UserController.resolveAPIResponse(response, fetchedUser);
        if (fetchedUser === null) return UserController.resolveErrorResponse(response, 'Error fetching User', 404);

        const isMatched: boolean = await bcrypt.compare(passwordInput, fetchedUser.password);

        if (!isMatched) return UserController.resolveErrorResponse(response, 'Password do not match', 403);

        const payload = {
            user: fetchedUser
        };
        const token: string = JWTSign(payload, coreConfig.secretKey, this._jwtSignOptions);

        if (!token) return UserController.resolveErrorResponse(response, 'Error signing payload', 500);

        return response.status(response.statusCode).json({
            status: response.statusCode,
            authToken: `JWT ${token}`,
            result: {
                _id: fetchedUser._id,
                username: fetchedUser.username,
                createdOn: fetchedUser.createdOn,
                tasks: fetchedUser.tasks
            }
        });
    }
}
