import {MongoError} from 'mongodb';
import {Document, Model, model, Schema} from 'mongoose';
import {User} from './User';

const TaskSchema = new Schema({
    title: {
        type: String,
        required: true,
        minlength: 6
    },
    content: {
        type: String,
        required: true,
        minlength: 6
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    createdOn: {
        type: Date,
        default: Date.now()
    },
    updatedOn: {
        type: Date,
        default: Date.now()
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

export interface ITask extends Document {
    title: string;
    content: string;
    slug: string;
    createdOn?: Date;
    updatedOn?: Date;
    isCompleted?: Boolean;
    user?: string;
}

export interface ITaskModel extends Model<ITask> {
    getTasksByUser(user: string);
    getTaskBySlug(slug: string);
    createTask(newTask: ITask);
    updateTask(slug: string, updatedTask: ITask);
    deleteTask(slug: string);
}

TaskSchema.post('remove', async (task: ITask) => {
   const user = await User.getUserById(task.user);
   user.tasks.splice(user.tasks.indexOf(task._id), 1);
   user.save();
});

// Task Functions
TaskSchema.static('getTasksByUser', (user: string) => {
    const query = { user };
    return Task.find(query)
        .select('-__v')
        .populate('user', '-__v -password')
        .then((result: ITask[]) => result)
        .catch((error: MongoError) => error);
});

TaskSchema.static('getTaskBySlug', (slug: string) => {
    const query = { slug };
    return Task.findOne(query)
        .select('-__v')
        .populate('user', '-__v -password')
        .then((result: ITask) => result)
        .catch((error: MongoError) => error);
});

TaskSchema.static('createTask', (newTask: ITask) => {
    return Task.create(newTask)
        .then((result: ITask) => result)
        .catch((error: MongoError) => error);
});

TaskSchema.static('updateTask', (slug: string, updatedTask: ITask) => {
    const query = { slug };
    return Task.findOneAndUpdate(query, updatedTask, { new: true })
        .then((result: ITask) => result)
        .catch((error: MongoError) => error);
});

TaskSchema.static('removeTask', (slug: string) => {
    const query = { slug };
    return Task.findOneAndRemove(query)
        .then((result: ITask) => result)
        .catch((error: MongoError) => error);
});

export const Task = model<ITask>('Task', TaskSchema) as ITaskModel;
