import { describe, it, expect, vi } from 'vitest';
import { LogLevel, ConsoleLogger } from '../../src/utils/logger';

describe('ConsoleLogger', () => {
  it('logs only at or above min level', () => {
    const spyInfo = vi.spyOn(console, 'info').mockImplementation(() => {});
    const spyDebug = vi.spyOn(console, 'debug').mockImplementation(() => {});

    // create a logger with minLevel = INFO
    const instance = new ConsoleLogger(LogLevel.INFO);

    instance.debug('debug message');
    instance.info('info message');

    expect(spyDebug).not.toHaveBeenCalled();
    expect(spyInfo).toHaveBeenCalled();

    spyInfo.mockRestore();
    spyDebug.mockRestore();
  });

  it('formats error and prints stack', () => {
    const spyError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const instance = new ConsoleLogger(LogLevel.DEBUG);

    const err = new Error('boom');
    instance.error('fail', err);

    expect(spyError).toHaveBeenCalled();

    spyError.mockRestore();
  });
});
