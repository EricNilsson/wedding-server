import fs from 'fs';
import path from 'path';
const fsPromise = fs.promises;

import { Resolver, Query, Authorized } from 'type-graphql';
import { Image } from './../entities/image';

@Resolver()
export class ImageResolver {
    constructor() {}

    @Query(returns => [String])
    @Authorized()
    public async images() {
        return await fs.promises.readdir(path.resolve(__dirname, '../../static/images'))
                                              .then((files) => files.filter((path) => path !== '.DS_Store' &&
                                                                                      path !== '.thumbs'));
    }
}
