import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private authService: AuthService, private router: Router, private dataService: DataService) { }

  async logout() {
    await this.authService.logout();
    localStorage.clear();
    setTimeout(() => {
      this.router.navigateByUrl('login')
    }, 1000);
  }

  entrarChat(curso: string) {
    this.dataService.setCurso = curso;
    setTimeout(() => {
      this.router.navigateByUrl('chat')
    }, 500);
  }
}
