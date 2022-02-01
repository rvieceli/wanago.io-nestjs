import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getUserByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ email });

    if (!user) {
      throw new HttpException(
        'User not found with this email',
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }

  async create(user: CreateUserDto): Promise<User> {
    const newUser = this.usersRepository.create(user);

    await this.usersRepository.save(user);

    return newUser;
  }
}
