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
        // canActivate: [AuthGuard], 

    },
    {
        path:'email-template',
        component: EmailTemplateComponent
    },
    {
        path:'template-viewer',
        component: TemplateViewerComponent
    },
    {
        path:'template-editor',
        component: TemplateEditorComponent
    },
    {
        path:"sent-emails",
        component: SentEmailsComponent
    },
    {
        path:'read-emails',
        component: ReadEmailsComponent
    },
    {
        path:'template-creator',
        component: TemplateCreatorComponent
    }
];