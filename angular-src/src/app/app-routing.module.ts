import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from './components/login/login.component';
import {RegisterComponent} from './components/register/register.component';
import {DefaultComponent} from './layouts/default/default.component';
import {AuthComponent} from './layouts/auth/auth.component';
import {TasksComponent} from './components/tasks/tasks.component';
import {TaskAddComponent} from './components/tasks/task-add/task-add.component';
import {TaskDetailComponent} from './components/tasks/task-detail/task-detail.component';

const routes: Routes = [
    {
        path: '',
        component: DefaultComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent
            },
            {
                path: 'register',
                component: RegisterComponent
            }
        ]
    },
    {
        path: 'user/:id',
        component: AuthComponent,
        children: [
            {
                path: 'tasks',
                component: TasksComponent,
                children: [
                    {
                        path: 'add',
                        component: TaskAddComponent
                    },
                    {
                        path: ':taskId',
                        component: TaskDetailComponent
                    }
                ]
            }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
