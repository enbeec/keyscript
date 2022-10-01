import { combineLatest, filter } from "rxjs";

import { keyStream } from './common';
import { KeyCode } from '../keycodes';
type KeyCodes = KeyCode[];

/** An observable that only emits when all keys are pressed. */
export function chord(keys: KeyCodes) {
  return combineLatest(keys.map(keyStream)).pipe(
    filter<KeyboardEvent[]>(
      (events) => events.every((e) => e.type === 'keydown')
    ),
  );
}
