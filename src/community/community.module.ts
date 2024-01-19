import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './boards/boards.entity';
import { BoardsController } from './boards/boards.controller';
import { BoardsService } from './boards/boards.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
import { BoardsRepository } from './boards/boards.repository';
import { CommentRepository } from './comments/comments.repository';
import { S3Service } from '../common/s3.presigned';

@Module({
  imports: [TypeOrmModule.forFeature([Board])],
  controllers: [BoardsController, CommentsController],
  providers: [
    BoardsService,
    CommentsService,
    BoardsRepository,
    CommentRepository,
    S3Service,
  ],
})
export class CommunityModule {}
