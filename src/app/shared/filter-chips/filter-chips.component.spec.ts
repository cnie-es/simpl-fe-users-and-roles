import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterChipsComponent } from './filter-chips.component';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { ComponentRef } from '@angular/core';
import { EuiChip } from '@eui/components/eui-chip/models/eui-chip.model';
import en from "../../../assets/i18n/en.json"
import { TranslateModule } from '@ngx-translate/core';

describe('FilterChipsComponent', () => {
  let component: FilterChipsComponent;
  let fixture: ComponentFixture<FilterChipsComponent>;
  let componentRef: ComponentRef<FilterChipsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        FilterChipsComponent,
        TranslocoTestingModule.forRoot(
          {
            translocoConfig: {
              availableLangs: ["en"],
              defaultLang: "en",
            },
            langs: { en: en }
          }
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterChipsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  describe('Component initialization', () => {
    beforeEach(() => {
      componentRef.setInput('chips', []);
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should have correct default input values', () => {
      expect(component.translocoPrefix()).toBe('');
      expect(component.chips()).toEqual([]);
    });
  });

  describe('Component inputs', () => {
    it('should accept custom transloco prefix', () => {
      componentRef.setInput('translocoPrefix', 'custom.prefix');
      componentRef.setInput('chips', []);
      fixture.detectChanges();

      expect(component.translocoPrefix()).toBe('custom.prefix');
    });

    it('should accept chips array', () => {
      const chips = [
        { field: 'name', value: 'Mario' },
        { field: 'email', value: 'mario@example.com' },
      ];
      componentRef.setInput('chips', chips);
      fixture.detectChanges();

      expect(component.chips()).toEqual(chips);
    });

    it('should handle empty chips array', () => {
      componentRef.setInput('chips', []);
      fixture.detectChanges();

      expect(component.chips()).toEqual([]);
      expect(component.chips().length).toBe(0);
    });
  });

  describe('onRemoveChip', () => {
    beforeEach(() => {
      componentRef.setInput('chips', []);
      fixture.detectChanges();
    });

    it('should emit removeChip event when called', () => {
      const removeChipSpy = jest.spyOn(component.removeChip, 'emit');
      const mockEvent = {
        id: 'test',
      } as EuiChip;

      component.onRemoveChip(mockEvent);

      expect(removeChipSpy).toHaveBeenCalledWith(mockEvent);
    });

    it('should handle events with different removed structures', () => {
      const removeChipSpy = jest.spyOn(component.removeChip, 'emit');
      const mockChip = { id: 'test' } as EuiChip;

      component.onRemoveChip(mockChip);

      expect(removeChipSpy).toHaveBeenCalledWith(mockChip);
    });

    it('should emit multiple removeChip events correctly', () => {
      const removeChipSpy = jest.spyOn(component.removeChip, 'emit');

      const event1 = {
        id: 'chip1',
      } as EuiChip;

      const event2 = {
        id: 'chip2',
      } as EuiChip;

      component.onRemoveChip(event1);
      component.onRemoveChip(event2);

      expect(removeChipSpy).toHaveBeenCalledTimes(2);
      expect(removeChipSpy).toHaveBeenNthCalledWith(1, event1);
      expect(removeChipSpy).toHaveBeenNthCalledWith(2, event2);
    });
  });

  describe('onResetFilters', () => {
    beforeEach(() => {
      componentRef.setInput('chips', []);
      fixture.detectChanges();
    });

    it('should emit resetFilters event when called', () => {
      const resetFiltersSpy = jest.spyOn(component.resetFilters, 'emit');

      component.onResetFilters();

      expect(resetFiltersSpy).toHaveBeenCalledWith();
    });

    it('should handle multiple calls to onResetFilters', () => {
      const resetFiltersSpy = jest.spyOn(component.resetFilters, 'emit');

      component.onResetFilters();
      component.onResetFilters();
      component.onResetFilters();

      expect(resetFiltersSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Template integration', () => {
    it('should render correctly when no chips are present', () => {
      componentRef.setInput('chips', []);
      fixture.detectChanges();

      const compiled = fixture.nativeElement as HTMLElement;
      expect(compiled).toBeTruthy();
    });

    it('should handle transloco prefix in template', () => {
      const customPrefix = 'administration.filters';
      componentRef.setInput('translocoPrefix', customPrefix);
      componentRef.setInput('chips', [{ field: 'status', value: 'active' }]);
      fixture.detectChanges();

      expect(component.translocoPrefix()).toBe(customPrefix);
    });

    it('should render chips when present', () => {
      const chips = [
        { field: 'name', value: 'Mario' },
        { field: 'status', value: 'active' },
      ];
      componentRef.setInput('chips', chips);
      fixture.detectChanges();

      expect(component.chips()).toEqual(chips);
      expect(component.chips().length).toBe(2);
    });
  });

  describe('Type validation', () => {
    it('should handle empty transloco prefix', () => {
      componentRef.setInput('translocoPrefix', '');
      componentRef.setInput('chips', []);
      fixture.detectChanges();

      expect(component.translocoPrefix()).toBe('');
    });

    it('should maintain correct chip structure', () => {
      const chips = [
        { field: 'email', value: 'test@example.com' },
        { field: 'role', value: 'admin' },
      ];
      componentRef.setInput('chips', chips);
      fixture.detectChanges();

      component.chips().forEach((chip) => {
        expect(chip).toHaveProperty('field');
        expect(chip).toHaveProperty('value');
        expect(typeof chip.field).toBe('string');
        expect(typeof chip.value).toBe('string');
      });
    });

    it('should handle complex chip values', () => {
      const chips = [
        { field: 'dateRange', value: '2023-01-01 to 2023-12-31' },
        { field: 'multipleValues', value: 'value1, value2, value3' },
      ];
      componentRef.setInput('chips', chips);
      fixture.detectChanges();

      expect(component.chips()).toEqual(chips);
      expect(component.chips()[0].value).toContain('to');
      expect(component.chips()[1].value).toContain(',');
    });
  });
});
