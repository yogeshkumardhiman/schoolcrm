import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { SalaryService } from './salary.service';
import { CreateSalaryStructureDto } from './dto/create-salary-structure.dto';
import { ProcessSalaryPaymentDto } from './dto/process-salary-payment.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';

@Controller('salary')
export class SalaryController {
  constructor(private readonly salaryService: SalaryService) {}

  @Get('structures')
  @RequirePermissions(Permission.SALARY_READ)
  async findAllStructures() {
    return this.salaryService.findAllStructures();
  }

  @Get('structure/:staffId')
  @RequirePermissions(Permission.SALARY_READ)
  async findStaffStructure(@Param('staffId', ParseIntPipe) staffId: number) {
    return this.salaryService.findStaffStructure(staffId);
  }

  @Post('structure')
  @RequirePermissions(Permission.SALARY_STRUCTURE_MANAGE)
  async saveSalaryStructure(@Body() dto: CreateSalaryStructureDto) {
    return this.salaryService.saveSalaryStructure(dto);
  }

  @Get('payments/:staffId')
  @RequirePermissions(Permission.SALARY_READ)
  async getStaffPayments(@Param('staffId', ParseIntPipe) staffId: number) {
    return this.salaryService.getStaffPayments(staffId);
  }

  @Get('slip/:paymentId')
  @RequirePermissions(Permission.SALARY_READ)
  async getPaymentSlip(@Param('paymentId', ParseIntPipe) paymentId: number) {
    return this.salaryService.getPaymentById(paymentId);
  }

  @Post('pay')
  @RequirePermissions(Permission.SALARY_PAY)
  async processSalaryPayment(@Body() dto: ProcessSalaryPaymentDto) {
    return this.salaryService.processSalaryPayment(dto);
  }
}
