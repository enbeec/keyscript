import { BehaviorSubject, Observer } from 'rxjs';
import { KeyCode as KeyCodeEnum } from './keycodes'
import { SubSink } from 'subsink';

export type Mod = typeof modKeys[number];

type MaxLevel1<T> = T | T[];
type MaxLevel2<T> = T | T[];

type KeyCode<Lvl = 0> =
  Lvl extends 0
  ? KeyCodeEnum
  : Lvl extends 1
  ? MaxLevel1<KeyCodeEnum>
  : Lvl extends 2
  ? MaxLevel2<KeyCodeEnum>
  : never;

type TupKeyMap = [string, KeyCode<1>];

export class KeyMap {
  private _keymap$: BehaviorSubject<TupKeyMap[]>;
  private _keymap: TupKeyMap[];
  private subs = new SubSink();
  destroy = () => this.subs.unsubscribe();

  constructor(keymap?: typeof defaultKeymap) {
    this._keymap$ = new BehaviorSubject(keymap || [
      ...defaultKeymap, ...(defaultModmap as TupKeyMap[])
    ]);
    this.subs.sink = this._keymap$.subscribe(this.observer);
  }

  private observer: Observer<TupKeyMap[]> = {
    next(tups) {
      this._keymap = tups;
    },
    error(e) {
      console.error(e);
    },
    complete() { },
  };

  get keymap() {
    return this._keymap;
  }

  get(name: string) {
    return this._keymap.find(k => k[0] === name);
  }
  set(name: string, keys: KeyCode<1>) {
    const foundIndex = this._keymap.findIndex(t => t[0] === name);
    if (foundIndex >= 0)
      this._keymap$.next([
        ...this._keymap.slice(0, foundIndex),
        [name, keys],
        ...this._keymap.slice(foundIndex + 1)
      ]);
    else this._keymap$.next(this._keymap.concat([name, keys]));
  }

  mods: string[] = defaultModmap
    .map(k => k[0] as typeof k[0]);

  defaultKeys: string[] = defaultKeymap
    .map(k => k[0])
    .filter(k => this.mods.every(n => n !== k));

  get keys(): string[] {
    return this._keymap
      .map(k => k[0])
      .filter(k => this.mods.every(n => n !== k));
  }
}

const ctl = [KeyCodeEnum.ControlLeft, KeyCodeEnum.ControlRight];
const alt = [KeyCodeEnum.AltLeft, KeyCodeEnum.AltRight];
const shift = [KeyCodeEnum.ShiftLeft, KeyCodeEnum.ShiftRight];

const modKeys = ['ctrl', 'alt', 'shift', 'mod'] as const;

const modCodes = [
  ctl,
  alt,
  shift,
  [...ctl, ...alt],
];

export const defaultModmap = modKeys.map((name, i) => [name, modCodes[i]]) as TupKeyMap[];

export const defaultKeymap: TupKeyMap[] = [
  ['up', [KeyCodeEnum.ArrowUp]],
  ['down', [KeyCodeEnum.ArrowDown]],
  ['left', [KeyCodeEnum.ArrowLeft]],
  ['right', [KeyCodeEnum.ArrowRight]],

  ['a', [KeyCodeEnum.KeyA]],
  ['b', [KeyCodeEnum.KeyB]],
  ['c', [KeyCodeEnum.KeyC]],
  ['d', [KeyCodeEnum.KeyD]],
  ['e', [KeyCodeEnum.KeyE]],
  ['f', [KeyCodeEnum.KeyF]],
  ['g', [KeyCodeEnum.KeyG]],
  ['h', [KeyCodeEnum.KeyH]],
  ['i', [KeyCodeEnum.KeyI]],
  ['j', [KeyCodeEnum.KeyJ]],
  ['k', [KeyCodeEnum.KeyK]],
  ['l', [KeyCodeEnum.KeyL]],
  ['m', [KeyCodeEnum.KeyM]],
  ['n', [KeyCodeEnum.KeyN]],
  ['o', [KeyCodeEnum.KeyO]],
  ['p', [KeyCodeEnum.KeyP]],
  ['q', [KeyCodeEnum.KeyQ]],
  ['r', [KeyCodeEnum.KeyR]],
  ['s', [KeyCodeEnum.KeyS]],
  ['t', [KeyCodeEnum.KeyT]],
  ['u', [KeyCodeEnum.KeyU]],
  ['v', [KeyCodeEnum.KeyV]],
  ['w', [KeyCodeEnum.KeyW]],
  ['x', [KeyCodeEnum.KeyX]],
  ['y', [KeyCodeEnum.KeyY]],
  ['z', [KeyCodeEnum.KeyZ]],

  ['ent', [KeyCodeEnum.Enter]],
  ['esc', [KeyCodeEnum.Escape]],
  ['tab', [KeyCodeEnum.Tab]],
  ['space', [KeyCodeEnum.Space]],
  ['bspace', [KeyCodeEnum.Backspace]],
  ['eql', [KeyCodeEnum.Equal]],
  ['mins', [KeyCodeEnum.Minus]],
  ['lbrc', [KeyCodeEnum.BracketLeft]],
  ['rbrc', [KeyCodeEnum.BracketRight]],
  ['bsls', [KeyCodeEnum.Backslash]],
  ['scln', [KeyCodeEnum.Semicolon]],
  ['quot', [KeyCodeEnum.Quote]],
  ['comm', [KeyCodeEnum.Comma]],
  ['dot', [KeyCodeEnum.Period]],
  ['slsh', [KeyCodeEnum.Slash]],

  ['0', [KeyCodeEnum.Digit0]],
  ['1', [KeyCodeEnum.Digit1]],
  ['2', [KeyCodeEnum.Digit2]],
  ['3', [KeyCodeEnum.Digit3]],
  ['4', [KeyCodeEnum.Digit4]],
  ['5', [KeyCodeEnum.Digit5]],
  ['6', [KeyCodeEnum.Digit6]],
  ['7', [KeyCodeEnum.Digit7]],
  ['8', [KeyCodeEnum.Digit8]],
  ['9', [KeyCodeEnum.Digit9]],
];
