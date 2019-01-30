import { Entity, PrimaryColumn, Column, ManyToOne, BeforeInsert, BaseEntity } from 'typeorm';
import { ObjectType, Field, ID } from 'type-graphql';

import { v4 } from 'uuid';

import { Invitation } from './invitation';

export type Lazy<T extends object> = Promise<T> | T;

@ObjectType()
@Entity()
export class Invitee extends BaseEntity {

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
    @ManyToOne(type => Invitation, { lazy: true })
    public invitation: Lazy<Invitation>;

    @BeforeInsert()
    public init() {
        this.id = v4();
    }
}
