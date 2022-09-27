import { Observable, combineLatest, map } from "rxjs";
import { List } from "immutable";
import type { Mod } from "./keymap"
import { generate } from "peggy";

export interface Statement {
  label: string;
  type: 'chord' | 'seq';
  mods: Mod[];
  value: string[];
}

export function makeParser$(
  matcherNames$: Observable<List<string>>,
  keyNames$: Observable<List<string>>,
  modNames$: Observable<List<string>>,
) {
  return combineLatest([matcherNames$, keyNames$, modNames$]).pipe(
    // create the parser
    map(([matchers, keys, mods]) => generate(grammar({ matchers, keys, mods }))),
    // custom interface for typing the parser output
    map(parser => {
      return {
        parse(...params: Parameters<typeof parser['parse']>): Statement[] {
          return parser.parse(...params);
        },
        SyntaxError: parser.SyntaxError,
      }
    })
  )
}

// TODO: list -> expr
// TODO: should mod be an expr?
// TODO: expr ~= list | list of lists etc...

const quote = (str: string) => `"${str}"`;
const peggify = (strs: List<string>) => strs.map(quote).join('/');

const grammar = ({ matchers, keys, mods }: {
  matchers: List<string>;
  keys: List<string>;
  mods: List<string>;
}) => `
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
= ${peggify(matchers)}

Key "bindable key"
= ${peggify(keys)}

Mod "mod/ctl/alt/shift"
= ${peggify(mods)}

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
`;
