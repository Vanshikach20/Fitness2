import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'dark' | 'light';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'fittrack-theme';
  private themeSubject!: BehaviorSubject<Theme>;
  theme$!: ReturnType<BehaviorSubject<Theme>['asObservable']>;

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
    const initial: Theme = saved || 'dark';
    this.themeSubject = new BehaviorSubject<Theme>(initial);
    this.theme$ = this.themeSubject.asObservable();
    this.applyTheme(initial);
  }

  get currentTheme(): Theme {
    return this.themeSubject.value;
  }

  get isDark(): boolean {
    return this.currentTheme === 'dark';
  }

  toggleTheme(): void {
    const next: Theme = this.isDark ? 'light' : 'dark';
    this.themeSubject.next(next);
    localStorage.setItem(this.STORAGE_KEY, next);
    this.applyTheme(next);
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
  }
}
