import { filter, map, scan } from "rxjs";

import { keyEvents$ } from "./common";
import { KeyCode } from '../keycodes';

/** An observable that only emits when all keys are pressed **in order**. */
export function seq(keys: KeyCode[]) {
  interface SeqState {
    events: KeyboardEvent[];
    index: number;
    success: boolean;
    timeout: ReturnType<typeof setTimeout>;
  }

  const scanSeq = (s: SeqState, event: KeyboardEvent) => {
    if (
      s.success ||
      event.code !== keys[s.index].valueOf()[0]
    ) {
      // if the code is a mismatch
      // or if success (already emitted at this point)
      // then reset
      s.events = [];
      s.index = 0;
      s.success = false;
    } else {
      // otherwise, add the matched event 
      s.events.push(event);
      // and increment the index
      s.index++;

      // if we have the same number of events as keys....
      if (keys.length === s.events.length) {
        s.success = true;
      }
    }

    // always return the state
    return s
  }

  return keyEvents$.pipe(
    filter(e => e.type === 'keydown'),
    // use our reducer
    scan(scanSeq, {
      events: [],
      index: 0,
      success: false,
    }),
    // only emit on success
    filter(s => s.success),
    // map back to the array of events
    map((s) => [...s.events]),
  );
}
