import { BaseModel } from './base.model';
import { Persisted, Properties } from '../decorators';
import { PersonAttribute } from './classes/person-attribute.model';
import { Good } from './good.model';
import { GenericBalance } from './classes';
import { Participant } from './participant.model';

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
  // under test
  @Properties({ transform: value => JSON.stringify(value) })
  attributes: Array<PersonAttribute>;

  @Persisted
  roles: Array<string>;

  @Persisted
  @Properties({
    map: [
      { debit: 'fundsDebit' },
      { credit: 'fundsCredit' },
      { balance: 'fundsBalance' },
    ],
  })
  fundsBalance: GenericBalance;

  @Persisted
  @Properties({
    map: [
      { debit: 'volunteeringHourDebit' },
      { credit: 'volunteeringHourCredit' },
      { balance: 'volunteeringHourBalance' },
    ],
  })
  volunteeringHoursBalance: GenericBalance;

  goodsStock: Array<Good>;

  // don't put in base, else we hav circular dependency problems
  @Persisted
  @Properties({ map: [{ id: 'participantId' }] })
  participant: Participant;

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
