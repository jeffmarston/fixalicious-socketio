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

// export class FocusDirective {
//   @Input() focus: boolean;
//   private element: HTMLElement;
//   private hasFocused = false;

//   constructor($element: ElementRef) {
//     this.element = $element.nativeElement;
//   }

//   ngAfterContentChecked() {
//     this.giveFocus();
//   }

//   giveFocus() {
//     if (this.focus && !this.hasFocused) {
//       this.element.focus();
//       this.hasFocused = true;
//     }
//   }
// }