import { AuthChecker } from 'type-graphql';

import discord from './middlewares/discord';

import { Roles } from './common/access-control';
import { Context } from './common/context.interface';

import { Invitation } from './entities/invitation';

export const authChecker: AuthChecker<Context> = async ({ root, args, context: { tokenData }, info }, roles = []) => {
    // If there are no role-enforcement for the query/mutation
    if (roles.length === 0) {
        if (!!tokenData && !!tokenData.invitationId) { // Logged in if there is a token present and it has a invitationId
            return true;
        } else {
            discord.info('Access Denied', `Fieldname: ${info.fieldName}`);
            return false;
        }
    }

    // If there is a role-enforcement for the query/mutation
    if (roles.length > 0) {
        if (tokenData && tokenData.invitationId && tokenData.role) {
            const invitation = await Invitation.findOne(tokenData.invitationId)

            if (!invitation) {
                throw new Error('Autherntication error: Cannot find invitation');
            }

            return invitation.role === tokenData.role; // Check if the role in the tokenb matches that in the invitation.
        } else {
            discord.info('Access Denied (admin)', `Admin fieldname: ${info.fieldName}`);
        }
    }

    return false;
}
