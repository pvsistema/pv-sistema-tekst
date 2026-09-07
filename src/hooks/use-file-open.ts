import { useCallback, useEffect } from 'react';

export interface IncomingFile {
  name: string;
  html: string;
}

/** Убирает из открытого файла всё, кроме содержимого документа */
export const extractBody = (raw: string): string => {
  const body = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let html = body ? body[1] : raw;

  html = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<link[^>]*>/gi, '')
    .replace(/<meta[^>]*>/gi, '')
    .replace(/\son\w+="[^"]*"/gi, '')
    .trim();

  /* обычный текстовый файл — разбиваем на абзацы */
  if (!/<\w+[\s>]/.test(html)) {
    return html
      .split(/\n{2,}/)
      .map(
        (t) =>
          `<p>${t
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/\n/g, '<br>')}</p>`,
      )
      .join('');
  }

  return html;
};

export const titleFromFileName = (name: string) =>
  name.replace(/\.[^.]+$/, '') || 'Документ';

/**
 * Открытие документов: файл, переданный при запуске программы
 * (двойной клик в Проводнике), и выбор файла вручную.
 */
export const useFileOpen = (onOpen: (file: IncomingFile) => void) => {
  useEffect(() => {
    /* десктопная оболочка кладёт сюда файл, с которого запустили программу */
    const startup = (
      window as unknown as { pvsStartupFile?: { name: string; content: string } }
    ).pvsStartupFile;

    if (startup?.content) {
      onOpen({
        name: startup.name,
        html: extractBody(startup.content),
      });
    }

    const onMessage = (e: MessageEvent) => {
      const data = e.data as { type?: string; name?: string; content?: string };
      if (data?.type === 'pvs-open-file' && data.content) {
        onOpen({
          name: data.name ?? 'Документ',
          html: extractBody(data.content),
        });
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [onOpen]);

  /** Кнопка «Открыть»: выбор файла на диске */
  const pickFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.doc,.docx,.html,.htm,.txt,.rtf';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () =>
        onOpen({
          name: file.name,
          html: extractBody(String(reader.result ?? '')),
        });
      reader.readAsText(file, 'utf-8');
    };
    input.click();
  }, [onOpen]);

  return { pickFile };
};
