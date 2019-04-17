import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IrisProvider } from '../iris/iris';


/*
Template cache for mobile app templates. These allow apps to define the way their
context is displayed in mobile. Since there are only a limited number of apps, we
cache this data.
*/
@Injectable()
export class TemplateProvider {
  templates: Map<string, string>;

  constructor(private iris: IrisProvider) {
    this.templates = new Map();
  }

  getTemplate(app: string) {
    if (this.templates.has(app)){
      return Observable.create(observer => {
        observer.next(this.templates.get(app));
      })
    } else {
      return this.iris.getTemplate(app).map(data => {
        this.templates.set(app, data['mobile_template']);
        return data['mobile_template'];
      })
    }
  }

}
