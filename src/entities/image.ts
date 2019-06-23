import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class Image {

    @Field(type => String)
    public url: string;
}
