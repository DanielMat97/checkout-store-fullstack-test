import {
  INestApplication,
  ValidationPipe,
  type ValidationError,
  BadRequestException,
} from '@nestjs/common';

export function applyGlobalValidation(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException({
          error: 'VALIDATION',
          message: 'Request validation failed',
          details: flattenValidation(errors),
        }),
    }),
  );
}

function flattenValidation(
  errors: ValidationError[],
  parent = '',
): Array<{ field: string; constraints: string[] }> {
  const out: Array<{ field: string; constraints: string[] }> = [];
  for (const error of errors) {
    const field = parent ? `${parent}.${error.property}` : error.property;
    if (error.constraints) {
      out.push({
        field,
        constraints: Object.values(error.constraints),
      });
    }
    if (error.children?.length) {
      out.push(...flattenValidation(error.children, field));
    }
  }
  return out;
}
