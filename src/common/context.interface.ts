import { Invitation } from './../entities/invitation';

export interface Context {
    tokenData?: {
        invitationId?: string;
    };
}