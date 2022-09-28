import { List, Map } from "immutable";
import { BehaviorSubject, map } from "rxjs";
import { KeyCode, KeyCodes as KeyCodesLvl } from './keycodes'

type KeyCodes = KeyCodesLvl<1>;

export type Mod = typeof ModKeys[number];

export type KeyMap = typeof KeyMap;

/** 
  * A pseudo-class wrapping a: 
  * 
  * `BehaviorSubject<Immutable.Map<string | KeyCodes<1>>>`
  * 
  * By default, the keymap is built using an Enum of key codes I found online.
  * Having the map stored in a subject allows for consunmers to write their 
  * own map or even switch them on the fly. Two `Observable<List<string>>`
  * are exposed as parser dependencies.
  *
  * I don't know a ton about i18n but it seems helpful 
  *           and would be a pain to incorporate later on IMO.
  */
export function KeyMap() {
  const keymap$: BehaviorSubject<
    Map<string, KeyCodes>
  > = new BehaviorSubject(defaultKeymap);

  return {
    default() {
      return defaultKeymap;
    },

    Map(): Map<string, KeyCodes> {
      return keymap$.getValue();
    },

    Map$() {
      return keymap$.asObservable();
    },

    _set(map: Map<string, KeyCodes>) {
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

function getModNames(keymap: Map<string, KeyCodes>) {
  return List(keymap.keys())
    .filter(k => modKeys.some(m => m[0] === k));
}

function getKeynames(keymap: Map<string, KeyCodes>) {
  return List(keymap.keys())
    .filter(k => modKeys.every(m => m[0] !== k));
}

enum ModKeys {
  ctrl, alt, shift,
  lctrl, lalt, lshift,
  rctrl, ralt, rshift,
  mod,
};

const ctrl = [KeyCode.ControlLeft, KeyCode.ControlRight];
const alt = [KeyCode.AltLeft, KeyCode.AltRight];
const shift = [KeyCode.ShiftLeft, KeyCode.ShiftRight];

const modKeys: [string, KeyCodes][] = [
  ['lctrl', [KeyCode.ControlLeft]],
  ['rctrl', [KeyCode.ControlRight]],
  ['ctrl', ctrl],

  ['alt', alt],
  ['lalt', [KeyCode.AltLeft]],
  ['ralt', [KeyCode.AltRight]],

  ['shift', shift],
  ['lshift', [KeyCode.ShiftLeft]],
  ['rshift', [KeyCode.ShiftRight]],

  ['mod', [...ctrl, ...alt]],
];

const defaultKeymap = Map<string, KeyCodes>([
  ...modKeys,

  ['up', [KeyCode.ArrowUp]],
  ['down', [KeyCode.ArrowDown]],
  ['left', [KeyCode.ArrowLeft]],
  ['right', [KeyCode.ArrowRight]],

  ['a', [KeyCode.KeyA]],
  ['b', [KeyCode.KeyB]],
  ['c', [KeyCode.KeyC]],
  ['d', [KeyCode.KeyD]],
  ['e', [KeyCode.KeyE]],
  ['f', [KeyCode.KeyF]],
  ['g', [KeyCode.KeyG]],
  ['h', [KeyCode.KeyH]],
  ['i', [KeyCode.KeyI]],
  ['j', [KeyCode.KeyJ]],
  ['k', [KeyCode.KeyK]],
  ['l', [KeyCode.KeyL]],
  ['m', [KeyCode.KeyM]],
  ['n', [KeyCode.KeyN]],
  ['o', [KeyCode.KeyO]],
  ['p', [KeyCode.KeyP]],
  ['q', [KeyCode.KeyQ]],
  ['r', [KeyCode.KeyR]],
  ['s', [KeyCode.KeyS]],
  ['t', [KeyCode.KeyT]],
  ['u', [KeyCode.KeyU]],
  ['v', [KeyCode.KeyV]],
  ['w', [KeyCode.KeyW]],
  ['x', [KeyCode.KeyX]],
  ['y', [KeyCode.KeyY]],
  ['z', [KeyCode.KeyZ]],

  ['ent', [KeyCode.Enter]],
  ['esc', [KeyCode.Escape]],
  ['tab', [KeyCode.Tab]],
  ['space', [KeyCode.Space]],
  ['bspace', [KeyCode.Backspace]],
  ['eql', [KeyCode.Equal]],
  ['mins', [KeyCode.Minus]],
  ['lbrc', [KeyCode.BracketLeft]],
  ['rbrc', [KeyCode.BracketRight]],
  ['bsls', [KeyCode.Backslash]],
  ['scln', [KeyCode.Semicolon]],
  ['quot', [KeyCode.Quote]],
  ['comm', [KeyCode.Comma]],
  ['dot', [KeyCode.Period]],
  ['slsh', [KeyCode.Slash]],

  ['0', [KeyCode.Digit0]],
  ['1', [KeyCode.Digit1]],
  ['2', [KeyCode.Digit2]],
  ['3', [KeyCode.Digit3]],
  ['4', [KeyCode.Digit4]],
  ['5', [KeyCode.Digit5]],
  ['6', [KeyCode.Digit6]],
  ['7', [KeyCode.Digit7]],
  ['8', [KeyCode.Digit8]],
  ['9', [KeyCode.Digit9]],
]);
