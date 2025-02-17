import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { CommunicationService } from '../../Services/communication.service';
import { Job } from '../../Models/communication';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sent-emails',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sent-emails.component.html',
  styleUrl: './sent-emails.component.scss'
})
export class SentEmailsComponent {
  jobs: Job[] = [];
  checkedEmails: boolean[] = [];
  selectedEmails: number[] = [];
  emails: any[] = [];
  totalRecords: number = 0;
  totalPages: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  itemsPerPage: number = 10;
  loading = signal<boolean>(false); 
  emailDetail: any = null; 
  expandedEmailIndex: number | null = null; 
  keyword = new FormControl('');
  isDeleteSelectedVisible: boolean = false;

  selectedEmailCategory = signal<string>('cv');
  selectedReadStatus = signal<string>('all');
  isInviteChecked = signal<boolean>(false); 

  constructor(private communicationService: CommunicationService , private router: Router) {}

  ngOnInit(): void {
    this.loadSentEmails(this.currentPage);
    this.fetchJobs();
    this.checkedEmails = new Array(this.emails.length).fill(false);


  }

  loadSentEmails(pageNo: number, r_Type?: number): void {
    this.loading.set(true);
    this.emails = [];
    const companyId = this.communicationService.getCompanyId();
  
    let category = this.selectedEmailCategory();
    if (this.isInviteChecked()) {
      category = 'iv'; 
    }
  
    if (r_Type === undefined) {
      this.communicationService.getemailsinbox(companyId, pageNo, category, this.pageSize)
        .subscribe({
          next: (response) => {
            this.handleResponse(response, pageNo);
          },
          error: (error) => {
            console.error('Error fetching sent emails:', error);
          },
        });
    } else {
      this.communicationService.getemailsinbox(companyId, pageNo, category, this.pageSize, r_Type)
        .subscribe({
          next: (response) => {
            this.handleResponse(response, pageNo);
          },
          error: (error) => {
            console.error('Error fetching sent emails:', error);
          },
        });
    }
  }
  isAllSelected(): boolean {
    return this.selectedEmails.length === this.emails.length;
  }
  
  
  toggleAllCheckboxes(event: any): void {
    if (event.target.checked) {
      this.selectedEmails = this.emails.map(email => email.rId); 
    } else {
      this.selectedEmails = []; 
    }
  }
  
  toggleCheckbox(index: number, event: any): void {
    if (event.target.checked) {
      this.selectedEmails.push(this.emails[index].rId); 
    } else {
      this.selectedEmails = this.selectedEmails.filter(id => id !== this.emails[index].rId); 
    }
  }
  toggleDeleteButton(): void {
    this.isDeleteSelectedVisible = !this.isDeleteSelectedVisible;  
  }
  deleteSelectedEmails(): void {
    if (this.selectedEmails.length === 0) {
      return;
    }
    const companyId = this.communicationService.getCompanyId();
    const requestPayload = { companyId, rIds: this.selectedEmails };
    this.communicationService.deleteEmail(requestPayload).subscribe({
      next: (response) => {
        if (response.responseType === 'Success') {
          this.emails = this.emails.filter(email => !this.selectedEmails.includes(email.rId)); 
          this.selectedEmails = []; 
          this.isDeleteSelectedVisible = false;
        }
      },
    });
  }
  handleResponse(response: any, pageNo: number): void {
    if (response.responseType === 'success' && response.data) {
      this.emails = [...response.data.emails];
      this.totalRecords = response.data.totalRecords;
      this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
      this.currentPage = pageNo;
    }
    this.loading.set(false);
  }
  toggleEmailDetail(index: number): void {
    if (this.expandedEmailIndex === index) {
      this.expandedEmailIndex = null;  
      this.emailDetail = null;  
    } else {
      this.expandedEmailIndex = index;  
      const rId = this.emails[index].rId;
      const name = this.emails[index].name;
      this.getEmailDetails(rId, name);
    }
  }
  redirectTo(url: string) {
    window.location.href = url;
  }
  
  fetchJobs(searchQuery: string = ''): void {
    const companyId = this.communicationService.getCompanyId();
    this.loading.set(true);
    this.communicationService.getJobEmails(companyId, this.currentPage, searchQuery).subscribe(response => {
      if (response.data && response.data.list?.length > 0) {
        this.jobs = response.data.list;
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

  getEmailDetails(rId: number, name: string): void {
    this.communicationService.getEmailDetails(rId, name).subscribe({
      next: (response) => {
        if (response.responseType === 'success' && response.data) {
          this.emailDetail = response.data;
        }
      },
      error: (error) => {
        console.error('Error fetching email details:', error);
      },
    });
  }
  goToPage(pageNo: number): void {
    if (pageNo >= 1 && pageNo <= this.totalPages) {
      this.loadSentEmails(pageNo);
    }
  }
  updatePageSize(event: any): void {
    this.pageSize = parseInt(event.target.value, 10);
    this.currentPage = 1; 
    this.loadSentEmails(this.currentPage);
  }
  
  updateEmailCategory(category: string): void {
    this.selectedEmailCategory.set(category);
    this.isInviteChecked.set(false); 
    this.loadSentEmails(1);
  }

  updateReadStatus(status: string): void {
    this.selectedReadStatus.set(status);
    const r_Type = this.getReadStatusValue(status) ?? undefined;
    this.loadSentEmails(1, r_Type);
  }
  

  getReadStatusValue(status: string): number | null {
    if (status === 'read') return 1;
    if (status === 'unread') return 0;
    return null;
  }

  isInviteDisabled(): boolean {
    return this.selectedEmailCategory() === 'cv';
  }

  toggleInviteSelection(): void {
    if (!this.isInviteDisabled()) {
      this.isInviteChecked.set(!this.isInviteChecked());
      this.loadSentEmails(1);
    }
  }
  getStartIndex(): number {
    return (this.currentPage - 1) * this.itemsPerPage + 1;
  }
  getEndIndex(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalRecords);
  }
  deleteEmail(rId: number): void {
    const companyId = this.communicationService.getCompanyId();
    const requestPayload = { companyId, rIds: [rId] };
  
    this.communicationService.deleteEmail(requestPayload).subscribe({
      next: (response) => {
        if (response.responseType === 'Success') {
          this.emails = this.emails.filter(email => email.rId !== rId);
        }
      },
      error: (error) => {
        console.error('Error during delete operation:', error);
      }
    });
  }
  redirectToEmailTemplate(): void {
    this.router.navigate(['/email-template'], );
  }
}