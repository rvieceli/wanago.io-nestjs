import { PaginationParamsDto } from 'src/utils/dto/pagination-params.dto';

export class GetCommentsQuery {
  constructor(
    public readonly postId: number,
    public readonly pagination?: PaginationParamsDto,
  ) {}
}
