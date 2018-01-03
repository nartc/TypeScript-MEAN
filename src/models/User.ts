import { MongoError } from 'mongodb';
import { Document, Model, model, Schema } from 'mongoose';

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now()
    },
    tasks: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Task'
        }
    ]
});

export interface IUser extends Document {
    username?: string;
    password?: string;
    createdOn?: Date;
    tasks?: string[];
}

export interface IUserModel extends Model<IUser> {
    createUser(newUser: IUser);
    getUserByUsername(userName: string);
    getUserById(id: string);
}

// User Functions
UserSchema.static('createUser', (newUser: IUser) => {
    return User.create(newUser)
        .then((result: IUser) => result)
        .catch((error: MongoError) => error);
});

UserSchema.static('getUserByUsername', (userName: string) => {
    const query = { userName };
    return User.findOne(query)
        .select('-__v')
        .then((result: IUser) => result)
        .catch((error: MongoError) => error);
});

UserSchema.static('getUserById', (id: string) => {
    return User.findById(id)
        .select('-__v')
        .then((result: IUser) => result)
        .catch((error: MongoError) => error);
});

export const User = model<IUser>('User', UserSchema) as IUserModel;
