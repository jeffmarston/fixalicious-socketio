import { Directive, Input, AfterViewInit, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[setFocus]'
})
export class SetFocusDirective implements AfterViewInit {

  constructor(public renderer: Renderer, public elementRef: ElementRef) {}

  @Input('setFocus') shouldSetFocus: boolean;

  ngAfterViewInit() {
    this.renderer.invokeElementMethod(
      this.elementRef.nativeElement, 'focus', []);
  }
  
  private setFocus(value: boolean) {
      alert(value);
  }

}