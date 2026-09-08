import { useCallback, useEffect, useState } from 'react';
import { docxExtras, docxToHtml, isZip, rtfToHtml } from '@/lib/docx-reader';
import type { DocxExtras } from '@/lib/docx-reader';

const SUPPORTED = /\.(docx?|html?|txt|rtf|md)$/i;

export interface IncomingFile {
  name: string;
  html: string;
  /** Колонтитулы и параметры листа, если файл их содержит */
  extras?: DocxExtras;
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

/** Читает байты в текст, подбирая кодировку: UTF-8 или Windows-1251 */
const decodeText = (bytes: Uint8Array): string => {
  if (bytes[0] === 0xff && bytes[1] === 0xfe)
    return new TextDecoder('utf-16le').decode(bytes);
  if (bytes[0] === 0xfe && bytes[1] === 0xff)
    return new TextDecoder('utf-16be').decode(bytes);

  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  if (!utf8.includes('\uFFFD')) return utf8;

  try {
    return new TextDecoder('windows-1251').decode(bytes);
  } catch {
    return utf8;
  }
};

/**
 * Превращает содержимое любого поддерживаемого файла в разметку документа.
 * Главное: .docx — это архив, читать его как текст нельзя.
 */
export const fileToHtml = (bytes: Uint8Array): string => {
  if (isZip(bytes)) {
    const html = docxToHtml(bytes);
    if (html) return html;
    throw new Error(
      'Файл повреждён или это не документ Word. Откройте его в исходной программе и сохраните заново.',
    );
  }

  /* .doc старого двоичного формата — читаемого текста в нём нет */
  if (
    bytes[0] === 0xd0 &&
    bytes[1] === 0xcf &&
    bytes[2] === 0x11 &&
    bytes[3] === 0xe0
  ) {
    throw new Error(
      'Это документ Word старого формата (.doc). Откройте его в Word и сохраните как .docx.',
    );
  }

  const text = decodeText(bytes);
  if (/^\s*\{\\rtf/i.test(text)) return rtfToHtml(text);

  return extractBody(text);
};

/** Приводит содержимое из десктопной оболочки к байтам */
const toBytes = (content: string | number[]): Uint8Array => {
  if (Array.isArray(content)) return new Uint8Array(content);

  try {
    const bin = atob(content);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
    return out;
  } catch {
    return new TextEncoder().encode(content);
  }
};

/**
 * Открытие документов: файл, переданный при запуске программы
 * (двойной клик в Проводнике), и выбор файла вручную.
 */
export const useFileOpen = (
  onOpen: (file: IncomingFile) => void,
  onError?: (message: string) => void,
) => {
  const [dragging, setDragging] = useState(false);

  const handleBytes = useCallback(
    (name: string, bytes: Uint8Array) => {
      try {
        /* у файлов Word дополнительно читаем колонтитулы и вид страницы */
        onOpen({
          name,
          html: fileToHtml(bytes),
          extras: isZip(bytes) ? (docxExtras(bytes) ?? undefined) : undefined,
        });
      } catch (e) {
        onError?.(e instanceof Error ? e.message : 'Не удалось открыть файл');
      }
    },
    [onOpen, onError],
  );

  useEffect(() => {
    /* десктопная оболочка кладёт сюда файл, с которого запустили программу */
    const startup = (
      window as unknown as {
        pvsStartupFile?: { name: string; data?: string; content?: string };
      }
    ).pvsStartupFile;

    const payload = startup?.data ?? startup?.content;
    if (startup && payload) {
      handleBytes(startup.name, toBytes(payload));
    }

    const onMessage = (e: MessageEvent) => {
      const d = e.data as {
        type?: string;
        name?: string;
        data?: string;
        content?: string;
      };
      const body = d?.data ?? d?.content;
      if (d?.type === 'pvs-open-file' && body) {
        handleBytes(d.name ?? 'Документ', toBytes(body));
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [handleBytes]);

  /** Кнопка «Открыть»: выбор файла на диске */
  const pickFile = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.doc,.docx,.html,.htm,.txt,.rtf,.md';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () =>
        handleBytes(file.name, new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => onError?.('Не удалось прочитать файл');
      reader.readAsArrayBuffer(file);
    };
    input.click();
  }, [handleBytes, onError]);

  /** Читает выбранный файл и передаёт его в редактор */
  const openFile = useCallback(
    (file: File) => {
      if (!SUPPORTED.test(file.name)) {
        onError?.(
          'Такой формат не поддерживается. Подойдут .docx, .rtf, .txt или .html',
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = () =>
        handleBytes(file.name, new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => onError?.('Не удалось прочитать файл');
      reader.readAsArrayBuffer(file);
    },
    [handleBytes, onError],
  );

  /* перетаскивание файла в окно программы */
  useEffect(() => {
    let depth = 0;

    const hasFiles = (e: DragEvent) =>
      Array.from(e.dataTransfer?.types ?? []).includes('Files');

    const onEnter = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth += 1;
      setDragging(true);
    };

    const onOver = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
    };

    const onLeave = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth = Math.max(0, depth - 1);
      if (!depth) setDragging(false);
    };

    const onDrop = (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth = 0;
      setDragging(false);

      const file = e.dataTransfer?.files?.[0];
      if (file) openFile(file);
    };

    window.addEventListener('dragenter', onEnter);
    window.addEventListener('dragover', onOver);
    window.addEventListener('dragleave', onLeave);
    window.addEventListener('drop', onDrop);

    return () => {
      window.removeEventListener('dragenter', onEnter);
      window.removeEventListener('dragover', onOver);
      window.removeEventListener('dragleave', onLeave);
      window.removeEventListener('drop', onDrop);
    };
  }, [openFile]);

  return { pickFile, dragging };
};