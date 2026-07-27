import { KimiRuntimeService } from './kimi-runtime.service.js';
import { RUNTIME_TYPES } from '../../constants.js';
import type { SessionCommandHelper } from '../session/index.js';

describe('KimiRuntimeService', () => {
	let service: KimiRuntimeService;
	let sessionHelper: jest.Mocked<SessionCommandHelper>;

	beforeEach(() => {
		sessionHelper = {
			capturePane: jest.fn().mockReturnValue(''),
		} as unknown as jest.Mocked<SessionCommandHelper>;
		service = new KimiRuntimeService(sessionHelper, '/test/project');
	});

	it('uses the Kimi runtime type', () => {
		expect(service['getRuntimeType']()).toBe(RUNTIME_TYPES.KIMI_CODE);
	});

	it('recognizes a ready Kimi prompt', async () => {
		sessionHelper.capturePane.mockReturnValue('Welcome to Kimi\nkimi>');

		await expect(service['detectRuntimeSpecific']('kimi-agent')).resolves.toBe(true);
		expect(sessionHelper.capturePane).toHaveBeenCalledWith('kimi-agent', 120);
	});

	it('does not report an unrelated terminal as ready', async () => {
		sessionHelper.capturePane.mockReturnValue('user@host:~$');
		await expect(service['detectRuntimeSpecific']('kimi-agent')).resolves.toBe(false);
	});

	it('exposes Kimi authentication and command errors', () => {
		expect(service['getRuntimeErrorPatterns']()).toEqual(expect.arrayContaining([
			'command not found: kimi',
			'Please log in',
			'Authentication failed',
		]));
	});
});
