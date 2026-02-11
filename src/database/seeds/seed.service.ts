import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { UserRole } from '../../common/enums';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly usersService: UsersService) { }

  async onModuleInit() {
    await this.seedAdmin();
  }

  async seedAdmin() {
    const adminEmail = 'admin@citizenreport.com';
    const adminExists = await this.usersService.findOneByEmail(adminEmail);

    if (!adminExists) {
      console.log('Seeding default admin user...');
      await this.usersService.create({
        email: adminEmail,
        password: 'AdminPassword123!',
        first_name: 'Super',
        last_name: 'Admin',
        phone: '999999999',
        document_number: '00000000',
        role: UserRole.ADMIN,
      });
      console.log('Admin user created successfully.');
    } else {
      console.log('Admin user already exists.');
    }
  }
}
