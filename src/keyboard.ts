import {
  Observable,
  BehaviorSubject,
  map,
  share,
  merge,
  filter,
  fromEvent,
  combineLatest,
  distinctUntilChanged,
  tap,
  bufferWhen,
  Subject,
} from 'rxjs';
import { Map, List } from 'immutable';
import { KeyCode, KeyCodes as KeyCodesLvl } from './keycodes';

type KeyCodes = KeyCodesLvl<2>;

export type KeyOperator = (keys: KeyCodes) => Observable<KeyboardEvent[]>;

export type KeyOperators = typeof KeyOperators;

/**
  * A pseudo-class wrapping a: 
  *
  * `BehaviorSubject<Immutable.Map<string, KeyOperators>>`
  * 
  * Exposes an `Observable<List<string>>` as a parser dependency.
  */
export function KeyOperators() {
  const matchers$: BehaviorSubject<
    Map<string, KeyOperator>
  > = new BehaviorSubject(defaultOperators);

  return {
    get(name: string) {
      return matchers$.getValue().get(name);
    },

    matcherNames$: matchers$.asObservable().pipe(
      map(m => List(m.keys()))
    ),
  }
}

function shareKeyboardEvents(...sources: Observable<KeyboardEvent>[]) {
  return merge(...sources).pipe(
    distinctUntilChanged(
      (a, b) => a.code === b.code && a.type === b.type
    ),
    share(),
  );
}

const keyEvents$ = shareKeyboardEvents(
  fromEvent<KeyboardEvent>(document, 'keyup'),
  fromEvent<KeyboardEvent>(document, 'keydown'),
);

function newKeyStream(key: KeyCode) {
  return keyEvents$.pipe(
    filter(event => event.code === key.valueOf()),
  );
}

const defaultOperators = Map<string, KeyOperator>([
  ['chord', chord],
  ['seq', seq],
]);

function flatStream(keys: KeyCodes) {
  if (!Array.isArray(keys)) keys = [keys];

  return keys.map((s: KeyCode | KeyCode[]) => {
    if (Array.isArray(s)) return merge(
      ...s.map((_s: KeyCode) => newKeyStream(_s))
    );
    else return newKeyStream(s);
  });
}

/** An observable that only emits when all keys are pressed. */
function chord(keys: KeyCodes) {
  return combineLatest(flatStream(keys)).pipe(
    filter<KeyboardEvent[]>(
      (events) => events.every((e) => e.type === 'keydown')
    ),
  );
}

/** An observable that only emits when all keys are pressed **in order**. */
function seq(keys: KeyCodes) {

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
