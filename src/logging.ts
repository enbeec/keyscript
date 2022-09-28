type FAnyVoid = (...data: any[]) => void;

/** 
  * A simplified wrapper around Console -- a pattern I'm working on using more often.
  * 
  * By default things are default as in transparently the same.
  */
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
