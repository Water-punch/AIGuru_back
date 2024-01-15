import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './boards/boards.entity';
import { BoardsController } from './boards/boards.controller';
import { BoardsService } from './boards/boards.service';
import { CommentsController } from './comments/comments.controller';
import { CommentsService } from './comments/comments.service';
//import { BoardsRepository } from './boards/boards.repository';
import { CommentRepository } from './comments/comments.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Board])],
  controllers: [BoardsController, CommentsController],
  providers: [
    BoardsService,
    CommentsService,
    //BoardsRepository,
    CommentRepository,
  ],
})
export class CommunityModule {}
