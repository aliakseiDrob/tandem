import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TndmCodeGolfEditor } from './code-golf-editor';
import { FormsModule } from '@angular/forms';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TndmCodeGolfEditor],
  template: `<tndm-code-golf-editor [(value)]="testValue" />`,
})
class TestHostComponent {
  readonly testValue = signal('initial');
}

describe('TndmCodeGolfEditor', () => {
  let component: TndmCodeGolfEditor;
  let fixture: ComponentFixture<TndmCodeGolfEditor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TndmCodeGolfEditor, FormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(TndmCodeGolfEditor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should update the textarea value when the model input changes', async () => {
    const newValue = 'const x = 10;';
    fixture.componentRef.setInput('value', newValue);
    fixture.detectChanges();

    await fixture.whenStable();

    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    expect(textarea.value).toBe(newValue);
  });

  it('should update the signal value when the user types in the textarea', async () => {
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    const typedText = 'console.log("hello");';

    textarea.value = typedText;
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    await fixture.whenStable();

    expect(component.value()).toBe(typedText);
  });

  describe('Integration with Host Component', () => {
    let hostFixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;

    beforeEach(() => {
      hostFixture = TestBed.createComponent(TestHostComponent);
      hostComponent = hostFixture.componentInstance;
      hostFixture.detectChanges();
    });

    it('should demonstrate two-way binding with signals', async () => {
      const editorTextarea: HTMLTextAreaElement = hostFixture.nativeElement.querySelector('textarea');

      hostComponent.testValue.set('changed from host');
      hostFixture.detectChanges();
      await hostFixture.whenStable();
      expect(editorTextarea.value).toBe('changed from host');

      editorTextarea.value = 'changed from editor';
      editorTextarea.dispatchEvent(new Event('input'));
      hostFixture.detectChanges();
      await hostFixture.whenStable();

      expect(hostComponent.testValue()).toBe('changed from editor');
    });
  });
});
