import { CategoryPermission } from 'src/categories/permission.enum';
import { PostPermission } from 'src/posts/permission.enum';

export const Permission = {
  ...PostPermission,
  ...CategoryPermission,
};

export type Permission = PostPermission | CategoryPermission;
