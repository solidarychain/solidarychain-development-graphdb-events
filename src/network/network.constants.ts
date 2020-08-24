import { Asset, Cause, Participant, Person } from "./models";

// providers
export const NETWORK_CONFIG = 'NETWORK_CONFIG';
export const NETWORK_CONNECTION = 'NETWORK_CONNECTION';
export const NODE_ID_GENESIS_BLOCK = '00000000-0000-0000-0000-000000000000';
// declared here to prevent circular dependencies in BaseModel, models that are connected to genesis
export const LINK_TO_GENESIS_MODELS = [Asset.name, Cause.name, Participant.name, Person.name];
