// providers
export const NETWORK_CONFIG = 'NETWORK_CONFIG';
export const NETWORK_CONNECTION = 'NETWORK_CONNECTION';
export const NETWORK_MODEL_ASSET = 'Asset';
export const NETWORK_MODEL_CAUSE = 'Cause';
export const NETWORK_MODEL_GOOD = 'Good';
export const NETWORK_MODEL_PARTICIPANT = 'Participant';
export const NETWORK_MODEL_PERSON = 'Person';
export const NETWORK_MODEL_TRANSACTION = 'Transaction';

// comment from `base.model`: better to use strings here to prevent circular dependencies!
// declared here to prevent circular dependencies in BaseModel, models that are connected to genesis
// export const LINK_TO_GENESIS_MODELS = [Asset.name, Cause.name, Participant.name, Person.name];
// export const NODE_ID_GENESIS_BLOCK = '00000000-0000-0000-0000-000000000000';
