import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';

class SampleDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;
}

describe('ValidationPipe exceptionFactory shape', () => {
  it('rejects invalid body with BadRequestException', async () => {
    const pipe = new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          error: 'VALIDATION',
          message: 'Request validation failed',
          details: errors.map((e) => ({
            field: e.property,
            constraints: Object.values(e.constraints ?? {}),
          })),
        }),
    });

    await expect(
      pipe.transform(
        { name: 'A', email: 'bad' },
        { type: 'body', metatype: SampleDto },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
