import { MiddlewareFn } from 'type-graphql';

import { Context } from './../common/context.interface';

export const CheckInvitationId: MiddlewareFn<Context> = async ({ args, context: { tokenData } }, next) => {

    if (args.invitationId !== tokenData.invitationId) {
        throw new Error('Cannot manipulate others invitations');
    }

    return next();
};
