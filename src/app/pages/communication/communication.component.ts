import { Component, Input, OnInit, signal } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommunicationService } from '../../Services/communication.service';
import { CommonModule, DatePipe } from '@angular/common';
import { SalesContactComponent } from '../../components/sales-contact/sales-contact.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { Router } from '@angular/router';
import { Job } from '../../Models/communication';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [ReactiveFormsModule , CommonModule,],
  templateUrl: './communication.component.html',
  styleUrl: './communication.component.scss'
})
export class CommunicationComponent implements OnInit {
  jobs: Job[] = [];
  sentEmails = signal({ cv: 0, applicants: 0, invitation: 0 });
  readEmails = signal({ cv: 0, applicants: 0, invitation: 0 });
  keyword = new FormControl('');
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  loading = signal<boolean>(false); 

  totalPagesArray: number[] = [];
  companyId: string = 'ZxU0PRC='; 
  constructor(private communicationService: CommunicationService, private router: Router) {}

  ngOnInit(): void {
    this.communicationService.setCompanyId(this.companyId);
    this.communicationService.getCompanyId();
    this.fetchEmails();
    this.fetchJobs();

  }
  redirectTo(url: string) {
    window.location.href = url;
  }
  // fetchJobs(searchQuery: string = ''): void {
  //   const companyId = 'ZxU0PRC=';  
  //   const pageNo = this.currentPage; 
    
  //   this.communicationService.getJobEmails(companyId, pageNo, searchQuery).subscribe(response => {
  //     if (response.data && response.data.list && response.data.list.length > 0) {
  //       this.jobs = response.data.list;
  //     } else {
  //       this.jobs = []; 
  //     }
  //   });
  // }
  
  fetchJobs(searchQuery: string = ''): void {
    this.loading.set(true);
    this.communicationService.getJobEmails(this.companyId, this.currentPage, searchQuery).subscribe(response => {
      if (response.data && response.data.list?.length > 0) {
        this.jobs = response.data.list;
        this.totalPages = response.data.totalPages;
        this.totalPagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      } else {
        this.jobs = [];
      }
      this.loading.set(false);

    });
  }
  onSearch(): void {
    const query = this.keyword.value?.trim();
    this.fetchJobs(query);
  }

  changePage(direction: number): void {
    const newPage = this.currentPage + direction;
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.currentPage = newPage;
      this.fetchJobs();
    }
  }
  fetchEmails(): void {
    this.communicationService.getEmailsOverview(this.companyId).subscribe(response => {
      if (response.responseType === 'success' && response.data?.list) {
        this.jobs = response.data.list.map((item: any) => ({
          title: item.job,
          publishedDate: new Date(item.publishDate),
          sentEmails: item.sentEmail,
          readEmails: item.readEmail
        }));
  
        this.sentEmails.set({
          cv: response.data.emailCVbank,
          applicants: response.data.emailByJobs,
          invitation: response.data.invited
        });
  
        this.readEmails.set({
          cv: response.data.readEmailCVbank,
          applicants: response.data.readEmailbyJobs,
          invitation: response.data.invitedRead
        });
      }
    });
  }
  redirectToEmailTemplate(): void {
    this.router.navigate(['/email-template'], { queryParams: { companyId: this.companyId } });
  }
  redirectToSentEmails() {
    this.router.navigate(['/sent-emails']); 
  }
  redirectToReadEmails() {
    this.router.navigate(['/read-emails']);
  }
}
  


