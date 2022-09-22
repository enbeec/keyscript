import { generate } from "peggy"
import { Observable } from "rxjs";
import { chord, seq } from "./keyboard";
import { KeyCode, KeyMap, Mod } from "./keycodes";

/** 
  Grammar rules:
    statements start with a label
    mods may only follow a label or another mod
    chord/seq may only follow a mod
    lists terminate the statement and must follow chord/seq
    (implicit) EOF means no more statements
*/
const grammar = () => `
Start
 = Keyscript

Keyscript
 = Statement *

Statement 
  = l:Label _ t:ListType _ m:(Mods/NoMods) v:(List/EmptyList) StatementEnd
  { return { label: l, type: t, mods: m, value: v };}
  
StatementEnd "end of statement"
 = _ws nl*

Mods
 = head:Mod tail:PaddedMod* _
 { return [head, ...tail] }

NoMods
 = _ws
 { return [] }

PaddedMod "mod/ctl/alt/shift"
 = _ m:Mod
 { return m }

Mod "mod/ctl/alt/shift"
 = "ctl" / "alt" / "shift" / "mod"

List
 = ListStart head:Key tail:PaddedKey* _ws ListEnd
 { return [head, ...tail.map($ => $[1])] }
 
EmptyList
 = "("_ws")"
 { return [] }

ListStart "start of list"
 = "(" / "[" / "{"

ListEnd "end of list"
 = ")" / "]" / "}"
 
ListType
 = "chord" / "seq"

PaddedKey "bindable key"
 = _ k:Key
 { return k }

Key "bindable key"
 = "up" / "down" / "left" / "right" / [a-z]

Label
 = Word

Word
 = l:Letter+
 { return l.join("") }

Number
 = [0-9]

Letter
 = [a-zA-Z]
 
_nl "Optionally padded newline"
 = _*nl

nl "newline"
 = "\\n"

ws "whitespace"
 = [ \\t]

_ws "zero or more whitespaces"
 = ws*

_ "one or more whitespaces"
 = ws+
`

const parser = generate(grammar());

interface Statement {
  label: string;
  type: 'chord' | 'seq';
  mods: Mod[];
  value: string[];
}

interface Binding {
  label: string;
  type: 'chord' | 'seq';
  mods: Mod[];
  value: KeyCode[];
}

export type KeyBindings = Map<string, Observable<KeyboardEvent[]>>;

type MatchMaker = (keys: KeyCode | KeyCode[] | KeyCode[][]) => Observable<KeyboardEvent[]>;
type NamedMatchMaker = [string, MatchMaker];

/**
 * Default matchers: chord, seq
 */
export class Keyscript {

  /* YAGNI? never heard of her... =============================================== */
  private makeMatchMakers(matchers: NamedMatchMaker[]): Map<string, MatchMaker> {
    return new Map([...matchers, ['chord', chord], ['seq', seq]]);
  }

  private _matchers: Map<string, MatchMaker>;
  private get matchers() { return Array.from(this._matchers.entries()) }
  private set matchers(matchers: NamedMatchMaker[]) {
    this._matchers = this.makeMatchMakers(matchers);
  }

  private _keymap: KeyMap;
  private get keymap() { return this._keymap }
  private set keymap(keymap: KeyMap) {
    this._keymap = keymap;
  }

  private buildPipeline() { }
  /* end da anti-YAGNI zone ===================================================== */

  constructor(
    keymap: KeyMap,
    matchers: NamedMatchMaker[],
  ) {
    this._keymap = keymap;
    this._matchers = this.makeMatchMakers(matchers);
    this.buildPipeline();
  }

  compile(source: string): KeyBindings {
    return this.buildBindings(
      this.parseStatements(source)
    );
  }

  private key(name: string) {
    const key = this._keymap.get(name);
    if (!key) throw new Error(`no matcher named ${name}`)
  }

  private matcher(name: string) {
    const matcher = this._matchers.get(name);
    if (!matcher) throw new Error(`no matcher named ${name}`);
    return matcher;
  }

  /** @throws Error from Peggy parser */
  private parseStatements(source: string): Statement[] {
    let statements: Statement[] = [];

    try {
      statements = parser.parse(source);
    } catch (e) {
      throw new Error(`Problem parsing input: ${e}`);
    }

    // filter out duplicates by casting to a map and back
    return Array.from(
      new Map(
        statements.map<[string, Statement]>((s) => [s.label, s])
      ).values()
    );
  }

  /** @throws Error if any key (in keymap) or matcher is missing */
  private buildBindings(statements: Statement[]): KeyBindings {
    const bindings = statements.map<Binding>(binding => {
      const keycodes = binding.value.map(key => {
        const mapcodes = this.keymap[key];
        return mapcodes;
      }) as KeyCode[];
      return {
        ...binding,
        value: keycodes,
      };
    });

    return new Map(bindings.map<[string, Observable<KeyboardEvent[]>]>(binding => {
      let stream = null as unknown as Observable<KeyboardEvent[]>;
      switch (binding.type) {
        case 'chord': stream = this.matcher('chord')(binding.value); break;
        case 'seq': stream = this.matcher('seq')(binding.value); break;
      }
      if (stream === null)
        throw new Error(`Failed to create stream for binding: ${binding.label}`);

      return ([binding.label, stream]);
    }));
  }
}
