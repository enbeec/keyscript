type FAnyVoid = (...data: any[]) => void;
export interface ILogger {
  error: FAnyVoid,
  warn: FAnyVoid,
  log: FAnyVoid,
  info: FAnyVoid,
  debug: FAnyVoid,
}

export const defaultLogger: ILogger = {
  error: console.error,
  warn: console.warn,
  log: console.log,
  info: console.info,
  debug: console.debug,
}
