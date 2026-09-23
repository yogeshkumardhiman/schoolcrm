import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { FeesService } from './fees.service';
import { CreateFeeHeadDto } from './dto/create-fee-head.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { RecordFeePaymentDto } from './dto/record-fee-payment.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';

@Controller(['fees', 'payment', 'admin/fees'])
export class FeesController {
  constructor(private readonly feesService: FeesService) {}

  @Get('heads')
  @RequirePermissions(Permission.FEE_STRUCTURE_MANAGE)
  async findAllFeeHeads() {
    return this.feesService.findAllFeeHeads();
  }

  @Post('heads')
  @RequirePermissions(Permission.FEE_STRUCTURE_MANAGE)
  async createFeeHead(@Body() dto: CreateFeeHeadDto) {
    return this.feesService.createFeeHead(dto);
  }

  @Put('heads/:id')
  @RequirePermissions(Permission.FEE_STRUCTURE_MANAGE)
  async updateFeeHead(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateFeeHeadDto>,
  ) {
    return this.feesService.updateFeeHead(id, dto);
  }

  @Delete('heads/:id')
  @RequirePermissions(Permission.FEE_STRUCTURE_MANAGE)
  async deleteFeeHead(@Param('id', ParseIntPipe) id: number) {
    return this.feesService.deleteFeeHead(id);
  }

  @Get('structures')
  @RequirePermissions(Permission.FEE_STRUCTURE_MANAGE)
  async findAllFeeStructures() {
    return this.feesService.findAllFeeStructures();
  }

  @Get('structure/class/:className')
  @RequirePermissions(Permission.FEE_STRUCTURE_MANAGE)
  async findFeeStructureByClass(@Param('className') className: string) {
    return this.feesService.findFeeStructureByClass(className);
  }

  @Post('structures')
  @RequirePermissions(Permission.FEE_STRUCTURE_MANAGE)
  async createFeeStructure(@Body() dto: CreateFeeStructureDto) {
    return this.feesService.createFeeStructure(dto);
  }

  @Get('admission-slip/:studentId')
  @RequirePermissions(Permission.FEE_READ)
  async getAdmissionSlipData(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.feesService.getAdmissionSlipData(studentId);
  }

  @Get('dues/:studentId')
  @RequirePermissions(Permission.FEE_READ)
  async getStudentFeeDues(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.feesService.getStudentFeeDues(studentId);
  }

  @Get('payments/:studentId')
  @RequirePermissions(Permission.FEE_READ)
  async getStudentFeePayments(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.feesService.getStudentFeePayments(studentId);
  }

  @Get('summary')
  @RequirePermissions(Permission.FEE_READ)
  async getFeesSummary(
    @Query('class') className?: string,
    @Query('section') section?: string,
  ) {
    return this.feesService.getFeesSummary(className, section);
  }

  @Get('students')
  @RequirePermissions(Permission.FEE_READ)
  async getFeesStudents(
    @Query('class') className?: string,
    @Query('section') section?: string,
    @Query('search') search?: string,
  ) {
    return this.feesService.getFeesStudentsList({ className, section, search });
  }

  @Get('defaulters')
  @RequirePermissions(Permission.FEE_READ)
  async getFeesDefaulters(
    @Query('month') month?: string,
    @Query('class') className?: string,
  ) {
    return this.feesService.getFeesDefaulters(month, className);
  }

  @Post('pay')
  @RequirePermissions(Permission.FEE_COLLECT)
  async recordFeePayment(@Body() dto: RecordFeePaymentDto) {
    return this.feesService.recordFeePayment(dto);
  }

  @Post('payment')
  @RequirePermissions(Permission.FEE_COLLECT)
  async recordPaymentAlias(@Body() dto: RecordFeePaymentDto) {
    return this.feesService.recordFeePayment(dto);
  }

  @Post('create-order')
  async createOnlineOrder(
    @Body() dto: { studentId: number; amount: number; feeDueId?: number },
  ) {
    return this.feesService.createOnlineOrder(dto);
  }

  @Post('verify')
  async verifyOnlinePayment(
    @Body()
    dto: {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature?: string;
      studentId: number;
      amount: number;
      feeDueId?: number;
      month?: string;
    },
  ) {
    return this.feesService.verifyOnlinePayment(dto);
  }
}
