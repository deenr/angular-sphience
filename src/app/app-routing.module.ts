import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {EmailVerificationComponent} from '@pages/email-verification/email-verification.component';
import {LandingPageComponent} from '@pages/landing-page/landing-page.component';
import {LoginComponent} from '@pages/login/login.component';
import {RegisterComponent} from '@pages/register/register.component';
import {NotFoundComponent} from '@pages/not-found/not-found.component';
import {PrivacyPolicyComponent} from '@pages/privacy-policy/privacy-policy.component';
import {ContactComponent} from '@pages/contact/contact.component';
import {AboutUsComponent} from '@pages/about-us/about-us.component';
import {NewsComponent} from '@pages/news/news.component';
import {ArticleComponent} from '@pages/news/article/article.component';
import {TermsOfServiceComponent} from '@pages/terms-of-service/terms-of-service.component';
import {AuthenticationComponent} from '@layouts/authentication/authentication.component';
import {HomeComponent} from '@layouts/home/home.component';
import {RegisterDetailsComponent} from '@pages/register/register-details/register-details.component';
import {InterfaceComponent} from '@layouts/interface/interface.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    children: [
      {path: '', component: LandingPageComponent},
      {path: 'privacy', component: PrivacyPolicyComponent},
      {path: 'terms', component: TermsOfServiceComponent},
      {path: 'not-found', component: NotFoundComponent},
      {path: 'contact', component: ContactComponent},
      {path: 'about', component: AboutUsComponent},
      {path: 'news', component: NewsComponent},
      {path: 'news/:id', component: ArticleComponent}
    ]
  },
  {
    path: '',
    component: AuthenticationComponent,
    children: [
      {path: 'login', component: LoginComponent},
      {path: 'register', component: RegisterComponent},
      {path: 'details', component: RegisterDetailsComponent},
      {path: 'verify', component: EmailVerificationComponent}
    ]
  },
  {
    path: 'app',
    component: InterfaceComponent,
    children: [{path: 'ee', component: InterfaceComponent}]
  },
  {path: '**', redirectTo: ''}
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule {}
