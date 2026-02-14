import { Controller, Get, Post, Body, Patch, Param, Delete, Request, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('profile')
  async getProfile(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.id);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
    };
  }

  @Post('change-password')
  async changePassword(@Request() req: any, @Body() body: any) {
    return this.usersService.updatePassword(req.user.id, body.password);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req: any) {
    if (req.user.id !== +id && req.user.role !== 'ADMIN') {
      throw new ForbiddenException('No tienes permiso para actualizar este usuario');
    }
    return this.usersService.update(+id, body);
  }
}
