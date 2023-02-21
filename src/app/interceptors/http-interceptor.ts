import {
  HttpEvent, HttpHandler, HttpInterceptor, HttpRequest
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class CustomHttpInterceptor implements HttpInterceptor {

  constructor() {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (!req.headers.has('Content-Type')) {
      req = req.clone({
        headers: req.headers.set('Content-Type', 'application/json')
      });
    }

    req = this.addAuthToken(req);
    return next.handle(req);
  }

  private addAuthToken(request: HttpRequest<any>): HttpRequest<any> {
    const AUTH_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzYzY3NjA2ZDJiZjIyYTUwMTUxMTEyOSIsInJvbGUiOiJTdXBlciBBZG1pbiIsImF1dGhUeXBlIjoiQWRtaW4iLCJuYW1lIjoiUGFydGggUGF0ZWwiLCJlbWFpbEFkZHJlc3MiOiJwYXJ0aC5wYXRlbEBzaW1iaW90aWt0ZWNoLmNvbSIsInNlc3Npb24iOiIzZWVjYWNmYy00Mjg1LTRmYzQtODhhMC03NDVmZDBkNDM2M2YiLCJpYXQiOjE2NzY5ODUxNDIsImV4cCI6MTY3NzU4OTk0Mn0.AC00CaCCOHgtKQbCo2cmQhXtCVSRitsgvKmo4x9yTH8';
    if (!AUTH_TOKEN) {
      return request;
    }
    return request.clone({
      headers: request.headers.set('Authorization', `Bearer ${AUTH_TOKEN}`)
    });
  }
}
