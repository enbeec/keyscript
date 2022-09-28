import { Observable, combineLatest, map, tap } from "rxjs";
import { List } from "immutable";
import type { Mod } from "./keymap"
import { generate } from "peggy";
import { defaultLogger, ILogger } from "./logging";

export interface Statement {
  label: string;
  type: 'chord' | 'seq';
  mods: Mod[];
  value: string[];
}

/**
  * The parser is always built using reactive dependencies. 
  *
  * My hope is to have hot reloading from the start because 
  * it's useful for i18n reasons and supporting extension.
  *
  * Why from the start? Because it's easy now and won't be later.
  */
export function makeParser$(
  matcherNames$: Observable<List<string>>,
  keyNames$: Observable<List<string>>,
  modNames$: Observable<List<string>>,
  logger?: ILogger,
) {
  logger ??= defaultLogger;
  return combineLatest([matcherNames$, keyNames$, modNames$]).pipe(
    tap(([matchers, keys, mods]) => logger.debug(
      `Generating a parser with:`,
      matchers.toArray(),
      keys.toArray(),
      mods.toArray(),
    )),
    map(([matchers, keys, mods]) => grammar({ matchers, keys, mods })),
    // log the grammar
    tap(logger.debug),
    map(grammar => generate(grammar)),
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
= nl* s:((Statement/Comment)*) nl*
{ return s.filter(Boolean) }

Comment "comment"
= "--" [a-zA-Z0-9 \\t]* "\\n"
{ return undefined }

Statement "statement"
= l:Label _1 t:Matcher _1 m:(Mods/NoMods) _0 v:(List/EmptyList) StatementEnd
{ return { label: l, type: t, mods: m, value: v };}

StatementEnd "end of statement"
= nl

Mods
= ListStart _0nl head:Mod tail:PaddedMod* _0nl ListEnd
{ return [head, ...tail] }

List
= ListStart _0nl head:Key tail:PaddedKey* _0nl ListEnd
{ return [head, ...tail.map($ => $[1])] }

NoMods
= _0
{ return [] }

PaddedMod "mod/ctl/alt/shift"
= _1 m:Mod
{ return m }

EmptyList
= ListStart _0 ListEnd
{ return [] }

PaddedKey "bindable key"
= _1 k:Key
{ return k }

Label
= Word

Word
= l:Letter+
{ return l.join("") }

ParamStart
= "("

ParamEnd
= ")"

ListStart "start of list"
= "["

ListEnd "end of list"
= "]"

BlockStart
= "{"

BlockEnd
= "}"

Number
= [0-9]

Letter
= [a-zA-Z]

_0nl "zero or more whitespaces incl. newlines"
= (ws/"\\n")*

nl "newline"
= _0 "\\n"

ws "whitespace"
= [ \\t]

_0 "zero or more whitespaces"
= ws*

_1 "one or more whitespaces"
= ws+

Key "bindable key"
= ${peggify(keys)}

Mod "mod/ctl/alt/shift"
= ${peggify(mods)}

Matcher
= ${peggify(matchers)}
`;
