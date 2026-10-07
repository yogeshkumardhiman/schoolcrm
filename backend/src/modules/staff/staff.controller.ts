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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { CreateStaffLeaveDto, UpdateStaffLeaveStatusDto } from './dto/staff-leave.dto';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { Permission } from '../../common/enums/permission.enum';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';

@Controller(['staff', 'admin/staff'])
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('me/profile')
  async getMyProfile(@CurrentUser() user?: JwtPayload) {
    return this.staffService.getMyProfile(user);
  }

  @Get('me/assignments')
  async getMyAssignments(@CurrentUser() user?: JwtPayload) {
    return this.staffService.getMyAssignments(user);
  }

  @Get('me/class-stats')
  async getMyClassStats(@CurrentUser() user?: JwtPayload) {
    return this.staffService.getMyClassStats(user);
  }

  @Get()
  @Public()
  async findAll() {
    return this.staffService.findAll();
  }

  @Get('minimal-list')
  @RequirePermissions(Permission.STAFF_READ)
  async getMinimalList(@Query('role') role?: string) {
    return this.staffService.getMinimalList(role);
  }

  @Get('list')
  @RequirePermissions(Permission.STAFF_READ)
  async getList(@Query('role') role?: string) {
    return this.staffService.getMinimalList(role);
  }

  @Get('leaves')
  @RequirePermissions(Permission.STAFF_READ)
  async getLeaveRequests(
    @Query('staffId') staffId?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const parsedId = staffId ? parseInt(staffId, 10) : undefined;
    return this.staffService.getLeaveRequests(parsedId, user);
  }

  @Get('leave')
  @RequirePermissions(Permission.STAFF_READ)
  async getLeaveRequestsAlias(
    @Query('staffId') staffId?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const parsedId = staffId ? parseInt(staffId, 10) : undefined;
    return this.staffService.getLeaveRequests(parsedId, user);
  }

  @Get('my-leaves')
  async getMyLeaves(
    @Query('staffId') staffId?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const parsedId = staffId ? parseInt(staffId, 10) : undefined;
    return this.staffService.getLeaveRequests(parsedId, user);
  }

  @Get('leave/my-requests')
  async getMyLeaveRequests(
    @Query('staffId') staffId?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    const parsedId = staffId ? parseInt(staffId, 10) : undefined;
    return this.staffService.getLeaveRequests(parsedId, user);
  }

  @Get('my-students')
  async getMyClassStudents(
    @CurrentUser() user?: JwtPayload,
    @Query('class') className?: string,
    @Query('section') section?: string,
  ) {
    return this.staffService.getMyClassStudents(user, className, section);
  }

  @Post()
  @RequirePermissions(Permission.STAFF_CREATE)
  async create(@Body() dto: CreateStaffDto) {
    return this.staffService.create(dto);
  }

  @Post('leave')
  async applyLeave(
    @Body() dto: CreateStaffLeaveDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.staffService.applyLeave(dto, user);
  }

  @Post('leave/apply')
  async applyLeaveAlias(
    @Body() dto: CreateStaffLeaveDto,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.staffService.applyLeave(dto, user);
  }

  @Put('leave/:id/status')
  @RequirePermissions(Permission.STAFF_UPDATE)
  async updateLeaveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffLeaveStatusDto,
  ) {
    return this.staffService.updateLeaveStatus(id, dto);
  }

  @Put('leave/:id')
  @RequirePermissions(Permission.STAFF_UPDATE)
  async updateLeaveStatusAlias(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffLeaveStatusDto,
  ) {
    return this.staffService.updateLeaveStatus(id, dto);
  }

  @Delete('leave/:id')
  async deleteLeave(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.deleteLeaveRequest(id);
  }

  // --- ATTENDANCE ROUTES ---

  @Get('my-attendance')
  async getMyAttendanceRecords(@CurrentUser() user?: JwtPayload) {
    return this.staffService.getMyPersonalTimetable(user);
  }

  @Post('self-attendance')
  async postSelfAttendance(
    @CurrentUser() user?: JwtPayload,
    @Body() body?: any,
  ) {
    return this.staffService.recordSelfAttendance(user, body);
  }

  // --- TIMETABLE ROUTES ---

  @Get('timetable/:id')
  async getTimetableById(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.getTimetable({ staffId: id });
  }

  @Get('timetable')
  async getTimetable(
    @Query('class') className?: string,
    @Query('section') section?: string,
    @Query('staffId') staffId?: string,
  ) {
    const parsedStaffId = staffId ? parseInt(staffId, 10) : undefined;
    return this.staffService.getTimetable({ className, section, staffId: parsedStaffId });
  }

  @Post('timetable')
  @RequirePermissions(Permission.TIMETABLE_MANAGE)
  async assignTimetablePeriod(@Body() dto: any) {
    return this.staffService.assignTimetablePeriod(dto);
  }

  @Delete('timetable/:id')
  @RequirePermissions(Permission.TIMETABLE_MANAGE)
  async deleteTimetablePeriod(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.deleteTimetablePeriod(id);
  }

  // --- SUBSTITUTIONS ---

  @Get('my-substitutions')
  async getMySubstitutions(
    @CurrentUser() user?: JwtPayload,
    @Query('date') date?: string,
  ) {
    const parsedUserId = user?.id ? parseInt(String(user.id), 10) : 0;
    const staff = await this.staffService.findOneByUserIdOrEmail(parsedUserId, user?.email);
    if (!staff) return [];
    return this.staffService.getMySubstitutions(staff.id);
  }

  @Get('me/timetable')
  async getMyPersonalTimetable(@CurrentUser() user?: JwtPayload) {
    const parsedUserId = user?.id ? parseInt(String(user.id), 10) : 0;
    const staff = await this.staffService.findOneByUserIdOrEmail(parsedUserId, user?.email);
    if (!staff) return [];
    return this.staffService.getTimetable({ staffId: staff.id });
  }

  @Get('substitutions')
  @RequirePermissions(Permission.STAFF_READ)
  async getSubstitutions(@Query('date') date?: string) {
    return this.staffService.getSubstitutions(date);
  }

  @Get('substitution/vacancies')
  @RequirePermissions(Permission.STAFF_READ)
  async getSubstitutionVacancies(@Query('date') date?: string) {
    return this.staffService.getSubstitutions(date);
  }

  @Post('substitutions')
  @RequirePermissions(Permission.STAFF_UPDATE)
  async assignSubstitution(
    @Body()
    dto: {
      absentTeacherId: number;
      substituteTeacherId: number;
      period: string;
      class: string;
      section: string;
      date: string;
    },
  ) {
    return this.staffService.assignSubstitution(dto);
  }

  @Post('substitution/assign')
  @RequirePermissions(Permission.STAFF_UPDATE)
  async assignSubstitutionAlias(
    @Body()
    dto: {
      absentTeacherId: number;
      substituteTeacherId: number;
      period: string;
      class: string;
      section: string;
      date: string;
    },
  ) {
    return this.staffService.assignSubstitution(dto);
  }

  @Put('profile/:id')
  async updateStaffProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: any,
  ) {
    return this.staffService.updateProfileByUserId(id, payload);
  }

  // Parameterized ID routes at bottom to avoid wildcard clashes
  @Get(':id')
  @Public()
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.findOne(id);
  }

  @Put(':id')
  @RequirePermissions(Permission.STAFF_UPDATE)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStaffDto,
  ) {
    return this.staffService.update(id, dto);
  }

  @Post(':id/reset-password')
  @RequirePermissions(Permission.STAFF_UPDATE)
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('password') password?: string,
  ) {
    return this.staffService.resetPasswordAndNotify(id, password);
  }

  @Delete(':id')
  @RequirePermissions(Permission.STAFF_DELETE)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.staffService.remove(id);
  }
}
