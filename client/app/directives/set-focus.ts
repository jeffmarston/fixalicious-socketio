import { Directive, Input, AfterViewInit, ElementRef, Renderer } from '@angular/core';

@Directive({
  selector: '[setFocus]'
})
export class SetFocusDirective {
  @Input() setFocus: boolean;
  private element: HTMLElement;
  private hasFocused = false;

  constructor($element: ElementRef) {
    this.element = $element.nativeElement;
  }

  ngAfterContentChecked() {
    this.giveFocus();
  }

  giveFocus() {
    if (this.setFocus && !this.hasFocused) {
      this.element.focus();
      this.hasFocused = true;
    }
  }
}