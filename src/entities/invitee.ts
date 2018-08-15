import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { Invitation } from './invitation';

@ObjectType()
@Entity()
export class Invitee {

    @Field(type => ID)
    @PrimaryGeneratedColumn()
    public readonly id: number;

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
    @ManyToOne(type => Invitation, invitation => invitation.invitees)
    public invitation: Invitation;
}
