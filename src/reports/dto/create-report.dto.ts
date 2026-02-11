import { IsString, IsNumber, IsNotEmpty, IsOptional, MaxLength, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

@ValidatorConstraint({ name: 'isBase64Image', async: false })
export class IsBase64ImageConstraint implements ValidatorConstraintInterface {
  validate(text: string, args: ValidationArguments) {
    // Basic regex for Base64 image
    if (!/^data:image\/(jpeg|png|jpg);base64,/.test(text)) return false;

    const base64Content = text.split(',')[1];
    if (!base64Content) return false;

    // Size check (~2MB max)
    const sizeInBytes = 4 * Math.ceil((base64Content.length / 3)) * 0.5624896334383812;
    return sizeInBytes <= 2 * 1024 * 1024;
  }

  defaultMessage(args: ValidationArguments) {
    return 'La imagen debe ser Base64 válido (JPG/PNG) y no exceder 2MB';
  }
}

export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  reference: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description: string;

  @IsString()
  @IsNotEmpty()
  @Validate(IsBase64ImageConstraint)
  imageBase64: string;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  categoryId: number;
}
