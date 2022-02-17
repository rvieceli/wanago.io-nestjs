import { GraphQLResolveInfo } from 'graphql';
import {
  parseResolveInfo,
  ResolveTree,
  simplifyParsedResolveInfoFragmentWithType,
} from 'graphql-parse-resolve-info';

export function relationsFromInfo(
  relations: string[],
  info: GraphQLResolveInfo,
) {
  const parsedInfo = parseResolveInfo(info) as ResolveTree;
  const simplifiedInfo = simplifyParsedResolveInfoFragmentWithType(
    parsedInfo,
    info.returnType,
  );

  return relations.filter((entity) => entity in simplifiedInfo.fields);
}
