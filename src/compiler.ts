import { generate } from "peggy"
import { Observable } from "rxjs";
import { chord, seq } from "./keyboard";
import { KeyCode } from "./keycodes";
import { KeyMap, Mod } from "./keymap"

const keymap = new KeyMap();

// TODO: list -> expr
// TODO: should mod be an expr?
// TODO: arbitrary nesting level in grammar (recursive) but enforce KeyCode|KeyCode[]|KeyCode[][] after parser
//       -- also document what the three types in that union mean:
//            KeyCode = a key
//            KeyCode[] = keys as args to a matchmaker
//            KeyCode[][] = keyA | keyB arrays as keys as args to a matchmaker

const quote = (str: string) => `"${str}"`;
const peggify = (strs: string[]) => strs.map(quote).join('/');

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
  = l:Label _1 t:ListType _1 m:(Mods/NoMods) v:(List/EmptyList) StatementEnd
  { return { label: l, type: t, mods: m, value: v };}
  
StatementEnd "end of statement"
 = nl

Mods
 = head:Mod tail:PaddedMod* _1
 { return [head, ...tail] }

NoMods
 = _0
 { return [] }

PaddedMod "mod/ctl/alt/shift"
 = _1 m:Mod
 { return m }

List
 = ListStart head:Key tail:PaddedKey* _0 ListEnd
 { return [head, ...tail.map($ => $[1])] }
 
EmptyList
 = "("_0")"
 { return [] }

ListStart "start of list"
 = "(" / "[" / "{"

ListEnd "end of list"
 = ")" / "]" / "}"

PaddedKey "bindable key"
 = _1 k:Key
 { return k }
 
ListType
 = "chord" / "seq"

Key "bindable key"
 = ${peggify(keymap.keys)}

Mod "mod/ctl/alt/shift"
 = ${peggify(keymap.mods)}

Label
 = Word

Word
 = l:Letter+
 { return l.join("") }

Number
 = [0-9]

Letter
 = [a-zA-Z]
 
_nl
 = nl*

nl "newline"
 = _0 "\\n"

ws "whitespace"
 = [ \\t]

_0 "zero or more whitespaces"
 = ws*

_1 "one or more whitespaces"
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
  /* end da anti-YAGNI zone ===================================================== */

  constructor(
    // keymap: KeyMap,
    matchers: NamedMatchMaker[],
    // this._keymap = keymap;
  ) {
    this._matchers = this.makeMatchMakers(matchers);
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
