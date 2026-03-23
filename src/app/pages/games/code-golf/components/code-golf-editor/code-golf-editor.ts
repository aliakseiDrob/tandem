import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'tndm-code-golf-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: 'code-golf-editor.html',
  styleUrl: './code-golf-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TndmCodeGolfEditor {
  readonly value = model<string>('');
}
