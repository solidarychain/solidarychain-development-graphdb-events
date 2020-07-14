import { BaseModel } from "./base.model";
import { Persisted, Properties } from "../decorators";
import { PersonAttribute } from "./person-attribute.model";
import { Participant } from "./participant.model";
import { Goods } from "./goods.model";
import { GenericBalance } from "./classes";

export class Person extends BaseModel {
  @Persisted
  @Properties({ returnField: true })
  username: string;

  @Persisted
  password: string;

  @Persisted
  @Properties({ returnField: true })
  email: string;

  @Persisted
  attributes: Array<PersonAttribute>;

  @Persisted
  roles: Array<String>;

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
  @Properties({ map: [{ debit: 'fundsBalanceDebit' }, { credit: 'fundsBalanceCredit' }, { balance: 'fundsBalanceBalance' }] })
  fundsBalance: GenericBalance;

  @Persisted
  @Properties({ map: [{ debit: 'volunteeringHourDebit' }, { credit: 'volunteeringHourCredit' }, { balance: 'volunteeringHourBalance' }] })
  volunteeringHoursBalance: GenericBalance;

  // TODO
  // @Persisted
  goodsStock: Array<Goods>;

  loggedPersonId?: string;

  @Persisted
  registrationDate: number;

  @Persisted
  mobilePhone: string;

  @Persisted
  postal: string;

  @Persisted
  city: string;

  @Persisted
  region: string;

  @Persisted
  geoLocation: string;

  @Persisted
  timezone: string;

  @Persisted
  personalInfo: string;

  profile: any;

  // citizenCard data

  @Persisted
  firstname: string;

  @Persisted
  lastname: string;

  @Persisted
  gender: string;

  @Persisted
  height: number;

  @Persisted
  fatherFirstname: string;

  @Persisted
  fatherLastname: string;

  @Persisted
  motherFirstname: string;

  @Persisted
  motherLastname: string;

  @Persisted
  birthDate: number;

  @Persisted
  nationality: string;

  @Persisted
  country: string;

  @Persisted
  documentNumber: string;

  @Persisted
  documentType: string;

  @Persisted
  cardVersion: string;

  @Persisted
  emissionDate: number;

  @Persisted
  expirationDate: number;

  @Persisted
  emittingEntity: string;

  @Persisted
  identityNumber: string;

  @Persisted
  fiscalNumber: string;

  @Persisted
  socialSecurityNumber: string;

  @Persisted
  beneficiaryNumber: string;

  @Persisted
  pan: string;

  @Persisted
  requestLocation: string;

  @Persisted
  otherInformation: string;
}
