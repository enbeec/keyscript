import {
  Observable,
  share,
  merge,
  fromEvent,
  filter,
  distinctUntilChanged,
} from 'rxjs';

import { KeyCode } from '../keycodes';

function shareKeyboardEvents(...sources: Observable<KeyboardEvent>[]) {
  return merge(...sources).pipe(
    distinctUntilChanged(
      (a, b) => a.code === b.code && a.type === b.type
    ),
    share(),
  );
}

export const keyEvents$ = shareKeyboardEvents(
  fromEvent<KeyboardEvent>(document, 'keyup'),
  fromEvent<KeyboardEvent>(document, 'keydown'),
);

export function keyStream(key: KeyCode) {
  return keyEvents$.pipe(
    filter(event => event.code === key.valueOf()),
  );
}
