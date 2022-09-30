import { Observable, ObservedValueOf, firstValueFrom, map, withLatestFrom } from "rxjs";
import type { KeyCode } from "./keycodes";
import { Map } from "immutable";
import { KeyOperators } from "./keyboard";
import { KeyMap } from "./keymap"
import { makeParser$, Statement } from "./parser";
import { defaultLogger, ILogger } from "./logging";

type Binding = [string, Observable<KeyboardEvent[]>];
type Parser = ObservedValueOf<ReturnType<typeof makeParser$>>;

/**
 * Keyscript puts the matchers and keymap (regular keys as well as mods) 
 * together into a compiler. There are two ways to call the compiler:
 *
 * Async via `compile` -- great for just trying things out.
 *
 * Observable `bindings$` takes a constant source but will recompile if any dependencies change.
 *
 * Observable `compile$` is like `bindings$` but adds an Observable source to the dependencies.
 */
export class Keyscript {
  async compile(source: string) {
    return firstValueFrom(this.bindings$(source));
  }

  bindings$(source: string) {
    return this.parser$.pipe(
      map(parser => this._compile(source, parser)),
    );
  }

  compile$(source: Observable<string>) {
    return source.pipe(
      withLatestFrom(this.parser$),
      map(([source, parser]) => this._compile(source, parser))
    )
  }

  constructor(logger?: ILogger) {
    this.logger = logger || defaultLogger;

    this.matchers = KeyOperators();
    this.keymap = KeyMap();

    this.parser$ = makeParser$(
      this.matchers.matcherNames$,
      this.keymap.keyNames$,
      this.keymap.modNames$
    );
  }

  private logger: ILogger;

  private matchers: ReturnType<KeyOperators>;
  private keymap: ReturnType<KeyMap>;
  private parser$: Observable<Parser>;

  private _compile(source: string, parser: Parser) {
    const bindings: Binding[] = [];
    bindings.push(...parser.parse(source).map(s => {
      this.logger.debug(s)
      return this.bindAndLabel(s)
    }));
    return Map(bindings);
  }

  private bindAndLabel(statement: Statement): Binding {
    const binding = {
      ...statement,
      value: statement.value.concat(statement.mods)
        .map(key => this.keymap.get(key)) as KeyCode[],
    };

    // binding.type is "chord" or "seq" etc.
    const stream = this.matchers.get(binding.type)(binding.value);
    if (!stream) throw new Error(
      `Failed to create stream for binding: ${binding.label}`
    );
    return ([binding.label, stream]);
  }
}
