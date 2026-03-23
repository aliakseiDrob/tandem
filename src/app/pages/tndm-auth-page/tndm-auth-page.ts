import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tndm-auth-page',
  imports: [RouterOutlet],
  templateUrl: './tndm-auth-page.html',
  styleUrl: './tndm-auth-page.scss',
})
export class TndmAuthPage {}
