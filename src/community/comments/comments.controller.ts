import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsReadService } from './comments-read.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';
import { LocalAuthGuard } from 'src/user/guards/local-service.guard';
import { Mylogger } from './logger/mylogger.service';
import { Comment } from './entity/comments.entity';

import * as dayjs from 'dayjs';
import { QuerySetPage } from './decorator/query-param.decorator';
import { GetUser } from 'src/common/decorator/get-user.decorator';

@Controller('comments')
export class CommentsController {
  private logger = new Mylogger(CommentsController.name);
  constructor(
    private commentsService: CommentsService,
    private commentsReadService: CommentsReadService,
  ) {}

  // 출력 확인용 API
  @Get('logger')
  getLogger(): string {
    this.logger.error('this is error');
    this.logger.warn('this is warn');
    this.logger.log('this is log');
    this.logger.verbose('this is verbose');
    this.logger.debug('this is debug');
    const d = dayjs();
    this.logger.verbose(`현재 설정된 시간 : ${d.format()}`);
    this.logger.verbose(
      `현재 설정된 시간 : ${d.format('YYYY-MM-DD HH:mm:ss')}`,
    );
    return 'success!';
  }

  // 자신이 작성한 댓글 목록 조회
  @Get('/my')
  @UseGuards(LocalAuthGuard)
  getMyComments(
    @GetUser() userId: string,
    @QuerySetPage() querySetPage: { page: number; limit: number },
  ): Promise<{ count: number; list: Comment[] }> {
    const { page, limit } = querySetPage;

    this.logger.verbose(`현재 설정된 userId: ${userId}`);
    const comments = this.commentsReadService.getMyComments(
      userId,
      page,
      limit,
    );
    return comments;
  }

  // 게시글에 작성된 댓글 목록 조회
  @Get('/:boardId')
  async getBoardComments(
    @Param('boardId', ParseIntPipe) boardId: number,
    @QuerySetPage() querySetPage: { page: number; limit: number },
  ): Promise<{
    count: number;
    list: Comment[];
    positiveCount: number;
    negativeCount: number;
  }> {
    const { page, limit } = querySetPage;

    this.logger.verbose(`${boardId}번 게시글의 댓글 조회!`);

    const comments = await this.commentsReadService.getBoardComments(
      boardId,
      page,
      limit,
    );
    return comments;
  }

  // 테스트용 전체 조회
  @Get('/')
  getAllComments(): Promise<Comment[]> {
    this.logger.log(`get 요청 받아짐`);
    return this.commentsReadService.getAllComments();
  }

  //댓글 작성
  @Post('/')
  @UseGuards(LocalAuthGuard)
  @UsePipes(ValidationPipe)
  createComment(
    @GetUser() userId: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    this.logger.log(`댓글 작성 요청!\n현재 설정된 userId: ${userId}`);
    const result = this.commentsService.createComment(userId, createCommentDto);

    return result;
  }

  // 댓글 삭제 : 삭제하지 않고 상태만 변경 status: not_deleted -> deleted
  @UseGuards(LocalAuthGuard)
  @Delete('/:commentId')
  @HttpCode(204)
  deleteComment(
    @GetUser() userId: string,
    @Param('commentId', ParseIntPipe) commentId: number,
  ) {
    this.logger.log(`${commentId}번 댓글 삭제:: 성공 시 응답코드 204`);
    const result = this.commentsService.deleteComment(userId, commentId);
    return result;
  }

  // 신고 내역 추가 (신고 누적 상황에 따라 해당 댓글 삭제)
  @Post('/report')
  @UseGuards(LocalAuthGuard)
  createCommentReport(
    @GetUser() reportUserId: string,
    @Body() createCommentReportDto: CreateCommentReportDto,
  ): Promise<{ status: string }> {
    this.logger.log(
      `${createCommentReportDto.commentId}번 댓글에 대한 신고 접수!`,
    );

    createCommentReportDto.reportUserId = reportUserId;

    const result = this.commentsService.createCommentReport(
      createCommentReportDto,
    );
    return result;
  }

  // 댓글 좋아요 기능 예정
  @Post('/:commentId/like')
  @UseGuards(LocalAuthGuard)
  updateCommentLike(
    @GetUser() userId: string,
    @Body() createCommentReportDto: CreateCommentReportDto,
  ): Promise<{ status: string }> {
    this.logger.log(
      `${createCommentReportDto.commentId}번 댓글에 대한 좋아요 접수!`,
    );

    const result = this.commentsService.createCommentReport(
      createCommentReportDto,
    );
    return result;
  }
}
