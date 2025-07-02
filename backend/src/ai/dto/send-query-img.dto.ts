import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class QueryImgDto {
  @ApiProperty({
    description: 'The URL of the image to describe. Must be a valid image URL (jpg, jpeg, png, gif, webp).',
    example: 'https://example.com/image.png',
    required: true,
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  url: string;
}