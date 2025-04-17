import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NavResponse } from '../class/navbarResponse';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  constructor(private http: HttpClient) { }

  getNavbarData(payload:{companyId:string, userId:string}): Observable<NavResponse> {
    const baseUrl = 'https://recruiter.bdjobs.com/authentication/api/services';
    return this.http.post<NavResponse>(baseUrl,payload);
  }
}
