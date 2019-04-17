import { Component, Input, OnInit } from '@angular/core';
import { IrisProvider, GraphData } from '../../providers/iris/iris';

/**
 * Dynamic graph block component. For use in app templates to allow
 * graph data to appear in the incident context page.
 * TODO: add example here.
 */

@Component({
  selector: 'graph-block',
  templateUrl: 'graph-block.html'
})
export class GraphBlockComponent implements OnInit{

  @Input()
  source: string;
  @Input()
  label: string;

  // URL for original graph
  original: string;
  // URL for current graph
  current: string;
  loading: boolean;
  graphType: string = 'original';

  constructor(private iris: IrisProvider) {
  }

  ngOnInit(){
    this.loading = true;
    this.iris.getGraph(this.source).subscribe(
      (data : GraphData) => {
        this.current = data.current;
        this.original = data.original;
        this.loading = false;
      }
    )
  }
}
