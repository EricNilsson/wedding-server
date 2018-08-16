import { Resolver, ResolverInterface, Query, FieldResolver, Arg, Root, Mutation, Ctx, Int } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { Invitation } from './../entities/invitation';
import { Invitee } from './../entities/invitee';

import { InviteeInput } from './types/invitee-input';

@Resolver(of => Invitation)
export class InvitationResolver implements ResolverInterface<Invitation> {
    public constructor(
        @InjectRepository(Invitation) private readonly invitationRepository: Repository<Invitation>,
        @InjectRepository(Invitee) private readonly inviteeRepository: Repository<Invitee>
    ) {}

    @Query(returns => Invitation)
    public invitation(@Arg('invitationId') invitationId: string) {
        return this.invitationRepository.findOne(invitationId, {
            relations: ['invitees']
        });
    }

    @Query(returns => [Invitation])
    public invitations(): Promise<Invitation[]> {
        return this.invitationRepository.find({
            relations: ['invitees']
        });
    }

    @Mutation(returns => Invitation)
    public async createInvitation() {
        const invitation = await this.invitationRepository.create();
        return await this.invitationRepository.save(invitation);
    }

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

    @FieldResolver()
    public invitees(@Root() invitation: Invitation) {
        return this.inviteeRepository.find({
            cache: 1000,
            where: { invitationId: invitation.id },
            relations: ['invitation']
        });
    }
}

