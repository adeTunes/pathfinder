import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';

export enum MentorshipRequestAction {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
}

export class AcceptRejectDto {
  @IsNotEmpty()
  @IsNumber()
  requestId: number;

  @IsNotEmpty()
  @IsEnum(MentorshipRequestAction)
  action: MentorshipRequestAction;
}
export class CancelRequestDto {
  @IsNumber()
  @IsNotEmpty()
  requestId: number;
}
