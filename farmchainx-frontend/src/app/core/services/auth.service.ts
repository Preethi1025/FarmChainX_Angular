import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {

  /* ---------------- STATE ---------------- */

  private userSubject = new BehaviorSubject<any>(null);
  user$ = this.userSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(true);
  loading$ = this.loadingSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const stored = localStorage.getItem('user');
    if (stored) {
      this.userSubject.next(JSON.parse(stored));
    }
    this.loadingSubject.next(false);
  }

  /* ---------------- GETTERS ---------------- */

  /** preferred modern usage */
  get user() {
    return this.userSubject.value;
  }

  /** used by AuthGuard */
  get userValue() {
    return this.userSubject.value;
  }

  /** 🔥 BACKWARD COMPATIBILITY (FIXES YOUR ERROR) */
  getUser() {
    return this.userSubject.value;
  }

  get loading() {
    return this.loadingSubject.value;
  }

  /* ---------------- MUTATORS ---------------- */

  setUser(user: any) {
    this.userSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  /* ---------------- AUTH ---------------- */

  async login(email: string, password: string): Promise<any> {
    this.loadingSubject.next(true);

    try {
      const res = await firstValueFrom(
        this.http.post<any>('http://localhost:8080/api/auth/login', {
          email,
          password
        })
      );

      // backend may return { user: {...} } OR {...}
      const user = res.user ?? res;
      this.setUser(user);

      return user;

    } finally {
      this.loadingSubject.next(false);
    }
  }

  async register(data: any): Promise<any> {
    this.loadingSubject.next(true);

    try {
      return await firstValueFrom(
        this.http.post<any>('http://localhost:8080/api/auth/register', data)
      );
    } finally {
      this.loadingSubject.next(false);
    }
  }

  logout() {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
