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
  scan,
} from 'rxjs';
import { Map, List } from 'immutable';
import { KeyCode } from './keycodes';

type KeyCodes = KeyCode[];

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

function keyStream(key: KeyCode) {
  return keyEvents$.pipe(
    filter(event => event.code === key.valueOf()),
  );
}

function keysStream(keys: KeyCodes) {
  return keys.map(keyStream);
}

const defaultOperators = Map<string, KeyOperator>([
  ['chord', chord],
  ['seq', seq],
]);

/** An observable that only emits when all keys are pressed. */
function chord(keys: KeyCodes) {
  return combineLatest(keysStream(keys)).pipe(
    filter<KeyboardEvent[]>(
      (events) => events.every((e) => e.type === 'keydown')
    ),
  );
}

/** An observable that only emits when all keys are pressed **in order**. */
function seq(keys: KeyCodes) {
  interface SeqState {
    e: KeyboardEvent[];
    index: number;
    success: boolean;
  }

  const scanSeq = (s: SeqState, event: KeyboardEvent) => {
    if (
      s.success ||
      event.code !== keys[s.index + 1].valueOf()[0]
    ) {
      s.e = [];
      s.index = 0;
      s.success = false;
    } else {
      s.e.push(event);
      s.index++;

      // if all have matched
      if (keys.length === s.index + 1) {
        s.success = true;
      }
    }

    return s
  }

    ;

  return keyEvents$.pipe(
    filter(e => e.type === 'keydown'),
    // use our reducer
    scan(scanSeq, {
      e: [],
      index: 0,
      success: false,
    }),
    // only emit on success
    filter(s => s.success),
    map((s: SeqState) => [...s.e]),
  );
}
