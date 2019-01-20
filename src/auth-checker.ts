import { AuthChecker } from 'type-graphql';

import { Roles } from './common/access-control';
import { Context } from './common/context.interface';

export const authChecker: AuthChecker<Context> = ({ root, args, context: { tokenData }, info }, roles) => {
    // // If no roles, only check if invitation exists, i.e. if there is a valid token
    // if (roles.length === 0) {
    //     return invitation !== undefined;
    // }

    // if (roles.length) {
    //     return roles.some(role => !!Roles[role]) && !!invitationId;
    // }


    // Lägg på ROLE i tokendatan och kolla den mor roles.
    // Använd detta för ADMIN stuffs


    console.log('authChecker tokenData', tokenData);
    return !!tokenData && !!tokenData.invitationId; // Logged in if there is a token present and it has a invitationId
}
