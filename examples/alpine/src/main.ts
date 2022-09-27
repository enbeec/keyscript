import './style.css'
import { Keyscript } from '../../../dist';
import { Subscription } from 'rxjs';

const ks = new Keyscript();

const bindings = await ks.compile(`
up chord (up)
down chord (down)
left chord (left)
right chord (right)
`);

/* const subs = */ bindings.mapEntries(([name, binding$]) => {
  return [name, binding$.subscribe()] as [string, Subscription];
});
