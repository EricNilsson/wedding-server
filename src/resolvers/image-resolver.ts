import fs from 'fs';
import path from 'path';
const fsPromise = fs.promises;

import imageSize from 'image-size';

import { Resolver, Query, Authorized } from 'type-graphql';
import { Image } from './../entities/image';

@Resolver()
export class ImageResolver {
    constructor() {}

    @Query(returns => [Image])
    @Authorized()
    public async images() {
        return await fs.promises.readdir(path.resolve(__dirname, '../../static/images'))
            .then((files) => {
                const images: Image[] = [];
                files = files.filter((path) => path !== '.DS_Store' && path !== '.thumbs');
                files.forEach((filename) => {
                    const { height, width } = imageSize(path.resolve(__dirname, '../../static/images/.thumbs', filename));
                    images.push({
                        thumbHeight: height,
                        thumbWidth: width,
                        filename
                    });
                });

                return images;
            }
        );
    }
}
