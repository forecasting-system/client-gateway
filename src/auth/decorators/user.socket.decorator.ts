import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client = ctx.switchToWs().getClient();

    if (!client.data.user) {
      throw new InternalServerErrorException(
        'User not found in client (AuthGuard called?)',
      );
    }

    return client.data.user;
  },
);
