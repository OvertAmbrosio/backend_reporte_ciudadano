import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { UsersModule } from '../../users/users.module';
import { CategoriesModule } from '../../categories/categories.module';

@Module({
  imports: [UsersModule, CategoriesModule],
  providers: [SeedService],
})
export class SeedModule { }
