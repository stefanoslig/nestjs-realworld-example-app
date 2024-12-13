import {
  ArgumentMetadata,
  Injectable,
  PipeTransform,
  BadRequestException,
} from '@nestjs/common';
var Filter = require('bad-words');

@Injectable()
export class SwearWordsPipe implements PipeTransform {
  private filter: typeof Filter;

  constructor() {
    this.filter = new Filter();
  }

  transform(value: any, metadata: ArgumentMetadata) {
    if (typeof value === 'string') {
      if (this.filter.isProfane(value)) {
        throw new BadRequestException('Inappropriate language is not allowed.');
      }
      return this.filter.clean(value);
    }
    return value;
  }
}
