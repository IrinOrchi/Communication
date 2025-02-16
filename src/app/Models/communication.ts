export interface Job {
    job: string;
    publishDate: Date;
    sentEmail: number;
    readEmail: number;
  }

  export interface EmailTemplate {
    templateID: number;
    tmplateTitle: string;
    updatedOn: string; 
  }