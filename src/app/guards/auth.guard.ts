import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private cookieService: CookieService, private router: Router) {}

  canActivate(): boolean {
    const companyId: string = window.localStorage.getItem('CompanyId') ?? '';
    if (companyId == "") {
      parent.location.replace('https://recruiter.bdjobs.com');
      return false;
    }
    return true;
  };
  
}
