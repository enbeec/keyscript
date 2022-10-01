import { filter, map, scan } from "rxjs";

import { keyEvents$ } from "./common";
import { KeyCode } from '../keycodes';

/** An observable that only emits when all keys are pressed **in order**. */
export function seq(keys: KeyCode[], t: number = 0) {
  interface SeqState {
    events: KeyboardEvent[];
    success: boolean;
    timeout: ReturnType<typeof setTimeout>;
  }

  const scanSeq = (s: SeqState, event: KeyboardEvent) => {
    if (s.success) {
      // reset on success
      s.success = false;
      s.events = [];
    }

    if (
      event.code !== keys[s.events.length].valueOf()[0]
    ) {
      // no match -- reset if not already empty
      if (s.events.length) {
        s.events = [];
        s.success = false;
      }
    } else {
      // otherwise, add the matched event 
      s.events.push(event);

      if (t > 0) {
        clearTimeout(s.timeout);
        s.timeout = setTimeout(() => {
          s.events = []; s.success = false;
        }, t);
      }

      // if we have the same number of events as keys....
      if (keys.length === s.events.length) {
        clearTimeout(s.timeout);
        s.success = true;
      }
    }

    // always return the state
    return s;
  }

  return keyEvents$.pipe(
    filter(e => e.type === 'keydown'),
    // use our reducer
    scan(scanSeq, {
      events: [],
      success: false,
    }),
    // only emit on success
    filter(s => s.success),
    // map back to the array of events
    map((s) => [...s.events]),
  );
}
