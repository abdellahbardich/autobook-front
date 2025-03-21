// import { NgModule } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
// import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// import { RouterModule, RouterOutlet } from '@angular/router';

// import { AppRoutingModule } from './app-routing.module';
// import { AppComponent } from './app.component';
// import { AuthInterceptor } from './core/interceptors/auth.interceptor';
// import { HeaderComponent } from './shared/components/header/header.component';
// import { FooterComponent } from './shared/components/footer/footer.component';

// @NgModule({
//   declarations: [
//     AppComponent,
//     HeaderComponent,
//     FooterComponent
//   ],
//   imports: [
//     BrowserModule,
//     HttpClientModule,
//     ReactiveFormsModule,
//     FormsModule,
//     // RouterModule.forRoot([]), 
//     AppRoutingModule,
//     RouterOutlet
//   ],
//   providers: [
//     { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
//   ],
//   bootstrap: [AppComponent]
// })
// export class AppModule { }