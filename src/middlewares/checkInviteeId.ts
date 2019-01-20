import { MiddlewareFn } from 'type-graphql';

import { Roles } from './../common/access-control';
import { Context } from './../common/context.interface';

import { Invitee } from './../entities/invitee';

export const CheckInviteeId: MiddlewareFn<Context> = async ({ args, context: { tokenData } }, next) => {

    if (args.inviteeId && tokenData.role !== Roles.ADMIN) {
        const invitee = await Invitee.findOne({where: {id: args.inviteeId}});

        if (invitee.invitationId !== tokenData.invitationId) {
            throw new Error('Cannot manipulate others invitation')
        }
    }

    return next();
};
