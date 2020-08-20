import {HttpClient} from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { GoogleAuthService } from "ng-gapi/lib/src/GoogleAuthService";
import { Subject } from "rxjs";

export class Authentication {
    token: string;
    refresh: string;
    expiry: Date
}

@Injectable()
export class LoginService {
    loginSubject:Subject<string> = new Subject<string>();

    constructor(private googleAuthService: GoogleAuthService, private httpClient: HttpClient) {
        
    }

    fetchLoggedInUser() {
        this.loginSubject.next(localStorage.getItem("user") || null);
    }

    saveLoggedInUser(user: string) {
        localStorage.setItem("user", user);
    }

    signIn():any {
        const _googleAuth = this.googleAuthService.getAuth()
        .subscribe((auth) => {
            auth.signIn().then((response) => {
                localStorage.clear();
                console.log(response);
                localStorage.setItem("google_auth_token", response["wc"]["id_token"]);
                this.getToken().subscribe((loginResponse) => {
                  console.log(loginResponse);
                  this.saveLoggedInUser(response["rt"]["Ad"] + "(" + response["rt"]["$t"] + ")");
                  localStorage.setItem("expiry_date", new Date(loginResponse['expiry']).toString());
                  localStorage.setItem("jwt_token", loginResponse['token'].toString());
                  localStorage.setItem("refresh_token", loginResponse['refresh'].toString());
                  this.fetchLoggedInUser();
                }, (error) => {
                  console.log(error);
                });
            }).catch((error) => {
                console.log(error);
            });
        });
       return _googleAuth;
    }

    signOut() {
        console.log("signout  of the application.");
        this.googleAuthService.getAuth().subscribe((auth) => {
            try {
                auth.signOut().then(() => {
                    console.log("signout of google.");
                    auth.disconnect();
                    localStorage.clear();
                });
            } catch (e) {
                console.error(e);
            }
            localStorage.clear();
        });
    }

    refresh() {
        var data = {
            "token":  localStorage.getItem("jwt_token"),
            "refresh": localStorage.getItem("refresh_token")
        };
        return this.httpClient.post("https://localhost:44318/Authentication/Refresh", data).toPromise();
    }

    getToken() {
        var data = {
            "googleAuthToken": localStorage.getItem("google_auth_token") || ""
        };
        return this.httpClient.post("https://localhost:44318/Authentication/Login", data);
    }

    async validateToken(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            const fetch_expiry_date:string = localStorage.getItem("expiry_date") || null;
            
            if(fetch_expiry_date != null) {
                console.log("fetch_expiry_date", fetch_expiry_date);
                const expiry_date = new Date(fetch_expiry_date);
                const date_now = new Date();
                console.log("fetch_expiry_date", (expiry_date < date_now));
                if(expiry_date < date_now) {
                    this.refresh().then((response) => {
                        console.log("Success in refresh:", response);
                        localStorage.setItem("expiry_date", new Date(response['expiry']).toString());
                        localStorage.setItem("jwt_token", response['token'].toString());
                        localStorage.setItem("refresh_token", response['refresh'].toString());
                        resolve(true);
                    }, (error) => {
                        console.log("Error in refresh:", error);
                        resolve(false);
                    });
                } else {
                    resolve(true);
                }
            } else {
                resolve(false);
            }
        });
    }
}