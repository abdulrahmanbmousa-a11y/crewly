import { RuntimeAgentService } from './runtime-agent.service.abstract.js';
import { SessionCommandHelper } from '../session/index.js';
import { RUNTIME_TYPES, type RuntimeType } from '../../constants.js';

/**
 * Moonshot AI Kimi Code CLI runtime service.
 *
 * Kimi authentication is delegated to the official CLI. Users authenticate once
 * with `kimi login` (OAuth device-code flow), after which Crewly launches the
 * normal interactive CLI with the configured `kimi --yolo` command.
 */
export class KimiRuntimeService extends RuntimeAgentService {
	constructor(sessionHelper: SessionCommandHelper, projectRoot: string) {
		super(sessionHelper, projectRoot);
	}

	protected getRuntimeType(): RuntimeType {
		return RUNTIME_TYPES.KIMI_CODE;
	}

	protected async detectRuntimeSpecific(sessionName: string): Promise<boolean> {
		const output = this.sessionHelper.capturePane(sessionName, 120);
		const hasReadySignal = this.getRuntimeReadyPatterns().some((pattern) => output.includes(pattern));

		this.logger.debug('Kimi Code detection completed', { sessionName, hasReadySignal });
		return hasReadySignal;
	}

	protected getRuntimeReadyPatterns(): string[] {
		return [
			'Kimi Code',
			'Welcome to Kimi',
			'kimi>',
			'/login',
			'model:',
		];
	}

	protected getRuntimeExitPatterns(): RegExp[] {
		return [
			/kimi.*exited/i,
			/session\s+ended/i,
			/conversation interrupted/i,
		];
	}

	protected getRuntimeErrorPatterns(): string[] {
		return [
			'Permission denied',
			'No such file or directory',
			'command not found: kimi',
			'Authentication failed',
			'Please log in',
			'Rate limit exceeded',
		];
	}
}
