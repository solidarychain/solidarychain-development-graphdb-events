/**
 * ChaincodeEvent enum must be insync with
 * solidarychain-development-graphdb-events/src/network/network.enums.ts
 * solidarychain-development-monorepo/packages/common-cc/src/enums.ts
 */

export enum TransactionType {
  TransferFunds = 'TRANSFER_FUNDS',
  TransferVolunteeringHours = 'TRANSFER_VOLUNTEERING_HOURS',
  TransferGoods = 'TRANSFER_GOODS',
  TransferAsset = 'TRANSFER_ASSET',
}

export enum ResourceType {
  Funds = 'FUNDS',
  VolunteeringHours = 'VOLUNTEERING_HOURS',
  GenericGoods = 'GENERIC_GOODS',
  PhysicalAsset = 'PHYSICAL_ASSET',
  DigitalAsset = 'DIGITAL_ASSET',
}

export enum EntityType {
  Participant = 'com.chain.solidary.model.participant',
  Person = 'com.chain.solidary.model.person',
  Cause = 'com.chain.solidary.model.cause',
}

export enum AssetType {
  PhysicalAsset = 'PHYSICAL_ASSET',
  DigitalAsset = 'DIGITAL_ASSET',
}

export enum ModelTypeKey {
  Participant = 'Participant',
  Person = 'Person',
  Cause = 'Cause',
  Asset = 'Asset',
  Transaction = 'Transaction',
  Goods = 'Goods',
}

export enum ModelType {
  Participant = 'com.chain.solidary.model.participant',
  Person = 'com.chain.solidary.model.person',
  Cause = 'com.chain.solidary.model.cause',
  Asset = 'com.chain.solidary.model.asset',
  Transaction = 'com.chain.solidary.model.transaction',
  Goods = 'com.chain.solidary.model.goods',
}

export enum GraphLabelRelationship {
  CREATE = 'CREATE',
  TO_ENTITY = 'TO_ENTITY',
  TRANSFERED_GOOD = 'TRANSFERED_GOOD',
  TRANSFERED_ASSET = 'TRANSFERED_ASSET',
  OWNS_ASSET = 'OWNS_ASSET',
  TRANSFER_ASSET = 'TRANSFER_ASSET',
  // OWNERSHIP_TO = 'OWNERSHIP_TO',
  // BORROWED_TO = 'BORROWED_TO',
}

export enum ChaincodeEvent {
  // Asset
  AssetCreatedEvent = 'AssetCreatedEvent',
  // TODO
  AssetUpdatedEvent = 'AssetUpdatedEvent',
  // Cause
  CauseCreatedEvent = 'CauseCreatedEvent',
  // TODO
  CauseUpdatedEvent = 'CauseUpdatedEvent',
  // Participant
  ParticipantCreatedEvent = 'ParticipantCreatedEvent',
  // TODO
  ParticipantUpdatedEvent = 'ParticipantUpdatedEvent',
  // NOT USED: here only for not used reference, this is a admin function used to change participants fingerprint identity
  // ParticipantChangeIdentityEvent = 'ParticipantChangeIdentityEvent',
  // Person
  PersonCreatedEvent = 'PersonCreatedEvent',
  // TODO
  PersonUpdatedEvent = 'PersonUpdatedEvent',
  // NOT USED: here only for not used reference
  PersonUpdatePasswordEvent = 'PersonUpdatePasswordEvent',
  // TODO
  PersonUpdateProfileEvent = 'PersonUpdateProfileEvent',
  // NOT USED: here only for not used reference
  // PersonUpdateRolesEvent = 'PersonUpdateRolesEvent',
  // TODO
  PersonUpsertCitizenCardEvent = 'PersonUpsertCitizenCardEvent',
  // TODO
  PersonAddAttributeEvent = 'PersonAddAttributeEvent',
  // Transaction
  TransactionCreatedEvent = 'TransactionCreatedEvent',
  // TODO
  TransactionUpdatedEvent = 'TransactionUpdatedEvent',
  // TODO: this is need for what?
  TransactionAssetChangeOwnerEvent = 'TransactionAssetChangeOwnerEvent',
}
