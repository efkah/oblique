import {APP_INITIALIZER, ModuleWithProviders, NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {CommonModule} from '@angular/common';
import {ObTelemetryService} from '../telemetry/telemetry.service';
import {requireAndRecordTelemetry} from '../telemetry/telemetry-require';
import {obliqueProviders} from '../utilities';
import {ObIconService} from './icon.service';
import {defaultIconConfig, ObTIconConfig, ObIconsConfig, iconFactory} from './icon.model';

export {ObIconService} from './icon.service';
export {ObIconsConfig, ObTIconConfig} from './icon.model';

@NgModule({
	imports: [MatIconModule, CommonModule],
	providers: [...obliqueProviders()]
})
export class ObIconModule {
	constructor(telemetry: ObTelemetryService) {
		requireAndRecordTelemetry(telemetry, ObIconModule);
	}

	static forRoot(config?: ObIconsConfig): ModuleWithProviders<ObIconModule> {
		return {
			ngModule: ObIconModule,
			providers: [
				{provide: ObTIconConfig, useValue: config || defaultIconConfig},
				{
					provide: APP_INITIALIZER,
					multi: true,
					useFactory: iconFactory,
					deps: [ObIconService]
				}
			]
		};
	}
}
