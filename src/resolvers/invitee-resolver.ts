import { Resolver, ResolverInterface, Query, Authorized, FieldResolver, Arg, Root, Mutation, Ctx, Int } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { Invitation } from './../entities/invitation';
import { Invitee } from './../entities/invitee';

import { InviteeInput } from './types/invitee-input';

@Resolver(of => Invitation)
export class InviteeResolver implements ResolverInterface<Invitee> {
    public constructor(
        @InjectRepository(Invitation) private readonly invitationRepository: Repository<Invitation>,
        @InjectRepository(Invitee) private readonly inviteeRepository: Repository<Invitee>
    ) {}

    @Authorized()
    @Query(returns => Invitation)
    public invitee(@Arg('inviteeId') inviteeId: string) {
        return this.inviteeRepository.findOne(inviteeId, {
            relations: ['invitation']
        });
    }

    @Authorized()
    @Query(returns => [Invitee])
    public invitees(): Promise<Invitee[]> {
        return this.inviteeRepository.find({
            relations: ['invitation']
        });
    }

    @Authorized()
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

        invitation.invitees.push(newInvitee);
        newInvitee.invitation = invitation;

        await this.inviteeRepository.save(newInvitee);
        await this.invitationRepository.save(invitation);

        return newInvitee;
    }

    @Authorized()
    @Mutation(returns => Invitee, {
        description: 'This returnes the removed invitee. Throws error if invitee is not found.'
    })
    public async removeInvitee(
        @Arg('inviteeId', type => String) inviteeId: string
    ) {
        const invitee = await this.inviteeRepository.findOne(inviteeId);

        if (!invitee) {
            throw new Error(`No invitation found matching id: ${inviteeId}`);
        }

        return await this.inviteeRepository.remove(invitee);
    }

    @Authorized()
    @FieldResolver(returns => Invitation)
    public invitation(@Root() invitee: Invitee) {
        return this.invitationRepository.findOne(invitee.invitationId, {
            cache: 1000,
            relations: ['invitees']
        });
    }
}

