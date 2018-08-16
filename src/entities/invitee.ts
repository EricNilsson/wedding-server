import { Entity, PrimaryColumn, Column, ManyToOne, BeforeInsert } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { v4 } from 'uuid';

import { Invitation } from './invitation';

@ObjectType()
@Entity()
export class Invitee {

    @Field(type => String)
    @PrimaryColumn('uuid')
    public id: string;

    @Field()
    @Column()
    public firstName: string;

    @Field()
    @Column()
    public lastName: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    public inviteStatus: boolean;

    @Field(type => Invitation)
    @ManyToOne(type => Invitation, invitation => invitation.invitees, {cascade: true})
    public invitation: Invitation;
    @Column()
    public invitationId: string;

    @BeforeInsert()
    public init() {
        this.id = v4();
    }
}
