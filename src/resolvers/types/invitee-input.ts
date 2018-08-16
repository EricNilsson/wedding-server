import { InputType, Field } from 'type-graphql';

import { Invitee } from './../../entities/invitee';

@InputType()
export class InviteeInput implements Partial<Invitee> {
    @Field({
        description: 'The Invitation that should get the new invitee'
    })
    invitationId: string;

    @Field()
    firstName: string;

    @Field()
    lastName: string;
}