import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react';
import {
  createReactHost,
  defineReactComponentPackage,
  type LocalComponentContext,
} from 'reactive-md/react';
import componentCssText from './component.css?raw';
import { cattca } from './manifests';
import {
  CATTCA_LIMITS,
  chooseCattca,
  compileCattca,
  startCattca,
  submitCattcaText,
  type CattcaState,
} from './cattca-engine';

/** Component CSS as text; the build inlines it for the SSR harness. */
export const componentCss = componentCssText;

function readScript(context: LocalComponentContext): string {
  const items = context.children.items();
  const preferred = items.find((item) => item.kind === 'code' && item.format === 'cattca');
  const code = preferred ?? items.find((item) => item.kind === 'code');
  if (code && code.text.trim()) return code.text;
  return context.children.text();
}

function clampHeight(context: LocalComponentContext): number {
  const raw = context.props.height;
  const value = typeof raw === 'number' && Number.isFinite(raw) ? raw : 420;
  return Math.max(200, Math.min(900, Math.round(value)));
}

function readLabel(context: LocalComponentContext): string {
  const raw = context.props.label;
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  return context.locale.t('Interactive story', '互动小说');
}

function statusText(context: LocalComponentContext, state: CattcaState): string {
  const t = context.locale.t;
  if (state.error) return t('Error', '出错');
  if (state.pending?.kind === 'choice') return t('Choose an option', '请选择');
  if (state.pending?.kind === 'text') return t('Waiting for input', '等待输入');
  if (state.finished) return t('Finished', '已结束');
  return t('Ready', '进行中');
}

export function CattcaView(context: LocalComponentContext) {
  const source = readScript(context);
  const program = useMemo(() => compileCattca(source), [source]);
  const initialState = useMemo(() => startCattca(program), [program]);
  const [state, setState] = useState<CattcaState>(initialState);
  const [draft, setDraft] = useState('');
  const inputId = useId();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const programRef = useRef(program);
  const resetRef = useRef(context.resetToken);
  const previousOutputRef = useRef(state.output.length);

  useEffect(() => {
    if (programRef.current === program) return;
    programRef.current = program;
    setState(startCattca(program));
    setDraft('');
  }, [program]);

  useEffect(() => {
    if (resetRef.current === context.resetToken) return;
    resetRef.current = context.resetToken;
    setState(startCattca(program));
    setDraft('');
  }, [context.resetToken, program]);

  useEffect(() => {
    const element = transcriptRef.current;
    if (element && state.output.length > previousOutputRef.current) {
      element.scrollTop = element.scrollHeight;
    }
    previousOutputRef.current = state.output.length;
  }, [state.output.length]);

  const label = readLabel(context);
  const height = clampHeight(context);
  const debug = context.props.debug === true;
  const locked = context.disabled || !context.visible;
  const style = { '--rmd-cattca-height': `${height}px` } as CSSProperties;
  const phase = state.error
    ? 'error'
    : state.pending?.kind === 'choice'
      ? 'choice'
      : state.pending?.kind === 'text'
        ? 'input'
        : state.finished
          ? 'finished'
          : 'ready';

  const choose = (index: number): void => {
    if (context.mode === 'static' || locked) return;
    setState((previous) => chooseCattca(program, previous, index));
  };

  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (context.mode === 'static' || locked) return;
    setState((previous) => submitCattcaText(program, previous, draft));
    setDraft('');
  };

  const restart = (): void => {
    if (context.mode === 'static' || locked) return;
    context.runtime.reset(context.content);
    setState(startCattca(program));
    setDraft('');
  };

  if (!source.trim()) {
    return (
      <section className="rmd-cattca" data-cattca data-cattca-state="missing" style={style}>
        <header className="rmd-cattca-head">
          <div className="rmd-cattca-heading">
            <span className="rmd-cattca-title">{label}</span>
            <span className="rmd-cattca-status">{context.locale.t('Missing script', '缺少剧本')}</span>
          </div>
        </header>
        <p className="rmd-cattca-error" role="alert">
          {context.locale.t(
            'Add a fenced code block tagged cattca inside this component.',
            '请在组件内添加一个标记为 cattca 的代码围栏来编写剧本。',
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="rmd-cattca" data-cattca data-cattca-state={phase} style={style}>
      <header className="rmd-cattca-head">
        <div className="rmd-cattca-heading">
          <span className="rmd-cattca-title">{label}</span>
          <span className="rmd-cattca-status">{statusText(context, state)}</span>
        </div>
        <button
          type="button"
          className="rmd-cattca-action"
          data-cattca-restart
          disabled={locked}
          onClick={restart}
        >
          {context.locale.t('Restart', '重新开始')}
        </button>
      </header>

      <div
        className="rmd-cattca-transcript"
        ref={transcriptRef}
        role="log"
        aria-live="polite"
        aria-label={context.locale.t('Story transcript', '故事正文')}
        tabIndex={0}
      >
        {state.output.map((entry) => (
          <div className="rmd-cattca-line" data-cattca-line={entry.kind} key={entry.id}>
            {entry.text}
          </div>
        ))}
        {state.error ? <p className="rmd-cattca-error" role="alert">{state.error}</p> : null}
      </div>

      {state.pending?.kind === 'choice' ? (
        <div
          className="rmd-cattca-choices"
          role="group"
          aria-label={context.locale.t('Choices', '选择')}
        >
          {state.pending.options.map((option) => (
            <button
              type="button"
              className="rmd-cattca-choice"
              data-cattca-choice={option.index}
              disabled={locked}
              key={option.index}
              onClick={() => choose(option.index)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}

      {state.pending?.kind === 'text' ? (
        <form className="rmd-cattca-form" onSubmit={submit}>
          <label className="rmd-cattca-label" htmlFor={inputId}>
            {context.locale.t('Enter a value for', '请输入')}{' '}
            <code>{state.pending.variable}</code>
          </label>
          <div className="rmd-cattca-input-row">
            <input
              id={inputId}
              className="rmd-cattca-input"
              data-cattca-input
              value={draft}
              disabled={locked}
              maxLength={CATTCA_LIMITS.inputLength}
              autoComplete="off"
              onChange={(event) => setDraft(event.target.value)}
            />
            <button type="submit" className="rmd-cattca-submit" disabled={locked}>
              {context.locale.t('Continue', '继续')}
            </button>
          </div>
        </form>
      ) : null}

      {state.finished && !state.error ? (
        <p className="rmd-cattca-end">{context.locale.t('The end.', '故事结束。')}</p>
      ) : null}

      {debug ? (
        <details className="rmd-cattca-debug">
          <summary>{context.locale.t('Interpreter state', '解释器状态')}</summary>
          {Object.keys(state.variables).length > 0 ? (
            <dl>
              {Object.entries(state.variables).map(([name, value]) => (
                <div key={name}>
                  <dt>{name}</dt>
                  <dd>{String(value)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p>{context.locale.t('No variables.', '暂无变量。')}</p>
          )}
          {state.logs.length > 0 ? (
            <ol>
              {state.logs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ol>
          ) : (
            <p>{context.locale.t('No logs.', '暂无日志。')}</p>
          )}
        </details>
      ) : null}
    </section>
  );
}

export const cattcaPackage = defineReactComponentPackage({
  ...cattca,
  css: componentCssText,
  render: CattcaView,
});

const cattcaHost = createReactHost({ packages: [cattcaPackage] });

export const cattcaImplementation = cattcaPackage.components[0];
export const config = cattcaHost.config;
export const reactConfig = cattcaHost.reactConfig;
