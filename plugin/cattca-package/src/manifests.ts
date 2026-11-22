import { defineLocalComponent } from 'reactive-md/sdk';

/**
 * `<cattca>`: a container that reads a Cattca script from a fenced code block
 * and renders it as an interactive novel. The manifest stays plain JSON data;
 * the React implementation and the safe interpreter live next to it.
 */
export const cattca = defineLocalComponent({
  id: 'example/cattca',
  name: 'cattca',
  version: '1.0.0',
  protocol: 'reactive-md-component/v1',
  form: 'container',
  props: {
    label: { kind: 'string', default: '互动小说' },
    height: {
      kind: 'number',
      dynamic: true,
      default: 420,
      integer: true,
      min: 200,
      max: 900,
      description: {
        en: 'Maximum transcript height in pixels.',
        zh: '正文区域的最高高度（像素）。',
      },
    },
    debug: {
      kind: 'boolean',
      dynamic: true,
      default: false,
      description: {
        en: 'Show variables and interpreter logs below the story.',
        zh: '在故事下方显示变量与解释器日志。',
      },
    },
    disabled: {
      kind: 'boolean',
      dynamic: true,
      default: false,
    },
  },
  structure: { rule: 'content', label: 'none', noComponents: true },
  capabilities: { interactive: true, static: true, ssr: true, offline: true },
  authoring: {
    title: { en: 'Cattca story', zh: 'Cattca 互动小说' },
    description: {
      en: 'Play an interactive story written in Cattca command syntax inside a fenced cattca code block.',
      zh: '在 cattca 代码围栏中编写 Cattca 命令，直接播放互动小说。',
    },
    category: 'interactive',
    insertText: '<cattca label="互动小说">\n```cattca\n你站在一扇门前。\n</let 尝试次数 = 0; label 门口;/>\n你要怎么做？\n</input case:\n  \'推门\' -> goto 推门:\n  \'离开\' -> goto 离开;\n/>\n</label 推门; set 尝试次数 = 尝试次数 + 1;\nif 尝试次数 > 2 -> goto 放弃/>\n门纹丝不动。\n</goto 门口;/>\n</label 放弃/>\n你放弃了，转身离开。\n</exit/>\n</label 离开/>\n你离开了。\n</exit/>\n```\n</cattca>',
  },
  styles: ['example/cattca.css'],
});
