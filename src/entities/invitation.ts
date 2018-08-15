import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { Invitee } from './invitee';

@ObjectType()
@Entity()
export class Invitation {

    @Field(type => ID)
    @PrimaryGeneratedColumn()
    public readonly id: number;

    @Field()
    @Column()
    public code: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    public notes?: string;

    @Field(type => [Invitee])
    @ManyToOne(type => Invitee, invitee => invitee.invitation)
    public invitees: Invitee[];

    // Address?

    // Before insert
    //     Create new random code

}
