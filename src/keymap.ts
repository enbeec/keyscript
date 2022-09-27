import { List, Map } from "immutable";
import { BehaviorSubject, map } from "rxjs";
import { KeyCode as LiteralKeyCode } from './keycodes'

export type Mod = typeof ModKeys[number];

type MaxLevel1<T> = T | T[];
type MaxLevel2<T> = T | T[] | T[][];

export type KeyCodes<Lvl = 0> =
  Lvl extends 0
  ? LiteralKeyCode
  : Lvl extends 1
  ? MaxLevel1<LiteralKeyCode>
  : Lvl extends 2
  ? MaxLevel2<LiteralKeyCode>
  : never;

export type KeyMap = typeof KeyMap;

export function KeyMap() {
  const keymap$: BehaviorSubject<
    Map<string, KeyCodes<1>>
  > = new BehaviorSubject(defaultKeymap);

  return {
    default() {
      return defaultKeymap;
    },

    Map(): Map<string, KeyCodes<1>> {
      return keymap$.getValue();
    },

    Map$() {
      return keymap$.asObservable();
    },

    _set(map: Map<string, KeyCodes<1>>) {
      keymap$.next(map);
    },

    get(key: string) {
      return keymap$.getValue().get(key);
    },

    modNames$: keymap$.asObservable().pipe(
      map(km => List(getModNames(km)))
    ),

    keyNames$: keymap$.asObservable().pipe(
      map(km => List(getKeynames(km)))
    ),
  }
}

function getModNames(keymap: Map<string, KeyCodes<1>>) {
  return List(keymap.keys())
    .filter(k => modKeys.some(m => m[0] === k));
}

function getKeynames(keymap: Map<string, KeyCodes<1>>) {
  return List(keymap.keys())
    .filter(k => modKeys.every(m => m[0] !== k));
}

enum ModKeys { ctrl, alt, shift, mod };

const ctrl = [LiteralKeyCode.ControlLeft, LiteralKeyCode.ControlRight];
const alt = [LiteralKeyCode.AltLeft, LiteralKeyCode.AltRight];
const shift = [LiteralKeyCode.ShiftLeft, LiteralKeyCode.ShiftRight];

const modKeys: [string, KeyCodes<1>][] = [
  ['ctrl', ctrl],
  ['alt', alt],
  ['shift', shift],
  ['mod', [...ctrl, ...alt]],
];

const defaultKeymap = Map<string, KeyCodes<1>>([
  modKeys[ModKeys.ctrl],
  modKeys[ModKeys.alt],
  modKeys[ModKeys.shift],
  modKeys[ModKeys.mod],

  ['up', [LiteralKeyCode.ArrowUp]],
  ['down', [LiteralKeyCode.ArrowDown]],
  ['left', [LiteralKeyCode.ArrowLeft]],
  ['right', [LiteralKeyCode.ArrowRight]],

  ['a', [LiteralKeyCode.KeyA]],
  ['b', [LiteralKeyCode.KeyB]],
  ['c', [LiteralKeyCode.KeyC]],
  ['d', [LiteralKeyCode.KeyD]],
  ['e', [LiteralKeyCode.KeyE]],
  ['f', [LiteralKeyCode.KeyF]],
  ['g', [LiteralKeyCode.KeyG]],
  ['h', [LiteralKeyCode.KeyH]],
  ['i', [LiteralKeyCode.KeyI]],
  ['j', [LiteralKeyCode.KeyJ]],
  ['k', [LiteralKeyCode.KeyK]],
  ['l', [LiteralKeyCode.KeyL]],
  ['m', [LiteralKeyCode.KeyM]],
  ['n', [LiteralKeyCode.KeyN]],
  ['o', [LiteralKeyCode.KeyO]],
  ['p', [LiteralKeyCode.KeyP]],
  ['q', [LiteralKeyCode.KeyQ]],
  ['r', [LiteralKeyCode.KeyR]],
  ['s', [LiteralKeyCode.KeyS]],
  ['t', [LiteralKeyCode.KeyT]],
  ['u', [LiteralKeyCode.KeyU]],
  ['v', [LiteralKeyCode.KeyV]],
  ['w', [LiteralKeyCode.KeyW]],
  ['x', [LiteralKeyCode.KeyX]],
  ['y', [LiteralKeyCode.KeyY]],
  ['z', [LiteralKeyCode.KeyZ]],

  ['ent', [LiteralKeyCode.Enter]],
  ['esc', [LiteralKeyCode.Escape]],
  ['tab', [LiteralKeyCode.Tab]],
  ['space', [LiteralKeyCode.Space]],
  ['bspace', [LiteralKeyCode.Backspace]],
  ['eql', [LiteralKeyCode.Equal]],
  ['mins', [LiteralKeyCode.Minus]],
  ['lbrc', [LiteralKeyCode.BracketLeft]],
  ['rbrc', [LiteralKeyCode.BracketRight]],
  ['bsls', [LiteralKeyCode.Backslash]],
  ['scln', [LiteralKeyCode.Semicolon]],
  ['quot', [LiteralKeyCode.Quote]],
  ['comm', [LiteralKeyCode.Comma]],
  ['dot', [LiteralKeyCode.Period]],
  ['slsh', [LiteralKeyCode.Slash]],

  ['0', [LiteralKeyCode.Digit0]],
  ['1', [LiteralKeyCode.Digit1]],
  ['2', [LiteralKeyCode.Digit2]],
  ['3', [LiteralKeyCode.Digit3]],
  ['4', [LiteralKeyCode.Digit4]],
  ['5', [LiteralKeyCode.Digit5]],
  ['6', [LiteralKeyCode.Digit6]],
  ['7', [LiteralKeyCode.Digit7]],
  ['8', [LiteralKeyCode.Digit8]],
  ['9', [LiteralKeyCode.Digit9]],
]);
