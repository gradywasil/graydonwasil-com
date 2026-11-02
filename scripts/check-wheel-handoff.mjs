import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/components/ExperimentsSlide.tsx', import.meta.url), 'utf8').replace(/\r\n/g, '\n');
const wheelHandler = source.slice(source.indexOf('const onWheel ='));
const keepsBoundaryMomentum = wheelHandler.includes('if (wheelLocked.current) event.preventDefault();');
const keepsInStackMomentum = wheelHandler.includes('event.preventDefault();\n      if (wheelLocked.current) return;');
const ownsTouchSwipes = source.includes('onPointerDownCapture={ownTouchStart}')
  && source.includes('onPointerUpCapture={ownTouchEnd}')
  && source.includes('go(step);');

if (!keepsBoundaryMomentum || !keepsInStackMomentum || !ownsTouchSwipes) {
  throw new Error('Rapid wheel events can escape the experiment stack to the outer deck.');
}

console.log('Experiment wheel and touch handoffs stay inside the stack until an endpoint.');
