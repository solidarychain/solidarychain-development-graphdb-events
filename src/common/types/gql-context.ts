import { Request, Response } from 'express';
import { GqlContextPayload } from './gql-context-payload';

export interface GqlContext {
  req: Request;
  res: Response;
  payload?: GqlContextPayload;
  // required for subscription: unknow type, used any
  connection: any;
}
