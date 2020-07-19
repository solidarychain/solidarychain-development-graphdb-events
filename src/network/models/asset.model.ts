import { Persisted, Properties } from "../decorators";
import { AssetType } from "../network.enums";
import { Entity } from "../network.types";
import { BaseModel } from "./base.model";
import { Participant } from "./participant.model";

export class Asset extends BaseModel {
  @Persisted
  @Properties({ returnField: true })
  name: string;

  @Persisted
  description: string;

  @Persisted
  assetType: AssetType;

  @Persisted
  ambassadors: string[];

  @Persisted
  location: string;

  @Persisted
  tags: string[];

  @Persisted
  @Properties({ map: [{ 'entity.id': 'inputEntityId' }, { 'entity.type': 'inputEntityType' }] })
  owner: Entity;

  // don't put in base, else we hav circular dependency problems
  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;
}
