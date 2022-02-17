import { Injectable, Scope } from '@nestjs/common';
import * as DataLoader from 'dataloader';
import { UsersService } from '../users.service';

@Injectable({ scope: Scope.REQUEST })
export class UsersLoader {
  constructor(private usersService: UsersService) {}

  readonly batchUsers = new DataLoader(async (ids: number[]) => {
    const users = await this.usersService.getByIds(ids);
    const usersMap = new Map(users.map((user) => [user.id, user]));

    return ids.map((id) => usersMap.get(id));
  });
}
