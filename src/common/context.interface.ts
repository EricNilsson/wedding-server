import { Invitation } from './../entities/invitation';
import { Request, Response } from 'express'

export interface Context {
    req?: Request;
    res?: Response;
    tokenData?: {
        invitationId?: string;
        roles?: string[];
    };
}
