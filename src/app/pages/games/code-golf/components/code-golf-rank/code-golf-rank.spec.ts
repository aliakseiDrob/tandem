import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TndmCodeGolfRank } from './code-golf-rank';
import { GolfRank } from '../../types/golf-rank';

describe('TndmCodeGolfRank', () => {
  let component: TndmCodeGolfRank;
  let fixture: ComponentFixture<TndmCodeGolfRank>;
  let componentRef: ComponentRef<TndmCodeGolfRank>;

  const mockRank: GolfRank = {
    label: 'Code Wizard',
    icon: '🧙‍♂️',
    color: '#ff0000',
    maxBytes: 100,
    width: 50,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TndmCodeGolfRank],
    }).compileComponents();

    fixture = TestBed.createComponent(TndmCodeGolfRank);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Установка обязательных input через ComponentRef для Signals
    componentRef.setInput('rank', mockRank);
    componentRef.setInput('previousBest', null);
    componentRef.setInput('byteCount', 0);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('diffInfo computation', () => {
    it('should return null if previousBest is null', () => {
      componentRef.setInput('previousBest', null);
      componentRef.setInput('byteCount', 50);
      fixture.detectChanges();

      expect(component.diffInfo()).toBeNull();
    });

    it('should return null if byteCount is 0', () => {
      componentRef.setInput('previousBest', 100);
      componentRef.setInput('byteCount', 0);
      fixture.detectChanges();

      expect(component.diffInfo()).toBeNull();
    });

    it('should calculate progress when current bytes are less than best', () => {
      componentRef.setInput('previousBest', 100);
      componentRef.setInput('byteCount', 80);
      fixture.detectChanges();

      const diff = component.diffInfo();
      expect(diff?.value).toBe(-20);
      expect(diff?.isProgress).toBe(true);
      expect(diff?.label).toBe('progress');
    });

    it('should calculate regress when current bytes are more than best', () => {
      componentRef.setInput('previousBest', 100);
      componentRef.setInput('byteCount', 120);
      fixture.detectChanges();

      const diff = component.diffInfo();
      expect(diff?.value).toBe(20);
      expect(diff?.isRegress).toBe(true);
      expect(diff?.label).toBe('regress');
    });
  });

  describe('Template rendering', () => {
    it('should show record badge only if previousBest is provided', () => {
      componentRef.setInput('previousBest', null);
      fixture.detectChanges();
      let badge = fixture.nativeElement.querySelector('.record-badge');
      expect(badge).toBeFalsy();

      componentRef.setInput('previousBest', 50);
      fixture.detectChanges();
      badge = fixture.nativeElement.querySelector('.record-badge');
      expect(badge).toBeTruthy();
      expect(badge.textContent).toContain('50 Bytes');
    });

    it('should apply correct color and icon from rank', () => {
      const rankInfo = fixture.nativeElement.querySelector('.rank-info');
      const rankTitle = fixture.nativeElement.querySelector('.rank');
      const icon = fixture.nativeElement.querySelector('.icon');

      expect(rankInfo.style.borderLeftColor).toBe('rgb(255, 0, 0)');
      expect(rankTitle.style.color).toBe('rgb(255, 0, 0)');
      expect(icon.textContent).toContain('🧙‍♂️');
      expect(rankTitle.textContent).toContain('Code Wizard');
    });

    it('should update progress bar width', () => {
      const progressFill = fixture.nativeElement.querySelector('.progress-fill');
      expect(progressFill.style.width).toBe('50%');
    });
  });
});
