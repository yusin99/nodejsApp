import { Injectable } from '@angular/core';
import {
  SocialAuthService,
  GoogleLoginProvider,
  SocialUser,
  FacebookLoginProvider,
} from 'angularx-social-login';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  auth = false;
  private readonly API_KEY = 'http://localhost:3000/api/';
  user: any = {};
  authState$ = new BehaviorSubject<boolean>(this.auth);
  userData$ = new BehaviorSubject<SocialUser>(this.user);

  constructor(
    private authService: SocialAuthService,
    private httpClient: HttpClient,
    private Router: Router
  ) {
    authService.authState.subscribe((user: SocialUser) => {
      if (user != null) {
        this.auth = true;
        this.authState$.next(this.auth);
        this.userData$.next(user);
      }
    });
  }

  //  Login User with Email and Password
  loginUser(email: string, mdp: string) {
    this.httpClient
      .post(`${this.API_KEY}auth/login`, { email, mdp })
      .subscribe((data: any) => {
        console.log(data);
        // var data1 = JSON.parse(window.localStorage.getItem('user') || '');
        // if (typeof data1 === 'object') {
        // } else {
        //   window.localStorage.setItem('user', JSON.stringify(data));
        // }
        this.auth = data.auth;
        this.authState$.next(this.auth);
        this.userData$.next(data);
      });
  }
  registerUser(
    email: string,
    mdp: string,
    pseudo: string,
    nom: string,
    prenom: string
  ) {
    this.httpClient
      .post(`${this.API_KEY}auth/register`, { email, mdp, pseudo, nom, prenom })
      .subscribe((data: any) => {
        console.log(data);
        this.auth = data.auth;
        if (data.message === 'Registration successful') {
          this.Router.navigate(['/login']);
        } else {
          console.log('error');
        }
        // this.authState$.next(this.auth);
        // this.userData$.next(data);
      });
  }

  //  Google Authentication
  googleLogin() {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID);
  }
  facebookLogin(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
  }

  logout() {
    this.authService.signOut();
    this.auth = false;
    this.authState$.next(this.auth);
    window.localStorage.removeItem('user');
  }
}

export interface ResponseModel {
  type: string;
  token: string;
  auth: boolean;
  email: string;
  nom: string;
  pseudo: string;
  prenom: string;
  photoUrl: string;
  idClient: number;
}
