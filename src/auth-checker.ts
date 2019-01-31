import { AuthChecker } from 'type-graphql';

import { Roles } from './common/access-control';
import { Context } from './common/context.interface';

import { Invitation } from './entities/invitation';

export const authChecker: AuthChecker<Context> = async ({ root, args, context: { tokenData }, info }, roles = []) => {
    if (roles.length === 0) {
        console.log('authChecker tokenData', tokenData);
        return !!tokenData && !!tokenData.invitationId; // Logged in if there is a token present and it has a invitationId
    }

    if (roles.length > 0) {
        if (tokenData && tokenData.invitationId && tokenData.role) {
            const invitation = await Invitation.findOne(tokenData.invitationId)
            console.log('ADMIN invitation', invitation);
            if (!invitation) {
                throw new Error('Autherntication error: Cannot find invitation');
            }
            return invitation.role === tokenData.role;
        } else {
            return false;
        }
    }
}
