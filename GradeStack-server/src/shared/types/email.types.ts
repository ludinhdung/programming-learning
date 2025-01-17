export enum EmailType {
  VERIFICATION = 'VERIFICATION',
  VERIFICATION_CODE = 'VERIFICATION_CODE',
  WELCOME = 'WELCOME',
  PASSWORD_RESET = 'PASSWORD_RESET',
  NOTIFICATION = 'NOTIFICATION'
}

export interface EmailTemplate {
  subject: string;
  html: string;
} 