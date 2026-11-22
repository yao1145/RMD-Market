import test from 'node:test';
import assert from 'node:assert/strict';
import {
  chooseCattca,
  compileCattca,
  evaluateCattcaExpression,
  startCattca,
  submitCattcaText,
} from '../dist/node/entry.mjs';
import { source as sampleDocument } from '../dist/node/entry.mjs';

function outputTexts(state) {
  return state.output.map((entry) => entry.text);
}

test('text and apply output are appended in order', () => {
  const program = compileCattca('你好</apply 1 + 2/>');
  assert.equal(program.error, null);
  const state = startCattca(program);
  assert.deepEqual(outputTexts(state), ['你好', '3']);
  assert.equal(state.finished, true);
});

test('let, set and variables evaluate with numeric semantics', () => {
  const state = startCattca(compileCattca('</let a = 1; set a = a + 2; apply a/>'));
  assert.deepEqual(outputTexts(state), ['3']);
});

test('label, goto and if implement a counted loop', () => {
  const state = startCattca(compileCattca(
    '</let n = 0; label loop; set n = n + 1; if n > 2 -> goto done; apply n; goto loop; label done; apply "done";/>',
  ));
  assert.deepEqual(outputTexts(state), ['1', '2', 'done']);
  assert.equal(state.error, null);
});

test('input case pauses, records the choice and follows its command', () => {
  const source = '开始'
    + '</input case 选择: \'A\' -> goto a: \'B\' -> goto b;/>'
    + '</label a/>A 结局</exit/>'
    + '</label b/>B 结局</exit/>';
  const program = compileCattca(source);
  const started = startCattca(program);
  assert.equal(started.pending?.kind, 'choice');
  assert.deepEqual(started.pending.options.map((option) => option.label), ['A', 'B']);
  const chosen = chooseCattca(program, started, 0);
  assert.equal(chosen.variables['选择'], 'A');
  assert.match(outputTexts(chosen).join('\n'), /A 结局/);
  assert.equal(chosen.finished, true);
});

test('input text pauses and resumes with the submitted value', () => {
  const program = compileCattca('</let name; input text name;/>你好，</apply name;/>');
  const started = startCattca(program);
  assert.equal(started.pending?.kind, 'text');
  assert.equal(started.pending.variable, 'name');
  const resumed = submitCattcaText(program, started, '小明');
  assert.deepEqual(outputTexts(resumed), ['你好，', '小明']);
  assert.equal(resumed.variables.name, '小明');
});

test('expressions support arithmetic, strings, ternaries and whitelisted Math', () => {
  assert.equal(evaluateCattcaExpression('1 + 2 * 3'), 7);
  assert.equal(evaluateCattcaExpression('"a" + 1'), 'a1');
  assert.equal(evaluateCattcaExpression('true ? 1 : 2'), 1);
  assert.equal(evaluateCattcaExpression('1 < 2 && "x"'), 'x');
  assert.equal(evaluateCattcaExpression('Math.max(3, 7)'), 7);
  assert.equal(evaluateCattcaExpression('Math.PI > 3'), true);
  assert.throws(() => evaluateCattcaExpression('Math.random()'), /不支持/);
  assert.throws(() => evaluateCattcaExpression('window'), /未声明变量/);
});

test('unresolved apply expressions fall back to their source text', () => {
  const state = startCattca(compileCattca('</apply 你好世界/>'));
  assert.deepEqual(outputTexts(state), ['你好世界']);
});

test('an unresolved condition is false and is logged', () => {
  const state = startCattca(compileCattca('</if missing > 1 -> apply "bad"; apply "ok";/>'));
  assert.deepEqual(outputTexts(state), ['ok']);
  assert.ok(state.logs.some((line) => line.includes('无法计算条件')));
});

test('runaway gotos stop at the step budget', () => {
  const state = startCattca(compileCattca('</label loop; goto loop;/>'));
  assert.match(state.error ?? '', /步数/);
  assert.equal(state.finished, true);
});

test('an unclosed command block reports a parse error', () => {
  const program = compileCattca('你好</let a = 1;');
  assert.match(program.error ?? '', /结束定界符/);
  const state = startCattca(program);
  assert.match(state.error ?? '', /结束定界符/);
  assert.equal(state.finished, true);
});

test('the shipped sample loops, branches and reaches every ending class', () => {
  const match = /```cattca\n([\s\S]*?)\n```/.exec(sampleDocument);
  assert.ok(match, 'sample document must contain a cattca code block');
  const program = compileCattca(match[1]);
  assert.equal(program.error, null);

  let stayed = startCattca(program);
  assert.equal(stayed.pending?.kind, 'choice');
  for (let index = 0; index < 3; index += 1) {
    stayed = chooseCattca(program, stayed, 0);
  }
  assert.equal(stayed.finished, true);
  assert.match(outputTexts(stayed).join('\n'), /睡过了头/);

  let woke = startCattca(program);
  woke = chooseCattca(program, woke, 1);
  assert.match(outputTexts(woke).join('\n'), /又是阳光明媚的一天/);
  assert.match(outputTexts(woke).join('\n'), /你选择了：起床/);
  assert.equal(woke.pending?.kind, 'choice');
  assert.equal(woke.pending.options.length, 3);
  woke = chooseCattca(program, woke, 0);
  assert.equal(woke.pending?.kind, 'choice');
  assert.equal(woke.pending.options.length, 2);
  woke = chooseCattca(program, woke, 0);
  assert.equal(woke.finished, true);
  assert.match(outputTexts(woke).join('\n'), /决定把它好好用掉/);
});
