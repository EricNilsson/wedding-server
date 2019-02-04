import { Resolver, ResolverInterface, Query, Authorized, FieldResolver, UseMiddleware, Arg, Root, Mutation, Ctx, Int } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Roles } from './../common/access-control';
import { Context } from './../common/context.interface';

import discord from './../middlewares/discord';

import { CheckInvitationId } from './../middlewares/checkInvitationId';

import { Invitation } from './../entities/invitation';
import { Invitee } from './../entities/invitee';

import { InviteeInput } from './types/invitee-input';

@Resolver(of => Invitation)
export class InvitationResolver {
    public constructor(
        @InjectRepository(Invitation) private readonly invitationRepository: Repository<Invitation>,
        @InjectRepository(Invitee) private readonly inviteeRepository: Repository<Invitee>
    ) {}

    @Authorized()
    @UseMiddleware(CheckInvitationId)
    @Query(returns => Invitation)
    public async invitation(
        @Ctx() { tokenData }: Context,
        @Arg('invitationId', {nullable: true}) invitationId?: string
    ) {
        const invitation = await this.invitationRepository.findOne(invitationId || tokenData.invitationId, {
            relations: ['invitees']
        });

        if (!invitation) {
            throw new Error('Inbjudan saknas');
        }

        discord.info(invitation.title, 'Besöker sidan');

        invitation.lastActive = Date.now().toString();

        return await invitation.save();
    }

    @Authorized(Roles.ADMIN)
    @Query(returns => [Invitation])
    public invitations(): Promise<Invitation[]> {
        return this.invitationRepository.find({
            relations: ['invitees']
        });
    }

    @Authorized(Roles.ADMIN)
    @Mutation(returns => Invitation)
    public async createInvitation(
        @Ctx() context,
        @Arg('title') title: string,
        @Arg('role', { nullable: true }) role?: string
    ) {
        const invitation = await this.invitationRepository.create();
        invitation.title = title;

        if (role === Roles.ADMIN) {
            invitation.role = role;
        }

        return await this.invitationRepository.save(invitation);
    }

    @Authorized(Roles.ADMIN)
    @Mutation(returns => Boolean, {
        description: 'Returns the removed invitation. This removes the invitation and ALL the invitees in the invitation. Throws if no invitation matching id is found.'
    })
    public async removeInvitation(@Arg('invitationId', type => String) invitationId: string) {
        const invitation = await this.invitationRepository.findOne(invitationId, {
            relations: ['invitees']
        });

        if (!invitation) {
            throw new Error(`No invitation found matching id: ${invitationId}`);
        }

        if ((await invitation).invitees) {
            const invitees = await invitation.invitees
            await this.inviteeRepository.remove(invitees); // TODO: Cascade delete instead?
        }

        try {
            await this.invitationRepository.remove(invitation);
            return true;
        } catch {
            return false;
        }
    }

    @Authorized()
    @UseMiddleware(CheckInvitationId)
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

        discord.info(invitation.title, `Har lagt till meddelande:\n${note}`);

        invitation.note = note;

        return await this.invitationRepository.save(invitation);
    }

    @Authorized(Roles.ADMIN) // TODO: ONLY FOR ADMINS
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

        const invitees = await invitation.invitees;

        invitees.forEach((invitee) => invitee.inviteStatus = null);

        return await this.inviteeRepository.save(invitees);
    }

    // @Authorized()
    // @FieldResolver()
    // public invitees(@Root() invitation: Invitation) {
    //     return this.inviteeRepository.find({
    //         cache: 1000,
    //         where: { invitationId: invitation.id },
    //         relations: ['invitation']
    //     });
    // }
}

