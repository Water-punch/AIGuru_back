import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './comments.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateCommentReportDto } from './dto/create-comment-report.dto';
import { LocalAuthGuard } from 'src/user/guards/local-service.guard';
import { GetUser } from 'src/common/decorator/get-user.decorator';
import { MyloggerService } from 'src/common/logger/mylogger.service';

@Controller('comments')
export class CommentsController {
  private logger = new MyloggerService(CommentsController.name);
  constructor(private commentsService: CommentsService) {}

  @Get('logger')
  getLogger(): string {
    this.logger.error('this is error');
    this.logger.warn('this is warn');
    this.logger.log('this is log');
    this.logger.verbose('this is verbose');
    this.logger.debug('this is debug');
    return 'success!';
  }

  // 자신이 작성한 댓글 목록 조회
  @Get('/my')
  @UseGuards(LocalAuthGuard)
  getMyComments(
    @GetUser() userId: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{ count: number; list: Comment[] }> {
    // query 값 없을 시 기본 값
    if (!limit) limit = 15;
    if (!page) page = 1;

    // this.logger.log('/my 요청 받아짐!');
    // if (!userId) {
    //   this.logger.log('토큰이 존재하지 않아 임시로 유저아이디 설정!');
    //   userId = '7bc1d0d8-3127-4781-9154-35fef0402e51';
    // }
    this.logger.log(`현재 설정된 userId: ${userId}`);
    const comments = this.commentsService.getMyComments(userId, page, limit);
    return comments;
  }

  // 게시글에 작성된 댓글 목록 조회
  @Get('/:boardId')
  async getBoardComments(
    @Param('boardId', ParseIntPipe) boardId: number,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ): Promise<{ count: number; list: Comment[] }> {
    // query 값 없을 시 기본 값
    if (!limit) limit = 15;
    if (!page) page = 1;

    this.logger.log(`${boardId}번 게시글의 댓글 조회!`);

    const comments = await this.commentsService.getBoardComments(
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
    return this.commentsService.getAllComments();
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
    // result : 작성 완료
    return result;
  }

  // 댓글 삭제 : 삭제하지 않고 상태만 변경 status: not_deleted -> deleted
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
    @GetUser() userId: string,
    @Body() createCommentReportDto: CreateCommentReportDto,
  ): Promise<{ status: string }> {
    this.logger.log(
      `${createCommentReportDto.commentId}번 댓글에 대한 신고 접수!`,
    );

    const result = this.commentsService.createCommentReport(
      createCommentReportDto,
      userId,
    );
    return result;
  }
}
