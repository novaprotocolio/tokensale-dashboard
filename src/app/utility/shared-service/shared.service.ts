import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../shared-model/shared-user.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { APPStorage } from '../constants/storage';
import { CommonFunctions } from '../common-functions';
import { RouteConstants } from '../constants/routes';
import { Wallet } from '../shared-model/wallet.model';
declare var mixpanel;
@Injectable()
export class SharedService {
  mixpanel;
  private _storage: Storage;

  constructor(private router: Router) {
    this._storage = localStorage || sessionStorage;
  }

  commonFunctions = new CommonFunctions();
  private _user: User;
  private _pass: string;
  private _refer: string;
  private _wallet: Wallet;
  private isProfileUpdated: BehaviorSubject<boolean> = new BehaviorSubject<
    boolean
  >(false);

  /* Shared LoggedIn Param */

  private isLoginRequired: BehaviorSubject<boolean> = new BehaviorSubject<
    boolean
  >(false);

  getLoginRequired(): Observable<boolean> {
    return this.isLoginRequired.asObservable();
  }

  setLoginRequired(val: boolean): void {
    this.isLoginRequired.next(val);
  }

  /* Shared LoggedIn Param */

  /* Shared Loader Param */

  private isLoading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  private taskCount: number = 0;

  getLoader(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  setLoader(val: boolean): void {
    if (val) {
      this.taskCount += 1;
    } else {
      this.taskCount -= 1;
      this.taskCount != 0 ? (val = true) : '';
    }
    this.isLoading.next(val);
  }

  private isOpenTokenTermModel: BehaviorSubject<any> = new BehaviorSubject<any>(
    false
  );

  getTokenTermModal(): Observable<any> {
    return this.isOpenTokenTermModel.asObservable();
  }

  setTokenTermModal(val: any): void {
    this.isOpenTokenTermModel.next(val);
  }

  /* Shared Loader Param */

  /* Shared User Token Param */

  private _token: string = '';

  setToken(value: string): void {
    this._storage.setItem(APPStorage.TOKEN, value);
    this._token = value;
  }

  getToken(): string {
    if (!CommonFunctions.isValidString(this._token)) {
      this._token = this._storage.getItem(APPStorage.TOKEN) || '';
      // this.setToken(this._token);
    }
    return this._token;
  }

  /* Common Methods */
  isLoggedIn(): boolean {
    return CommonFunctions.isValidString(this.getToken()) ? true : false;
  }

  logout(): void {
    this._storage.clear();
    this.setToken(null);
    this.setWalletAddress();
    this.setUser(null);
    this.setLoginRequired(true);
    // this.router.navigate(['/']);
    // force reload
    window.location.href = '/';
  }

  getProfileUpdated(): Observable<boolean> {
    return this.isProfileUpdated.asObservable();
  }

  getUser(): User {
    if (!this._user) {
      this._user = JSON.parse(this._storage.getItem(APPStorage.USER));
      this.setUser(this._user);
      this.getProfileUpdated();
    }
    return this._user;
  }

  setUser(value: User): void {
    this._storage.setItem(APPStorage.USER, JSON.stringify(value));
    this._user = value;
    this.isProfileUpdated.next(true);
  }

  /* Shared Language Param */
  private langulage;

  getLanguage() {
    return (this.langulage = localStorage.getItem(APPStorage.LANG));
  }

  setLanguage(val: string) {
    localStorage.setItem(APPStorage.LANG, val);
  }

  get getWalletAddress(): Wallet {
    if (!this._wallet) {
      this._user = this.getUser();
      this._wallet = this.commonFunctions.decryptObject(
        this.getPass(),
        this._user.encryptContainer
      );
    }
    // console.log(this._wallet.address);
    return this._wallet;
  }

  setWalletAddress() {
    this._wallet = null;
  }

  getPass(): string {
    if (!this._pass) {
      this._pass = this._storage.getItem(APPStorage.PASS);
    }
    return this._pass;
  }

  getPrivateKey(pass): string {
    return this.commonFunctions.privateKeyReturn(pass, this.getWalletAddress);
  }

  setPass(value: string) {
    this._pass = value;
    this._storage.setItem(APPStorage.PASS, value);
  }

  setRefer(value: string) {
    this._refer = value;
    this._storage.setItem(APPStorage.REFER, value);
  }

  getRefer(): string {
    if (!this._refer) {
      this._refer = this._storage.getItem(APPStorage.REFER);
    }
    return this._refer;
  }

  trackMixPanelEvent(value) {
    console.log(value);
    // mixpanel.track(value);
  }
}
