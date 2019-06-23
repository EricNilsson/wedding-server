import { ObjectType, Field, ID } from 'type-graphql';

@ObjectType()
export class Image {

    @Field()
    public filename: string;

    @Field()
    public thumbWidth: number;

    @Field()
    public thumbHeight: number;
}
