import { defineLocalComponent } from 'reactive-md/sdk';

export const surveyTally = defineLocalComponent({
  id: 'reactive-md-demo/survey-tally',
  name: 'survey-tally',
  version: '1.0.0',
  protocol: 'reactive-md-component/v1',
  form: 'leaf',
  props: { label: { kind: 'string' } },
  capabilities: { interactive: true, static: true, ssr: true, offline: true },
});