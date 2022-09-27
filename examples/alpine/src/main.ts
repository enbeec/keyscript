import './style.css'
import { Keyscript } from '../../../src';
import { map, Subscription } from 'rxjs';

const ks = new Keyscript();

const bindings = await ks.compile(`up chord (e)
left chord (s)
down chord (d)
right chord (f)
`);

/* const subs = */ bindings.mapEntries(([name, binding$]) => {
  return [name, binding$.pipe(map(() => name)).subscribe(console.debug)] as [string, Subscription];
});
