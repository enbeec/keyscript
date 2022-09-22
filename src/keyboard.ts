import { combineLatest, distinctUntilChanged, filter, fromEvent, merge, Observable, share } from 'rxjs';
import { KeyCode } from './keycodes';

function shareKeyboardEvents(source: Observable<KeyboardEvent>) {
  return source.pipe(
    distinctUntilChanged(
      (a, b) => a.code === b.code && a.type === b.type
    ),
    share(),
  )
}

const keyEvents$ = shareKeyboardEvents(merge(
  fromEvent<KeyboardEvent>(document, 'keyup'),
  fromEvent<KeyboardEvent>(document, 'keydown'),
));

function newKeyStream(key: KeyCode) {
  return keyEvents$.pipe(
    filter(event => event.code === key.valueOf()),
  );
}

/** An observable that only emits when all keys are pressed. */
export function chord(keys: KeyCode | KeyCode[] | KeyCode[][]) {
  if (!Array.isArray(keys)) keys = [keys];

  const keyCodeEvents$ = keys.map((s: KeyCode | KeyCode[]) => {
    if (Array.isArray(s)) return merge(
      ...s.map((_s: KeyCode) => newKeyStream(_s))
    );
    else return newKeyStream(s);
  });

  return combineLatest(keyCodeEvents$).pipe(
    filter<KeyboardEvent[]>(
      (events) => events.every((e) => e.type === 'keydown')
    ),
  );
}

/** An observable that only emits when all keys are pressed **in order**. */
export function seq(keys: KeyCode | KeyCode[] | KeyCode[][]) {
  const sequence = (source: Observable<KeyboardEvent[]>): Observable<KeyboardEvent[]> => {
    return source.pipe(
      filter((events) => {
        const sorted = [...events]
          .sort((a, b) => (a.timeStamp < b.timeStamp ? -1 : 1))
          .map((e) => e.code)
          .join();
        return sorted === events.map(a => a.code).join();
      })
    )
  }

  return sequence(chord(keys));
}
