import { readFile } from 'node:fs/promises';

const coverage = JSON.parse(await readFile('coverage/coverage-final.json', 'utf8'));
const percent = values => values.length ? values.filter(value => value > 0).length / values.length * 100 : 100;
const summary = Object.fromEntries(Object.entries(coverage).map(([file, data]) => [file, {
  statements: percent(Object.values(data.s)),
  branches: percent(Object.values(data.b).flat()),
  functions: percent(Object.values(data.f)),
  lines: percent(Object.values(data.statementMap).map((_, i) => data.s[i])),
}]));
const gaps = Object.entries(summary).filter(([, metrics]) => Object.values(metrics).some(value => value !== 100));

for (const [file, metrics] of gaps) {
  console.log(`${file}: ${metrics.statements} statements, ${metrics.branches} branches, ${metrics.functions} functions, ${metrics.lines} lines`);
}
process.exitCode = gaps.length ? 1 : 0;
