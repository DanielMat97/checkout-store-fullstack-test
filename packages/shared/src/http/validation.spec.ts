import { BadRequestException, type INestApplication } from '@nestjs/common';
import { applyGlobalValidation } from './validation';

describe('applyGlobalValidation', () => {
  it('registers a ValidationPipe that maps errors to VALIDATION shape', () => {
    const pipes: unknown[] = [];
    const app = {
      useGlobalPipes: (...args: unknown[]) => {
        pipes.push(...args);
      },
    } as unknown as INestApplication;

    applyGlobalValidation(app);
    expect(pipes).toHaveLength(1);

    const pipe = pipes[0] as {
      exceptionFactory: (errors: unknown[]) => BadRequestException;
    };

    const flat = pipe.exceptionFactory([
      {
        property: 'email',
        constraints: { isEmail: 'email must be an email' },
        children: [],
      },
      {
        property: 'delivery',
        children: [
          {
            property: 'city',
            constraints: { isNotEmpty: 'city should not be empty' },
            children: [],
          },
        ],
      },
    ]);

    expect(flat).toBeInstanceOf(BadRequestException);
    const body = flat.getResponse() as {
      error: string;
      details: Array<{ field: string; constraints: string[] }>;
    };
    expect(body.error).toBe('VALIDATION');
    expect(body.details).toEqual(
      expect.arrayContaining([
        { field: 'email', constraints: ['email must be an email'] },
        { field: 'delivery.city', constraints: ['city should not be empty'] },
      ]),
    );
  });
});
