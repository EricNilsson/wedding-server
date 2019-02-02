import { Entity, PrimaryColumn, Column, OneToMany, BeforeInsert, BaseEntity, ManyToMany, JoinTable } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import * as Code from './../common/generate-code';

import { v4 } from 'uuid';

import { Invitee } from './invitee';

export type Lazy<T extends object> = Promise<T> | T;

@ObjectType()
@Entity()
export class Invitation extends BaseEntity {

    @Field(type => String)
    @PrimaryColumn('uuid')
    public id: string;

    @Field()
    @Column()
    public code: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    public note?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    public title?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    public role?: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    public lastActive: string; // String to bypass: GraphQL error: value "1549112196334" is out of range for type integer

    @Field(type => [Invitee])
    @OneToMany(type => Invitee, invitee => invitee.invitation, { lazy: true, cascade: true })
    public invitees: Lazy<Invitee[]>;

    @BeforeInsert()
    public init() {
        this.id = v4();
        this.code = Code.generate(this.role === 'ADMIN' ? 12 : 4);
    }
}
