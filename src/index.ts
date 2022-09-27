import type { ObservedValueOf, Subscription } from "rxjs";
import type { KeyCode } from "./keycodes";
import { Matchers, KeyMatcher } from "./keyboard";
import { KeyMap, Mod } from "./keymap"
import { makeParser$, Statement } from "./parser";

interface Binding {
  label: string;
  type: 'chord' | 'seq';
  mods: Mod[];
  value: KeyCode[];
}

type BindingTuple = [string, KeyMatcher];

/**
 * Default matchers: chord, seq
 */
export class Keyscript {
  compile(source: string) {
    this.parser.parse(source).map(this.bindAndLabel);
  }

  destroy() {
    this.subscription.unsubscribe();
  }

  constructor() {
    this.matchers = Matchers();
    this.keymap = KeyMap();
    this.subscription = makeParser$(
      this.matchers.matcherNames$,
      this.keymap.keyNames$,
      this.keymap.modNames$
    ).subscribe(parser => this.parser = parser);
  }

  private matchers: ReturnType<Matchers>;
  private keymap: ReturnType<KeyMap>;
  private subscription: Subscription;
  private parser: ObservedValueOf<ReturnType<typeof makeParser$>>;

  private bindAndLabel(statement: Statement): BindingTuple {
    const binding = {
      ...statement,
      value: statement.value.map(key => {
        const mapcodes = this.keymap.get(key);
        return mapcodes;
      }) as KeyCode[],
    };

    // binding.type is "chord" or "seq" etc.
    const stream = this.matchers.get(binding.type);
    if (!stream)
      throw new Error(`Failed to create stream for binding: ${binding.label}`);
    return ([binding.label, stream]);
  }
}
