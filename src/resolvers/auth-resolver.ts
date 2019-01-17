import * as jwt from 'jsonwebtoken';

import { Resolver, Mutation, Query, Authorized, Arg, Ctx } from 'type-graphql';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Repository } from 'typeorm';

import { CodeNotFoundError } from './errors/CodeNotFoundError';

import { Context } from './../common/context.interface';
import { Invitation } from './../entities/invitation';

@Resolver()
export class AuthResolver {
    constructor(@InjectRepository(Invitation) private invitationRepository: Repository<Invitation>) {}

    @Mutation(returns => String)
    public async authenticate(@Arg('invitationCode') invitationCode: string) {
        const invitation = await this.invitationRepository.findOne({
            where: {
                code: invitationCode
            }
        });

        if (invitation) {
            return jwt.sign(
                { invitationId: invitation.id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );
        } else {
            throw new CodeNotFoundError();
        }

        return;
    }

    @Authorized()
    @Query(returns => Invitation)
    public async me(@Ctx() { tokenData }: Context) {
        console.log('me');
        console.log('tokenData', tokenData.invitationId);
        // TODO: Not needed? this is probably handled by express-jwt or type-graphql.@Authorized
        if (!tokenData || (tokenData && !tokenData.invitationId)) {
            throw new Error('Not Authenticated');
        }


        const invitation = await this.invitationRepository.findOne(tokenData.invitationId, { relations: ['invitees'] });

        if (!invitation) {
            throw new Error('Invitation not found'); // TODO: return invalidTokenError which should trigger ui to logout
        }

        return invitation;
    }
}
