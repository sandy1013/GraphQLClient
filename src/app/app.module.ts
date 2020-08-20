import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { environment } from '../environments/environment';
import {
  GoogleApiModule,
  NgGapiClientConfig,
  NG_GAPI_CONFIG} from "ng-gapi/lib/src";
import { LoginService } from './SharedModule/Services/app.login.service';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { GraphQLService } from './SharedModule/Services/app.graphql.service';
import { EmployeePopupComponent } from './SharedModule/EmployeeModule/EmployeePopup/app.employee.popup.component';

let gapiClientConfig: NgGapiClientConfig = {
  client_id: environment.googleAuth_Client_id,
  discoveryDocs:environment.googleAuth_discoverDocs ,
  redirect_uri: environment.googleAuth_Redirect_uri,
  scope: [
    environment.googleAuth_Scope
  ].join(" ")
};

@NgModule({
  declarations: [
    AppComponent,
    EmployeePopupComponent
  ],
  imports: [
    BrowserModule,
    GoogleApiModule.forRoot({
      provide: NG_GAPI_CONFIG,
      useValue: gapiClientConfig,
    }),
    GraphQLModule,
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [LoginService, GraphQLService],
  bootstrap: [AppComponent]
})
export class AppModule { }
