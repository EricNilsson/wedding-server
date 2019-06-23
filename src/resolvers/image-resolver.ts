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
                                    files = files.filter((path) => path !== '.DS_Store' && path !== '.thumbs');

                                    return files.map((file) => {
                                        const { height, width } = imageSize(file);
                                        return {
                                            height,
                                            width,
                                            file
                                        }
                                    });
                                });
    }
}
