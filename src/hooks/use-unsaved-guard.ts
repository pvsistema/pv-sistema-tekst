import { useCallback, useEffect, useRef, useState } from 'react';

/** Что программа должна сделать после ответа на вопрос о сохранении */
export type PendingAction = 'close' | 'new' | 'open' | 'switch' | null;

interface Options {
  /** Текущее содержимое документа */
  getHtml: () => string;
  /** Ключ документа: при смене документа отсчёт начинается заново */
  docId: string | null;
}

/** Команда окну программы: закрыть, свернуть или развернуть */
export const windowCommand = (type: 'close' | 'minimize' | 'maximize') => {
  const host = (
    window as unknown as {
      chrome?: { webview?: { postMessage: (m: unknown) => void } };
    }
  ).chrome?.webview;

  if (host) {
    host.postMessage({ type: `pvs-${type}` });
    return;
  }

  if (type === 'close') window.close();
};

const closeWindow = () => windowCommand('close');

/**
 * Следит за несохранёнными правками и не даёт закрыть документ,
 * не спросив пользователя.
 */
export const useUnsavedGuard = ({ getHtml, docId }: Options) => {
  /* содержимое на момент последнего сохранения */
  const savedHtml = useRef<string | null>(null);
  const [dirty, setDirty] = useState(false);

  /* что сделать, если пользователь подтвердит уход */
  const [pending, setPending] = useState<PendingAction>(null);
  const afterConfirm = useRef<(() => void) | null>(null);

  /** Запоминает текущее состояние как сохранённое */
  const markSaved = useCallback(() => {
    savedHtml.current = getHtml();
    setDirty(false);
  }, [getHtml]);

  /* при переходе к другому документу считаем его сохранённым */
  useEffect(() => {
    savedHtml.current = null;
    setDirty(false);
  }, [docId]);

  /** Сверяет текущее содержимое с сохранённым */
  const check = useCallback(() => {
    const html = getHtml();
    if (savedHtml.current === null) {
      savedHtml.current = html;
      return;
    }
    setDirty(html !== savedHtml.current);
  }, [getHtml]);

  /**
   * Выполняет действие. Если есть несохранённые правки —
   * сначала задаёт вопрос.
   */
  const guard = useCallback(
    (action: PendingAction, run: () => void) => {
      if (!dirty) {
        run();
        return;
      }
      afterConfirm.current = run;
      setPending(action);
    },
    [dirty],
  );

  /** Пользователь отказался от сохранения — продолжаем без него */
  const discard = useCallback(() => {
    setPending(null);
    setDirty(false);
    savedHtml.current = getHtml();

    const run = afterConfirm.current;
    afterConfirm.current = null;

    if (run) run();
    else closeWindow();
  }, [getHtml]);

  /** Пользователь согласился сохранить */
  const confirmSave = useCallback(
    (save: () => void) => {
      save();
      setPending(null);
      setDirty(false);
      savedHtml.current = getHtml();

      const run = afterConfirm.current;
      afterConfirm.current = null;

      if (run) run();
      else closeWindow();
    },
    [getHtml],
  );

  /** Пользователь передумал уходить */
  const cancel = useCallback(() => {
    setPending(null);
    afterConfirm.current = null;
  }, []);

  /** Закрытие окна: своя кнопка и запрос от оболочки */
  const requestClose = useCallback(() => {
    if (dirty) {
      afterConfirm.current = null;
      setPending('close');
      return;
    }
    closeWindow();
  }, [dirty]);

  /* оболочка спрашивает разрешение перед закрытием окна */
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if ((e.data as { type?: string })?.type === 'pvs-close-request') {
        requestClose();
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [requestClose]);

  /* предупреждение браузера при закрытии вкладки */
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  return {
    dirty,
    pending,
    check,
    markSaved,
    guard,
    discard,
    confirmSave,
    cancel,
    requestClose,
  };
};
