import {NgModule} from '@angular/core';
import {APOLLO_OPTIONS, APOLLO_NAMED_OPTIONS} from 'apollo-angular';
import {ApolloClientOptions, InMemoryCache, ApolloLink, from} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import { HttpHeaders } from '@angular/common/http';

interface URI_CONFIG {
  name: string;
  uri: string;
}

const uri_config: URI_CONFIG[] = [{
    name: 'employee',
    uri: 'https://localhost:44318/api/employee'
  }, {
    name: 'payroll',
    uri: 'https://localhost:44318/api/payroll'
  }]; // <-- add the URL of the GraphQL server here

export function createApollo(httpLink: HttpLink): Record<string, ApolloClientOptions<any>> {
  var options = {};
  
  const authMiddleware = new ApolloLink((operation, forward) => {
    // add the authorization to the headers
    let token = localStorage.getItem("jwt_token") || null;
    operation.setContext({
      headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
    });

    return forward(operation);
  });
  
  for (let config_key in uri_config) {
    let config_object: URI_CONFIG = uri_config[config_key];
    options[config_object.name] = {
      name: config_object.name,
      link: from([authMiddleware, httpLink.create({uri: config_object.uri,  withCredentials: true})]),
      cache: new InMemoryCache()
    }
  }
  return options;
}

@NgModule({
  providers: [
    {
      provide: APOLLO_NAMED_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {
  
}
