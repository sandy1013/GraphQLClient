import { LoginService } from './app.login.service';
import { Injectable } from "@angular/core";
import { Apollo } from "apollo-angular";

export enum GraphQlEndpoints {
    Employee = "employee"
}

@Injectable() 
export class GraphQLService {

    constructor(private apollo:Apollo, private loginService:LoginService) {
        
    }

    public async AuthenticateGraphQL(endpoint: string) {
        const IsAuthenticated:boolean = await this.loginService.validateToken();
        
        console.log("IsAuthenticated: ", IsAuthenticated);
        if(!IsAuthenticated) return null;
        
        return this.apollo.use(endpoint);
    }
}