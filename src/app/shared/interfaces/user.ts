import {User as FirebaseUser} from 'firebase/auth';

export interface User extends FirebaseUser {
  firstName: string;
  lastName: string;
  department: string;
  field: string;
  studentId: string;
  yearOfGraduation: string;
  phoneNumber: string;
  setDetails: boolean;
}