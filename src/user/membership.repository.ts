import { QueryRunner } from 'typeorm';
import { MemberShip } from './membership.entity';
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Product } from 'src/purchase/product.entity';

@Injectable()
export class MembershipRepository {
  async getMembershipbyuserId(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<MemberShip> {
    try {
      const found = await queryRunner.manager
        .createQueryBuilder()
        .select('membership')
        .from(MemberShip, 'membership')
        .where('membership.userId = :userId', { userId })
        .getOne();
      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async createMembership(
    userId: string,
    queryRunner: QueryRunner,
    membershipType: string,
  ): Promise<MemberShip> {
    try {
      const membershipvalues = new MemberShip();
      membershipvalues.userId = userId;
      //시작날짜 추가필요
      //membershipvalues.start_at

      switch (membershipType) {
        case 'basic':
          membershipvalues.usingService = 'basic';
          membershipvalues.remainChances = 50;
          break;
        case 'premium':
          membershipvalues.usingService = 'premium';
          membershipvalues.remainChances = 5000;
          break;
        default:
          membershipvalues.usingService = 'normal';
          membershipvalues.remainChances = 5;
          break;
      }
      console.log(membershipvalues);

      const newUserResults = await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(MemberShip)
        .values({
          ...membershipvalues,
        })
        .execute();

      const found = await queryRunner.manager
        .createQueryBuilder()
        .select('membership')
        .from(MemberShip, 'membership')
        .where('membership.user_id = :userId', { userId })
        .getOne();
      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async updateMembership(
    userId: string,
    queryRunner: QueryRunner,
    membershipType: string,
  ): Promise<MemberShip> {
    try {
      const membershipvalues = new MemberShip();
      membershipvalues.userId = userId;
      //시작날짜 추가필요
      //membershipvalues.start_at

      switch (membershipType) {
        case 'basic':
          membershipvalues.usingService = 'basic';
          membershipvalues.remainChances = 50;
          break;
        case 'premium':
          membershipvalues.usingService = 'premium';
          membershipvalues.remainChances = 5000;
          break;
        default:
          membershipvalues.usingService = 'normal';
          membershipvalues.remainChances = 5;
          break;
      }

      await queryRunner.manager
        .createQueryBuilder()
        .update(MemberShip)
        .set({ ...membershipvalues })
        .where('membership.user_id = :userId', { userId })
        .execute();

      const found = await queryRunner.manager
        .createQueryBuilder()
        .select('membership')
        .from(MemberShip, 'membership')
        .where('membership.user_id = :userId', { userId })
        .getOne();
      return found;
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }

  async useRemain(
    userId: string,
    queryRunner: QueryRunner,
  ): Promise<MemberShip> {
    try {
      const found = await this.getMembershipbyuserId(userId, queryRunner);

      // 멤버십 기간에 대한 검증도 추가필요함
      if (found.remainChances <= 0) {
        throw new UnauthorizedException('질문 횟수가 부족합니다.');
      }
      await queryRunner.manager
        .createQueryBuilder()
        .update(MemberShip)
        .set({ remainChances: found.remainChances - 1 })
        .where('membership.user_id = :userId', { userId })
        .execute();

      return await this.getMembershipbyuserId(userId, queryRunner);
    } catch (err) {
      throw new InternalServerErrorException('데이터베이스 처리 중 오류 발생');
    }
  }
}