import { MiddlewareFn } from 'type-graphql';
import { Roles } from './../common/access-control';

import { Context } from './../common/context.interface';

export const CheckInvitationId: MiddlewareFn<Context> = async ({ args, context: { tokenData } }, next) => {

    if (args.invitationId && args.invitationId !== tokenData.invitationId && tokenData.role !== Roles.ADMIN) {
        throw new Error('Cannot manipulate others invitations');
    }

    return next();
};
