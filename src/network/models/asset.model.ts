import { Persisted, Properties } from "../decorators";
import { Entity } from "../network.types";
import { BaseModel } from "./base.model";
import { Participant } from "./participant.model";
import { AssetType } from "../network.enums";

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

  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;

  identities: Array<any>;

  @Persisted
  metaData: any;

  @Persisted
  metaDataInternal: any;

  @Persisted
  createdDate: number;

  @Persisted
  createdByPersonId?: string;

  loggedPersonId?: string;
}
