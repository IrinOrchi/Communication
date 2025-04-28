import { Routes } from '@angular/router';
import { CommunicationComponent } from './pages/communication/communication.component';
import { EmailTemplateComponent } from './pages/email-template/email-template.component';
import { TemplateViewerComponent } from './pages/template-viewer/template-viewer.component';
import { TemplateEditorComponent } from './pages/template-editor/template-editor.component';
import { SentEmailsComponent } from './pages/sent-emails/sent-emails.component';
import { ReadEmailsComponent } from './pages/read-emails/read-emails.component';
import { TemplateCreatorComponent } from './pages/template-creator/template-creator.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  
    {
        path:'',
        component: CommunicationComponent,
        canActivate: [AuthGuard], 

    },
    {
        path:'email-template',
        component: EmailTemplateComponent,
        canActivate: [AuthGuard], 

    },
    {
        path:'template-viewer',
        component: TemplateViewerComponent,
        canActivate: [AuthGuard], 

    },
    {
        path:'template-editor',
        component: TemplateEditorComponent,
        canActivate: [AuthGuard], 

    },
    {
        path:"sent-emails",
        component: SentEmailsComponent,
        canActivate: [AuthGuard], 

    },
    {
        path:'read-emails',
        component: ReadEmailsComponent,
        canActivate: [AuthGuard], 

    },
    {
        path:'template-creator',
        component: TemplateCreatorComponent,
        canActivate: [AuthGuard], 

    }
];