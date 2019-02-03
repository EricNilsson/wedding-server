import { Resolver, ResolverInterface, Query, Authorized, FieldResolver, UseMiddleware, Arg, Root, Mutation, Ctx, Int } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Roles } from './../common/access-control';

import discord from './../middlewares/discord';
import { CheckInviteeId } from './../middlewares/checkInviteeId';

import { Invitation } from './../entities/invitation';
import { Invitee } from './../entities/invitee';

import { InviteeInput } from './types/invitee-input';

@Resolver(of => Invitation)
export class InviteeResolver {
    public constructor(
        @InjectRepository(Invitation) private readonly invitationRepository: Repository<Invitation>,
        @InjectRepository(Invitee) private readonly inviteeRepository: Repository<Invitee>
    ) {}

    @Authorized()
    @UseMiddleware(CheckInviteeId)
    @Query(returns => Invitee)
    public invitee(@Arg('inviteeId') inviteeId: string) {
        return this.inviteeRepository.findOne(inviteeId, {
            relations: ['invitation']
        });
    }

    @Authorized(Roles.ADMIN)
    @Query(returns => [Invitee])
    public invitees(): Promise<Invitee[]> {
        return this.inviteeRepository.find({
            relations: ['invitation']
        });
    }

    @Authorized(Roles.ADMIN)
    @Mutation(returns => Invitee)
    public async addInvitee(@Arg('invitee') {invitationId, ...invitee}: InviteeInput) {
        const invitation = await this.invitationRepository.findOne(invitationId, {relations: ['invitees']});

        if (!invitation) {
            throw new Error(`No invitation found matching id: ${invitationId}`);
            // console.log(`No invitation with id "${invitationId}" found. Creating a new one...`)
            // invitation = this.invitationRepository.create();
        }

        const newInvitee = this.inviteeRepository.create(invitee);

        if (!invitation.invitees) {
            invitation.invitees = [];
        }

        (await invitation.invitees).push(newInvitee);
        newInvitee.invitation = invitation;

        await this.inviteeRepository.save(newInvitee);
        await this.invitationRepository.save(invitation);

        return newInvitee;
    }

    @Authorized(Roles.ADMIN)
    @Mutation(returns => Boolean)
    public async removeInvitee(
        @Arg('inviteeId', type => String) inviteeId: string
    ) {
        const invitee = await this.inviteeRepository.findOne(inviteeId);

        if (!invitee) {
            throw new Error(`No invitation found matching ID: ${inviteeId}`);
        }

        try {
            await this.inviteeRepository.remove(invitee);
            return true;
        } catch {
            return false;
        }
    }

    @Authorized()
    @UseMiddleware(CheckInviteeId)
    @Mutation(returns => Invitee, { nullable: true })
    public async setInviteStatus(
        @Arg('inviteeId') inviteeId: string,
        @Arg('inviteStatus', { nullable: true }) inviteStatus?: boolean
    ) {
        const invitee = await this.inviteeRepository.findOne(inviteeId, { relations: ['invitation'] });

        if (!invitee) {
            throw new Error(`No invitee found with ID: ${ inviteeId }`)
        }

        discord.info(`${invitee.firstName} ${invitee.lastName}`, inviteStatus ? 'Kommer!' : 'Kommer inte');

        invitee.inviteStatus = inviteStatus;

        return await this.inviteeRepository.save(invitee);
    }

    // @Authorized()
    // @FieldResolver(returns => Invitation)
    // public invitation(@Root() invitee: Invitee) {
    //     return this.invitationRepository.findOne(invitee.invitationId, {
    //         cache: 1000,
    //         relations: ['invitees']
    //     });
    // }
}

