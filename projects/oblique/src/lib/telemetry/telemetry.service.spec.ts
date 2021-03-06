import {TestBed} from '@angular/core/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {HttpClient} from '@angular/common/http';
import {EMPTY} from 'rxjs';
import {WINDOW, windowProvider} from '../utilities';
import {ObThemeService} from '../theme/theme.service';
import {ObTelemetryService, TELEMETRY_DISABLE} from './telemetry.service';

describe('TelemetryService', () => {
	let service: ObTelemetryService;
	let http: HttpClient;
	jest.spyOn(console, 'info');

	describe('when disabled', () => {
		beforeEach(() => {
			TestBed.configureTestingModule({
				imports: [HttpClientTestingModule],
				providers: [
					{provide: WINDOW, useFactory: windowProvider},
					{provide: TELEMETRY_DISABLE, useValue: true},
					{provide: ObThemeService, useValue: {isMaterial: jest.fn()}}
				]
			});

			service = TestBed.inject(ObTelemetryService);
		});

		it('should be created', () => {
			expect(service).toBeTruthy();
		});

		it('should show info in the console', () => {
			expect(console.info).toHaveBeenCalledWith('Oblique Telemetry is disabled by injection token.');
		});

		it('should not have a telemetryRecord property', () => {
			// @ts-ignore
			expect(service.telemetryRecord).toBeUndefined();
		});

		describe('record', () => {
			it('should be ignored', () => {
				service.record('test');
				// @ts-ignore
				expect(service.telemetryRecord).toBeUndefined();
			});
		});
	});

	describe('when enabled with Material', () => {
		beforeEach(() => {
			TestBed.configureTestingModule({
				imports: [HttpClientTestingModule],
				providers: [
					{provide: WINDOW, useFactory: windowProvider},
					{provide: ObThemeService, useValue: {isMaterial: jest.fn().mockReturnValue(true)}}
				]
			});

			service = TestBed.inject(ObTelemetryService);
			http = TestBed.inject(HttpClient);
		});

		it('should be created', () => {
			expect(service).toBeTruthy();
		});

		it('should not show info in the console', () => {
			expect(console.info).not.toHaveBeenCalled();
		});

		describe('telemetryRecord', () => {
			it('should be defined', () => {
				// @ts-ignore
				expect(service.telemetryRecord).toBeDefined();
			});
			it('should have Material theme', () => {
				// @ts-ignore
				expect(service.telemetryRecord.record.obliqueTheme).toBe('Material');
			});
		});

		describe('record', () => {
			it('should add module', () => {
				// @ts-ignore
				jest.spyOn(service.telemetryRecord, 'addModule');
				service.record('test');
				// @ts-ignore
				expect(service.telemetryRecord.addModule).toHaveBeenCalledWith('test');
			});

			it('should add a module only once', () => {
				service.record('test');
				service.record('test');
				// @ts-ignore
				expect(service.telemetryRecord.record.obliqueModuleNames.length).toBe(1);
			});
		});

		describe('sendRecord', () => {
			describe('with obsolete records', () => {
				beforeEach(() => {
					// @ts-ignore
					jest.spyOn(service.telemetryRecord, 'isRecordToBeSent').mockReturnValue(true);
				});

				it('should send data to the backend', () => {
					spyOn(http, 'post').and.returnValue(EMPTY);
					// @ts-ignore
					service.sendRecord();
					expect(http.post).toHaveBeenCalled();
				});

				it('should store the record', () => {
					// @ts-ignore
					jest.spyOn(service.telemetryRecord, 'storeRecord');
					// @ts-ignore
					service.sendRecord();
					// @ts-ignore
					expect(service.telemetryRecord.storeRecord).toHaveBeenCalled();
				});

				it('should send recorded modules along with project data', () => {
					// @ts-ignore
					jest.spyOn(service, 'sendData');
					service.record('test1');
					service.record('test1');
					service.record('test2');
					// @ts-ignore
					service.sendRecord();
					// @ts-ignore
					expect(service.sendData).toHaveBeenCalledWith({
						applicationHomepage: undefined,
						applicationName: 'Unknown project name',
						applicationTitle: undefined,
						applicationVersion: 'Unknown project version',
						obliqueModuleNames: ['test1', 'test2'],
						obliqueTheme: 'Material',
						obliqueVersion: ''
					});
				});
			});
		});

		describe('with unchanged data', () => {
			beforeEach(() => {
				// @ts-ignore
				jest.spyOn(service.telemetryRecord, 'isRecordToBeSent').mockReturnValue(false);
			});

			it('should not send data to the backend', () => {
				spyOn(http, 'post').and.returnValue(EMPTY);
				// @ts-ignore
				service.sendRecord();
				expect(http.post).not.toHaveBeenCalled();
			});

			it('should not store the record', () => {
				// @ts-ignore
				jest.spyOn(service.telemetryRecord, 'storeRecord');
				// @ts-ignore
				service.sendRecord();
				// @ts-ignore
				expect(service.telemetryRecord.storeRecord).not.toHaveBeenCalled();
			});
		});
	});

	describe('when enabled with Bootstrap', () => {
		beforeEach(() => {
			TestBed.configureTestingModule({
				imports: [HttpClientTestingModule],
				providers: [
					{provide: WINDOW, useFactory: windowProvider},
					{provide: ObThemeService, useValue: {isMaterial: jest.fn().mockReturnValue(false)}}
				]
			});

			service = TestBed.inject(ObTelemetryService);
		});

		describe('telemetryRecord', () => {
			it('should be defined', () => {
				// @ts-ignore
				expect(service.telemetryRecord).toBeDefined();
			});
			it('should have Material theme', () => {
				// @ts-ignore
				expect(service.telemetryRecord.record.obliqueTheme).toBe('Bootstrap');
			});
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});
});
