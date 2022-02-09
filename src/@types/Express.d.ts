import { User as UserEntity } from '../users/entities/user.entity';

declare global {
  namespace Express {
    interface User extends UserEntity {
      password: never;
    }

    interface Request {
      _verifier?: number;
    }
  }
}

export {};
