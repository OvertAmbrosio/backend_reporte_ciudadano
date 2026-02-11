import { Injectable, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { CategoriesService } from '../../categories/categories.service';
import { UserRole } from '../../common/enums';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly usersService: UsersService,
    private readonly categoriesService: CategoriesService
  ) { }

  async onModuleInit() {
    await this.seedAdmin();
    await this.seedCategories();
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

  async seedCategories() {
    const categories = [
      { name: 'Alumbrado Público', code: 'ALUMB', description: 'Problemas con postes, focos, cableado.' },
      { name: 'Pistas y Veredas', code: 'PISTAS', description: 'Baches, grietas, obras inconclusas.' },
      { name: 'Basura/Limpieza', code: 'BASURA', description: 'Acumulación de basura, calles sucias.' },
      { name: 'Seguridad', code: 'SEGUR', description: 'Robos, sospechosos, falta de vigilancia.' },
      { name: 'Parques y Jardines', code: 'PARQUES', description: 'Mantenimiento de áreas verdes, juegos.' },
    ];

    for (const cat of categories) {
      await this.categoriesService.create(cat);
    }
    console.log('Default categories seeded.');
  }
}
