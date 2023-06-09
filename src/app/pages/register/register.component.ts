import {Component, OnInit} from '@angular/core';
import {RegistrationStep} from './registration-step.enum';
import {ProgressStep} from '@custom-components/progress-steps/progress-step.interface';
import {FormGroup, FormControl, Validators} from '@angular/forms';
import {matchValidator} from '@shared/helper/validator/match-validator';
import {MatDialog} from '@angular/material/dialog';
import {DialogType} from '@custom-components/dialogs/dialog-type.enum';
import {StackedLeftDialogComponent} from '@custom-components/dialogs/stacked-left-dialog/stacked-left-dialog.component';
import {SupabaseService} from '@shared/services/supabase/supabase.service';
import {finalize, interval, scan, take} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  public emailForm: FormGroup<{
    email: FormControl<string>;
  }> = new FormGroup({
    email: new FormControl(null, [Validators.required, Validators.email])
  });

  public passwordForm: FormGroup<{
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
  }> = new FormGroup({
    password: new FormControl(null, [Validators.required, Validators.minLength(8)]),
    confirmPassword: new FormControl(null, [Validators.required, Validators.minLength(8)])
  });

  public verificationCodeForm: FormGroup<{
    verificationCode: FormControl<string>;
  }> = new FormGroup({
    verificationCode: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(6)])
  });

  public registrationStep = RegistrationStep;

  public steps = [
    {
      stepName: RegistrationStep.EMAIL,
      svgIcon: 'user',
      complete: false,
      current: true,
      text: 'Your details',
      supportingText: 'Enter your email'
    },
    {
      stepName: RegistrationStep.PASSWORD,
      svgIcon: 'lock',
      complete: false,
      current: false,
      text: 'Choose a password',
      supportingText: 'Choose a secure password'
    },
    {
      stepName: RegistrationStep.EMAIL_VERIFICATION,
      svgIcon: 'mail',
      complete: false,
      current: false,
      text: 'Verification',
      supportingText: 'Verify your account'
    }
  ] as ProgressStep[];

  public loadingSignUp = false;

  public timeToSendNewEmailVerification: number;
  public canResendVerification = false;
  public canEnterCodeManually = false;
  public loadingVerification = false;
  public emailVerified = false;

  public constructor(private readonly dialog: MatDialog, private readonly supabaseService: SupabaseService, private readonly router: Router) {}

  public ngOnInit(): void {
    this.passwordForm.addValidators(matchValidator(this.passwordForm.controls.password, this.passwordForm.controls.confirmPassword));
  }

  public getTitle(): string {
    switch (this.getCurrentProgressStep().stepName) {
      case RegistrationStep.EMAIL:
        return 'Create an account';
      case RegistrationStep.PASSWORD:
        return 'Choose a password';
      case RegistrationStep.EMAIL_VERIFICATION:
        return this.emailVerified ? 'Email verified' : 'Check your email';
      default:
        return '';
    }
  }

  public getSubtitle(): string {
    switch (this.getCurrentProgressStep().stepName) {
      case RegistrationStep.EMAIL:
        return 'Sign up in less than 2 minutes.';
      case RegistrationStep.PASSWORD:
        return 'Must be at least 8 characters.';
      case RegistrationStep.EMAIL_VERIFICATION:
        return this.emailVerified ? 'Your password has been successfully reset. Click below to log in magically.' : `We sent a verification link to ${this.emailForm.value.email}`;
      default:
        return '';
    }
  }

  public canShowStep(stepName: RegistrationStep): boolean {
    return this.steps.find((progressStep: ProgressStep) => progressStep.stepName === stepName).current;
  }

  public goToPassword(): void {
    // this.openDashboard();
    if (this.emailForm.valid) {
      this.setCurrentProgressStep(RegistrationStep.PASSWORD);
    }
  }

  public goToEmailVerification(): void {
    if (this.passwordForm.valid) {
      this.loadingSignUp = true;

      this.supabaseService.signUp(this.emailForm.value.email, this.passwordForm.value.password).then(() => {
        this.setCurrentProgressStep(RegistrationStep.EMAIL_VERIFICATION);
        this.setResendCountdown();
        this.loadingSignUp = false;
      });
    }
  }

  public getResendText(): string {
    return this.canResendVerification ? 'Click to resend' : `Wait ${this.timeToSendNewEmailVerification} seconds to resend`;
  }

  public resendVerification(): void {
    if (this.canResendVerification) {
      this.setResendCountdown();
      this.supabaseService.resendEmailVerification(this.emailForm.value.email);
    }
  }

  public openDashboard(): void {
    this.dialog.open(StackedLeftDialogComponent, {
      width: '400px',
      data: {
        type: DialogType.WARNING,
        icon: 'lock',
        title: 'Dashboard is not available yet',
        description: 'Our team is diligently working towards making our incredible dashboard available to you.'
      }
    });
  }

  public getVerificationButtonText(): string {
    if (this.emailVerified) {
      return 'Continue';
    } else {
      return this.canEnterCodeManually ? 'Verify email' : 'Enter code manually';
    }
  }

  public onVerificationButtonClick(): void {
    if (this.emailVerified) {
      this.router.navigateByUrl('/login');
    } else if (!this.canEnterCodeManually) {
      this.canEnterCodeManually = true;
    } else {
      this.verificationCodeForm.markAllAsTouched();

      if (this.verificationCodeForm.valid) {
        this.loadingVerification = true;

        this.supabaseService.verifyEmail(this.verificationCodeForm.value.verificationCode, this.emailForm.value.email).then(({data, error}) => {
          if (error) {
            this.dialog.open(StackedLeftDialogComponent, {
              width: '450px',
              data: {
                type: DialogType.ERROR,
                icon: 'exclamation-circle',
                title: 'Error verifying email',
                description: error.message
              }
            });
          } else {
            this.emailVerified = true;
          }
          this.loadingVerification = false;
        });
      }
    }
  }

  private setResendCountdown(): void {
    this.canResendVerification = false;
    this.timeToSendNewEmailVerification = 60;
    const numberOfSeconds = this.timeToSendNewEmailVerification - 1;
    interval(1000)
      .pipe(
        scan((accumulator: number, _current: number) => accumulator - 1, numberOfSeconds + 1),
        take(numberOfSeconds + 1),
        finalize(() => (this.canResendVerification = true))
      )
      .subscribe((value: number) => (this.timeToSendNewEmailVerification = value));
  }

  private setCurrentProgressStep(registrationStep: RegistrationStep): void {
    let progressStepChanged = false;
    this.steps = this.steps.map((progressStep: ProgressStep) => {
      if (!progressStepChanged) {
        if (progressStep.stepName === registrationStep) {
          progressStepChanged = true;
          return {...progressStep, current: true};
        } else {
          return {...progressStep, complete: true, current: false};
        }
      }

      return progressStep;
    });
  }

  private getCurrentProgressStep(): ProgressStep {
    return this.steps.find((progressStep: ProgressStep) => progressStep.current);
  }
}
