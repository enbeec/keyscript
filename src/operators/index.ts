import {
  Observable,
  BehaviorSubject,
  map,
} from 'rxjs';
import { Map, List } from 'immutable';

import { KeyCode } from '../keycodes';
type KeyCodes = KeyCode[];

import { chord } from './chord';
import { seq } from './seq';

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

const defaultOperators = Map<string, KeyOperator>([
  ['chord', chord],
  ['seq', seq],
]);

