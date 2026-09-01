import { Component, ElementRef, HostListener, signal, ViewChild } from '@angular/core';

@Component({
  selector: 'app-settings',
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class Settings {
  readonly isExpanded = signal(false);
  readonly isLanguageMenuOpen = signal(false);
  readonly theme = signal<'dark' | 'light'>('dark');
  readonly language = signal<'en' | 'pl'>('en');
  readonly units = signal<'metric' | 'imperial'>('metric');

  toggle(): void {
    this.isExpanded.update((expanded) => !expanded);
  }

  @ViewChild('languageSelect')
  private languageSelect?: ElementRef<HTMLElement>;

  selectLanguage(language: 'en' | 'pl'): void {
    this.language.set(language);
    this.isLanguageMenuOpen.set(false);
  }

  @HostListener('document:pointerdown', ['$event'])
  closeLanguageOnOutsideClick(event: PointerEvent): void {
    if (!this.isLanguageMenuOpen()) return;

    if (
      event.target instanceof Node &&
      !this.languageSelect?.nativeElement.contains(event.target)
    ) {
      this.isLanguageMenuOpen.set(false);
    }
  }
}
