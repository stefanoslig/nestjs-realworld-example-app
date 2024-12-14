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
    return this.clean(value);
  }

  private clean(value: any): any {
    if (typeof value === 'string') {
      if (this.filter.isProfane(value)) {
        throw new BadRequestException('Inappropriate language is not allowed.');
      }
      return this.filter.clean(value);
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.clean(item));
    }

    if (typeof value === 'object' && value !== null) {
      const cleanedObj = { ...value };
      for (const key in cleanedObj) {
        cleanedObj[key] = this.clean(cleanedObj[key]);
      }
      return cleanedObj;
    }

    return value; // Return other types (e.g., numbers, booleans) as-is
  }
}
