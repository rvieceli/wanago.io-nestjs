import { User } from 'src/users/entities/user.entity';

export const mockedUser: User = {
  id: 1,
  email: 'some@user.com',
  name: 'Some',
  password: 'some$password',
  address: {
    id: 1,
    street: 'Some street, 23',
    city: 'City',
    country: 'Country',
  },
};
