import { Resolver, ResolverInterface, Query, Authorized, FieldResolver, UseMiddleware, Arg, Root, Mutation, Ctx, Int } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { CheckInvitationId } from './../middlewares/checkInvitationId';

import { Invitation } from './../entities/invitation';
import { Invitee } from './../entities/invitee';

import { InviteeInput } from './types/invitee-input';

@Resolver(of => Invitation)
export class InvitationResolver implements ResolverInterface<Invitation> {
    public constructor(
        @InjectRepository(Invitation) private readonly invitationRepository: Repository<Invitation>,
        @InjectRepository(Invitee) private readonly inviteeRepository: Repository<Invitee>
    ) {}

    @Authorized()
    @Query(returns => Invitation)
    public invitation(@Arg('invitationId') invitationId?: string) {
        return this.invitationRepository.findOne(invitationId, {
            relations: ['invitees']
        });
    }

    @Authorized()
    @Query(returns => [Invitation])
    public invitations(): Promise<Invitation[]> {
        return this.invitationRepository.find({
            relations: ['invitees']
        });
    }

    @Authorized()
    @Mutation(returns => Invitation)
    public async createInvitation(
        @Ctx() context,
        @Arg('title') title: string
    ) {
        const invitation = await this.invitationRepository.create();
        invitation.title = title;
        return await this.invitationRepository.save(invitation);
    }

    @Authorized()
    @Mutation(returns => Invitation, {
        description: 'Returns the removed invitation. This removes the invitation and ALL the invitees in the invitation. Throws if no invitation matching id is found.'
    })
    public async removeInvitation(@Arg('invitationId', type => String) invitationId: string) {
        const invitation = await this.invitationRepository.findOne(invitationId, {
            relations: ['invitees']
        });

        if (!invitation) {
            throw new Error(`No invitation found matching id: ${invitationId}`);
        }

        if (invitation.invitees) {
            await this.inviteeRepository.remove(invitation.invitees); // TODO: Cascade delete instead?
        }

        return await this.invitationRepository.remove(invitation);
    }

    @Authorized()
    @Mutation(returns => Invitation)
    public async addNote(
        @Arg('invitationId') invitationId: string,
        @Arg('note') note: string
    ) {
        const invitation = await this.invitationRepository.findOne(invitationId, {
            relations: ['invitees']
        });

        if (!invitation) {
            throw new Error(`No invitation matching id: ${invitationId}`);
        }

        invitation.note = note;

        return await this.invitationRepository.save(invitation);
    }

    @Authorized() // TODO: ONLY FOR ADMINS
    @UseMiddleware(CheckInvitationId)
    @Mutation(returns => [Invitee])
    public async resetAllInvitationStatuses(
        @Arg('invitationId') invitationId: string
    ) {
        const invitation = await this.invitationRepository.findOne(invitationId, {
            relations: ['invitees']
        });

        if (!invitation) {
            throw new Error(`No invitation matching id: ${invitationId}`);
        }

        const { invitees } = invitation;

        invitees.forEach((invitee) => invitee.inviteStatus = null);

        return await this.inviteeRepository.save(invitees);
    }

    @Authorized()
    @FieldResolver()
    public invitees(@Root() invitation: Invitation) {
        return this.inviteeRepository.find({
            cache: 1000,
            where: { invitationId: invitation.id },
            relations: ['invitation']
        });
    }
}

