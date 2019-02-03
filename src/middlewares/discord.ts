
// import { UseMiddleware } from 'type-graphql';

interface Hook {
    info: (webhookName: string, message: string) => void;
    warn: (webhookName: string, message: string) => void;
    err: (webhookName: string, message: string) => void;
    success: (webhookName: string, message: string) => void;
}

import * as webhook from 'webhook-discord';

const discord = new (webhook as any).Webhook(process.env.DISCORD_URL);

export default discord as Hook;


// export function Discord() {
//   return UseMiddleware(async ({ args }, next) => {
//     // here place your validation logic, e.g. based on schema using joi
//     hook.info('NAME', 'MESSAGE');
//     return next();
//   });
// }
