import { AuthChecker } from 'type-graphql';

import { Context } from './common/context.interface';

export const authChecker: AuthChecker<Context> = ({ context: { invitation }}, roles) => {
    // // If no roles, only check if invitation exists, i.e. if there is a valid token
    // if (roles.length === 0) {
    //     return invitation !== undefined;
    // }
    console.log('AuthChecker: invitation', invitation);
    return !!invitation;
}