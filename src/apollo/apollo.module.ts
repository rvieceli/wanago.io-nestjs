import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path/posix';
import {
  ConfigurationModule,
  ConfigurationService,
} from 'src/configuration/configuration.module';
import { UsersLoader } from 'src/users/loaders/users.loader';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [ConfigurationModule, UsersModule],
      inject: [ConfigurationService, UsersService],
      useFactory: (
        configService: ConfigurationService,
        usersService: UsersService,
      ) => ({
        playground: Boolean(configService.get('GRAPHQL_PLAYGROUND')),
        autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
        subscriptions: {
          'graphql-ws': {
            // onConnect: (ctx) => {
            //   const { connectionParams, extra } = ctx
            //   return true;
            // },
          },
        },
        context: () => ({
          usersLoader: new UsersLoader(usersService),
        }),
      }),
    }),
  ],
})
export class ApolloModule {}
