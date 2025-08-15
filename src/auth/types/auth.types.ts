import { GoogleUser } from './google.types';

export interface JwtUserData {
  id: string;
  username: string;
  role: string;
}

declare module 'express' {
  interface Request {
    user?: JwtUserData | GoogleUser;
  }
}
