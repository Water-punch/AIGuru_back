import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeORMConfig } from './configs/typeorm.config';
import { CommunityModule } from './community/community.module';
import { APP_FILTER } from '@nestjs/core';
import { ServiceExceptionToHttpExceptionFilter } from './common/exception-filter';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeORMConfig),
    UserModule,
    CommunityModule,
    OrderModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: ServiceExceptionToHttpExceptionFilter },
  ],
})
export class AppModule {}
