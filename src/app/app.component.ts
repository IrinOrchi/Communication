import { Component, isDevMode, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SalesContactComponent } from './components/sales-contact/sales-contact.component';
import { FooterComponent } from './layouts/footer/footer.component';
import { Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { NavComponent } from "./layouts/nav/nav.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, SalesContactComponent, FooterComponent, NavComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'employee-account';

  constructor(private router: Router, private titleService: Title) {}

  ngOnInit(): void {
    // Set initial title based on current route
    this.updateTitle(this.router.url);

    // Set up route change listener
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const route = event.urlAfterRedirects;
      this.updateTitle(route);
    });

    //local env
    // if (isDevMode()) {
    //   window.localStorage.setItem('CompanyId', 'IECwPxC=');
    //   window.localStorage.setItem('UserId', 'ZRG7PRSz');
    // }
  }

  private updateTitle(route: string): void {
    let pageTitle = 'Communication';
    
    if (route.startsWith('/sent-emails') || route.startsWith('/read-emails')) {
      pageTitle = 'Message Inbox | Bdjobs.com';
    } else if (route.startsWith('/email-template')) {
      pageTitle = 'Email Template(s) | Bdjobs.com';
    } else if (route.startsWith('/template-viewer')) {
      pageTitle = 'View Template | Bdjobs.com';
    } else if (route.startsWith('/template-editor')) {
      pageTitle = 'Template Editor | Bdjobs.com';
    } else if (route.startsWith('/template-creator')) {
      pageTitle = 'Template Creator | Bdjobs.com';
    } else if (route === '/' || route === '') {
      pageTitle = 'Communication | Bdjobs.com';
    }
    
    this.titleService.setTitle(pageTitle);
  }
}
