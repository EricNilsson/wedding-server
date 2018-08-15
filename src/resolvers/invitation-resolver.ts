import { Resolver, ResolverInterface, Query, FieldResolver, Arg, Root, Mutation, Ctx, Int } from 'type-graphql';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

import { Invitation } from './../entities/invitation';
import { Invitee } from './../entities/invitee';

@Resolver(of => Invitation)
export class InvitationResolver implements ResolverInterface<Invitation> {
    public constructor(
        @InjectRepository(Invitation) private readonly invitationRepository: Repository<Invitation>,
        @InjectRepository(Invitee) private readonly inviteeRepository: Repository<Invitee>
    ) {}

    @Query(returns => Invitation)
    public invitation(@Arg('invitationId', type => Int) invitationId: number) {
        return this.invitationRepository.findOne(invitationId);
    }

    @Query(returns => [Invitation])
    public invitations(): Promise<Invitation[]> {
        return this.invitationRepository.find();
    }

    @FieldResolver()
    public invitees(@Root() invitation: Invitation) {
        return this.inviteeRepository.find({
            cache: 1000,
            where: { invitationId: invitation.id }
        });
    }
}

