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

export enum ChaincodeEvent {
  // Asset
  AssetCreatedEvent = "AssetCreatedEvent",
  AssetUpdatedEvent = "AssetUpdatedEvent",
  CauseCreatedEvent = "CauseCreatedEvent",
  CauseUpdatedEvent = "CauseUpdatedEvent",
  // Participant
  ParticipantCreatedEvent = "ParticipantCreatedEvent",
  ParticipantUpdatedEvent = "ParticipantUpdatedEvent",
  ParticipantChangeIdentityEvent = 'ParticipantChangeIdentityEvent',
  // Person
  PersonCreatedEvent = "PersonCreatedEvent",
  PersonUpdatedEvent = "PersonUpdatedEvent",
  PersonUpdatePasswordEvent = 'PersonUpdatePasswordEvent',
  PersonUpdateProfileEvent = 'PersonUpdateProfileEvent',
  PersonUpdateRolesEvent = 'PersonUpdateRolesEvent',
  PersonUpsertCitizenCardEvent = 'PersonUpsertCitizenCardEvent',
  PersonAddAttributeEvent = 'PersonAddAttributeEvent',
  // Transaction
  TransactionCreatedEvent = "TransactionCreatedEvent",
  TransactionUpdatedEvent = "TransactionUpdatedEvent",
  TransactionAssetChangeOwnerEvent = 'TransactionAssetChangeOwnerEvent',
}
