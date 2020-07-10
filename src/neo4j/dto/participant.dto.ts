import { BaseEntityDto } from "./base-entity.dto";

export interface ParticipantDto extends BaseEntityDto {
  code: string;
  name: string;
  msp: string;
  createdDate: number;
  // fundsBalanceBalance: number;
  // fundsBalanceCredit: number;
  // fundsBalanceDebit: number;
  // volunteeringHoursBalance: number;
  // volunteeringHoursCredit: number;
  // volunteeringHoursDebit: number;
}
