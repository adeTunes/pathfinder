import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { MentorshipRequestAction } from 'src/mentor/dto/accept-reject.dto';

export class AcceptRejectDto {
  @IsNotEmpty()
  @IsNumber()
  sessionId: number;

  @IsNotEmpty()
  @IsEnum(MentorshipRequestAction)
  action: MentorshipRequestAction;

  @IsOptional()
  @IsBoolean()
  approveUnavailableDay?: boolean;
}
