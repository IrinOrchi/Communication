import { CommonModule } from '@angular/common';
import { Component, signal, OnInit } from '@angular/core';
import { CommunicationService } from '../../Services/communication.service';
import { Job } from '../../Models/communication';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-sent-emails',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sent-emails.component.html',
  styleUrl: './sent-emails.component.scss'
})
export class SentEmailsComponent implements OnInit {
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
  maxVisiblePages = 3; 
  i: number = 0;
  selectedEmailCategory = signal<string>('cv');
  selectedReadStatus = signal<string>('all');
  isInviteChecked = signal<boolean>(false); 
  companyId: string = '';
  c_Type: string = 'cv';
  jobId: number = 0;
  type: string = '';

  constructor(
    private communicationService: CommunicationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.companyId = params['companyId'];
      this.c_Type = params['c_Type'] || 'cv';
      this.jobId = params['jobId'] ? parseInt(params['jobId']) : 0;
      this.type = params['type'];

      if (this.companyId) {
        if (this.type === 'job' && this.jobId) {
          this.selectedEmailCategory.set('ap');
        } else if (this.c_Type === 'ap') {
          this.selectedEmailCategory.set('ap');
        } else if (this.c_Type === 'iv') {
          this.selectedEmailCategory.set('iv');
        }
        this.loadSentEmails(1);
      }
    });
    
    this.fetchJobs();
    this.checkedEmails = new Array(this.emails.length).fill(false);
  }

  loadSentEmails(pageNo: number, r_Type?: number): void {
    this.loading.set(true);
    this.emails = [];
    const companyId = localStorage.getItem('CompanyId') || '';
    const searchQuery = this.keyword.value?.trim() || '';
  
    let category = this.selectedEmailCategory();
    if (this.isInviteChecked()) {
      category = 'iv'; 
    }

    const startIndex = (pageNo - 1) * this.pageSize;

    if (this.type === 'job' && this.jobId) {
      this.communicationService.getJobSpecificEmails(companyId, this.jobId)
        .subscribe({
          next: (response) => {
            this.handleResponse(response, pageNo);
            if (searchQuery) {
              this.filterEmailsBySearch(searchQuery);
            }
          },
          error: (error) => {
            console.error('Error fetching job-specific emails:', error);
            this.loading.set(false);
          },
        });
    } else if (r_Type === undefined) {
      this.communicationService.getemailsinbox(companyId, pageNo, category, this.pageSize)
        .subscribe({
          next: (response) => {
            this.handleResponse(response, pageNo);
            if (searchQuery) {
              this.filterEmailsBySearch(searchQuery);
            }
          },
          error: (error) => {
            console.error('Error fetching sent emails:', error);
            this.loading.set(false);
          },
        });
    } else {
      this.communicationService.getemailsinbox(companyId, pageNo, category, this.pageSize, r_Type)
        .subscribe({
          next: (response) => {
            this.handleResponse(response, pageNo);
            if (searchQuery) {
              this.filterEmailsBySearch(searchQuery);
            }
          },
          error: (error) => {
            console.error('Error fetching sent emails:', error);
            this.loading.set(false);
          },
        });
    }
  }

  private filterEmailsBySearch(query: string): void {
    if (!query) return;
    
    const searchTerm = query.toLowerCase();
    this.emails = this.emails.filter(email => 
      email.job?.toLowerCase().includes(searchTerm)
    );
    this.totalRecords = this.emails.length;
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
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
      this.emails = response.data.emails || [];
      this.totalRecords = response.data.totalRecords || 0;
      this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
      this.currentPage = pageNo;
      
      if (this.emails.length > this.pageSize) {
        this.emails = this.emails.slice(0, this.pageSize);
      }
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
    this.loadSentEmails(1);
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
  get pagesToShow(): number[] {
    if (this.totalPages <= this.maxVisiblePages + 2) {
      return Array.from({ length: this.totalPages - 1 }, (_, i) => i + 2);
    }
    return [2, 3]; 
  }
  goToPage(pageNo: number): void {
    if (pageNo >= 1 && pageNo <= this.totalPages && pageNo !== this.currentPage) {
      this.currentPage = pageNo;
      this.loadSentEmails(this.currentPage);
    }
  }
  
  updatePageSize(event: any): void {
    this.pageSize = parseInt(event.target.value, 10);
    this.itemsPerPage = this.pageSize;
    this.currentPage = 1; 
    this.loadSentEmails(this.currentPage);
  }
  
  updateEmailCategory(category: string): void {
    this.selectedEmailCategory.set(category);
    this.c_Type = category;
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

  isSearchDisabled(): boolean {
    return (this.type === 'job' && this.jobId > 0) || this.selectedEmailCategory() === 'cv';
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

  isEmailCategoryDisabled(category: string): boolean {
    return this.type === 'job' && this.jobId > 0 && category !== 'ap';
  }
}