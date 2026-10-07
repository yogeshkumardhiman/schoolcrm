import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller(['reports', 'admin'])
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @RequirePermissions(Permission.REPORT_VIEW)
  @Get('dashboard-summary')
  async getDashboardSummary(@Query('session') session?: string) {
    return this.reportsService.getDashboardSummary(session);
  }

  @RequirePermissions(Permission.REPORT_VIEW)
  @Get('compliance')
  async getComplianceDocs() {
    return this.reportsService.getComplianceDocs();
  }

  @RequirePermissions(Permission.REPORT_EXPORT)
  @Post('compliance')
  async createComplianceDoc(
    @Body('title') title: string,
    @Body('category') category: string,
    @Body('url') url: string,
  ) {
    return this.reportsService.createComplianceDoc(title, category, url || '/uploads/sample.pdf');
  }

  @RequirePermissions(Permission.REPORT_EXPORT)
  @Delete('compliance/:id')
  async deleteComplianceDoc(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.deleteComplianceDoc(id);
  }

  @RequirePermissions(Permission.REPORT_VIEW)
  @Get('logs')
  async getActivityLogs(@Query('limit') limit?: string) {
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    return this.reportsService.getActivityLogs(parsedLimit);
  }
}
