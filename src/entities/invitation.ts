import { Entity, PrimaryColumn, Column, OneToMany, BeforeInsert } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import * as Code from './../common/generate-code';

import { v4 } from 'uuid';

import { Invitee } from './invitee';

@ObjectType()
@Entity()
export class Invitation {

    @Field(type => String)
    @PrimaryColumn('uuid')
    public id: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    public code: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    public note?: string;

    @Field(type => [Invitee])
    @OneToMany(type => Invitee, invitee => invitee.invitation, { cascade: false })
    public invitees: Invitee[];

    @BeforeInsert()
    public init() {
        this.id = v4();
        this.code = Code.generate(); // TODO: Implement random generator for codes
    }

    // Address?

}
