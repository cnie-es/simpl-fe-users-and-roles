import { TranslocoTestingModule } from '@jsverse/transloco';
import { render } from '@testing-library/angular';
import { screen } from '@testing-library/dom';
import { UnauthorizedPageComponent } from "./unauthorized-page.component";
import en from "../../../../assets/i18n/en.json"

beforeEach(() => {
  jest.resetAllMocks();
});

describe('UnauthorizedPageComponent', () => {
  it('should create', async () => {
    await render(UnauthorizedPageComponent, {
      imports: [
        TranslocoTestingModule.forRoot(
          {
            translocoConfig: {
              availableLangs: ["en"],
              defaultLang: "en",
            },
            langs: { en: en }
          }
        ),
      ]
    });
  });
});
