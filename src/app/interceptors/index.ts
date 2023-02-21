
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CustomHttpInterceptor } from './http-interceptor';

export const INTERCEPTOR_PROVIDER = [
  { provide: HTTP_INTERCEPTORS, useClass: CustomHttpInterceptor, multi: true }
];
