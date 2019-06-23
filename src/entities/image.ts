import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class Image {

    @Field()
    public filename: string;

    @Field()
    public width: number;

    @Field()
    public height: number;
}
