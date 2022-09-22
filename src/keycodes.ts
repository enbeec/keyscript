// https://github.com/garygrossgarten/rxjs-shortcuts/blob/master/projects/shortcuts/src/lib/keycodes.ts
export enum KeyCode {
  KeyA = "KeyA",
  KeyB = "KeyB",
  KeyC = "KeyC",
  KeyD = "KeyD",
  KeyE = "KeyE",
  KeyF = "KeyF",
  KeyG = "KeyG",
  KeyH = "KeyH",
  KeyI = "KeyI",
  KeyJ = "KeyJ",
  KeyK = "KeyK",
  KeyL = "KeyL",
  KeyM = "KeyM",
  KeyN = "KeyN",
  KeyO = "KeyO",
  KeyP = "KeyP",
  KeyQ = "KeyQ",
  KeyR = "KeyR",
  KeyS = "KeyS",
  KeyT = "KeyT",
  KeyU = "KeyU",
  KeyV = "KeyV",
  KeyW = "KeyW",
  KeyX = "KeyX",
  KeyY = "KeyY",
  KeyZ = "KeyZ",

  Digit0 = "Digit0",
  Digit1 = "Digit1",
  Digit2 = "Digit2",
  Digit3 = "Digit3",
  Digit4 = "Digit4",
  Digit5 = "Digit5",
  Digit6 = "Digit6",
  Digit7 = "Digit7",
  Digit8 = "Digit8",
  Digit9 = "Digit9",

  F1 = "F1",
  F2 = "F2",
  F3 = "F3",
  F4 = "F4",
  F5 = "F5",
  F6 = "F6",
  F7 = "F7",
  F8 = "F8",
  F9 = "F9",
  F10 = "F10",
  F11 = "F11",
  F12 = "F12",

  F13 = "F13",
  F14 = "F14",
  F15 = "F15",
  F16 = "F16",
  F17 = "F17",
  F18 = "F18",
  F19 = "F19",
  F20 = "F20",

  MetaLeft = "MetaLeft",
  AltLeft = "AltLeft",
  ShiftLeft = "ShiftLeft",
  ControlLeft = "ControlLeft",

  MetaRight = "MetaRight",
  AltRight = "AltRight",
  ShiftRight = "ShiftRight",
  ControlRight = "ControlRight",

  ArrowRight = "ArrowRight",
  ArrowUp = "ArrowUp",
  ArrowLeft = "ArrowLeft",
  ArrowDown = "ArrowDown",

  Function = "Function",
  Delete = "Delete",
  Home = "Home",
  End = "End",
  PageUp = "PageUp",
  PageDown = "PageDown",

  Backquote = "Backquote",
  CapsLock = "CapsLock",
  Tab = "Tab",
  Space = "Space",
  Backspace = "Backspace",
  Enter = "Enter",
  Escape = "Escape",

  Backslash = "Backslash",
  Comma = "Comma",
  Equal = "Equal",
  BracketLeft = "BracketLeft",
  Minus = "Minus",
  Period = "Period",
  Quote = "Quote",
  BracketRight = "BracketRight",
  Semicolon = "Semicolon",
  Slash = "Slash",

  Numpad0 = "Numpad0",
  Numpad1 = "Numpad1",
  Numpad2 = "Numpad2",
  Numpad3 = "Numpad3",
  Numpad4 = "Numpad4",
  Numpad5 = "Numpad5",
  Numpad6 = "Numpad6",
  Numpad7 = "Numpad7",
  Numpad8 = "Numpad8",
  Numpad9 = "Numpad9",

  NumLock = "NumLock",
  NumpadEqual = "NumpadEqual",
  NumpadDivide = "NumpadDivide",
  NumpadMultiply = "NumpadMultiply",
  NumpadSubtract = "NumpadSubtract",
  NumpadAdd = "NumpadAdd",
  NumpadEnter = "NumpadEnter",
  NumpadDecimal = "NumpadDecimal",
}

export type KeyMap = Map<string, KeyCode | KeyCode[]>;

export type Mod = 'ctl' | 'alt' | 'meta' | 'shift' | 'fn' | 'mod';

const ctl = [KeyCode.ControlLeft, KeyCode.ControlRight];
const alt = [KeyCode.AltLeft, KeyCode.AltRight];
const meta = [KeyCode.MetaLeft, KeyCode.MetaRight];
const shift = [KeyCode.ShiftLeft, KeyCode.ShiftRight];

export const defaultKeymap: KeyMap = new Map([
  ['ctrl', ctl],
  ['alt', alt],
  ['meta', meta],
  ['shift', shift],
  ['fn', [KeyCode.Function]],
  ['mod', [...ctl, ...alt]],

  ['up', [KeyCode.ArrowUp]],
  ['down', [KeyCode.ArrowDown]],
  ['left', [KeyCode.ArrowLeft]],
  ['right', [KeyCode.ArrowRight]],

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
