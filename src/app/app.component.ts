import { Apollo } from 'apollo-angular';
import { LoginService } from './SharedModule/Services/app.login.service';
import { GraphQLService, GraphQlEndpoints } from './SharedModule/Services/app.graphql.service';
import { OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { gql } from 'apollo-angular';
import { Subscription } from 'rxjs';

interface Employee {
  employeeId: number;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: number;
} 

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'projectpotfolio';
  loading: boolean;
  loggedIn: false;
  showPopup:boolean = false;
  employeeList: Employee[] = [];
  isEmployeeListEmpty: boolean = true;
  loggedInUser: string = null;

  private querySubscription: Subscription;
  constructor(private graphQLService:GraphQLService, 
              private loginService: LoginService,
              private ref: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.loginService.loginSubject.subscribe((user: string) => {
      console.log(user);
      this.loggedInUser = user;
      this.ref.detectChanges();
    });
  }

  async fetchData() {
    let apolloServer = await this.graphQLService.AuthenticateGraphQL(GraphQlEndpoints.Employee);
    console.log("apolloServer: ", apolloServer);
    if(apolloServer)  {
      this.querySubscription = apolloServer.watchQuery({
        query: gql`
          {
            employees {
              employeeId
              firstName
              lastName
              email
            }
          
            employee(employeeFilter: { employeeId: 2 }) {
              firstName
            }
          }
        `,
        fetchPolicy: 'network-only'
      }).valueChanges.subscribe(({data, loading}) => {
        console.log(loading);
        console.log(data);
        this.employeeList = data["employees"] || [];
        if(this.employeeList.length) {
          this.isEmployeeListEmpty = false;
        } else {
          this.isEmployeeListEmpty = true;
        }
      }, (error) => {
        console.log(error);
      });
    } else {
      this.employeeList = [];
      this.isEmployeeListEmpty = true;
    }
  }

  async saveData(employee: Employee) {
    let apolloServer = await this.graphQLService.AuthenticateGraphQL(GraphQlEndpoints.Employee);
    console.log("apolloServer: ", apolloServer);
    if(apolloServer)  {
      this.querySubscription = apolloServer.mutate({
        mutation: gql`
          mutation ($employeeId: Int!, $firstName: String!, $lastName: String!, $dateOfBirth: Date!, $email: String!, $phoneNumber: String!) {
            addEmployee(employeeData: {
              employeeId: $employeeId,
              firstName: $firstName,
              lastName: $lastName,
              dateOfBirth: $dateOfBirth,
              email: $email,
              phoneNumber: $phoneNumber
            }) {
              firstName
              lastName
              email
            }
          }
        `,
        variables : {
          employeeId: employee.employeeId,
          firstName: employee.firstName,
          lastName: employee.lastName,
          dateOfBirth: employee.dateOfBirth,
          email: employee.email,
          phoneNumber: employee.phoneNumber
        }
      }).subscribe(async (response) => {
        console.log(response);
        await this.fetchData(); 
      }, (error) => {
        console.log(error);
      });
    } else {
      
    }
  }

  login() {
    this.loginService.signIn();
  }

  logout() {
    this.loginService.signOut();
    this.loginService.fetchLoggedInUser();
    this.employeeList = [];
    this.isEmployeeListEmpty = true;
  }

  openEmployeePopup() {
    this.showPopup = true;
  }

  async updateState(employee: Employee | null) {
    console.log(employee);
    if(employee) await this.saveData(employee);
    this.showPopup = false;
  }

  ngOnDestroy() {
    this.querySubscription.unsubscribe();
  }
}
