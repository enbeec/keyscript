import { first, firstValueFrom, map, Observable, ObservedValueOf, withLatestFrom } from "rxjs";
import type { KeyCode } from "./keycodes";
import { Map } from "immutable";
import { Matchers } from "./keyboard";
import { KeyMap } from "./keymap"
import { makeParser$, Statement } from "./parser";
import { defaultLogger, ILogger } from "./logging";

type Binding = [string, Observable<KeyboardEvent[]>];
type Parser = ObservedValueOf<ReturnType<typeof makeParser$>>;

/**
 * Default matchers: chord, seq
 */
export class Keyscript {
  async compile(source: string) {
    return firstValueFrom(this.compile$(source));
  }

  compile$(source: string) {
    return this.parser$.pipe(
      first(),
      map(parser => this._compile(source, parser)),
    )
  }

  bindings$(source: Observable<string>) {
    return source.pipe(
      withLatestFrom(this.parser$),
      map(([source, parser]) => this._compile(source, parser))
    )
  }

  constructor(logger?: ILogger) {
    this.logger = logger || defaultLogger;

    this.matchers = Matchers();
    this.keymap = KeyMap();

    this.parser$ = makeParser$(
      this.matchers.matcherNames$,
      this.keymap.keyNames$,
      this.keymap.modNames$
    );
  }

  private logger: ILogger;

  private matchers: ReturnType<Matchers>;
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
      value: statement.value.map(key => {
        const mapcodes = this.keymap.get(key);
        return mapcodes;
      }) as KeyCode[],
    };

    // binding.type is "chord" or "seq" etc.
    const stream = this.matchers.get(binding.type)(binding.value);
    if (!stream) throw new Error(
      `Failed to create stream for binding: ${binding.label}`
    );
    return ([binding.label, stream]);
  }
}
