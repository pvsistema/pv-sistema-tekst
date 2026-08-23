import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onReplace: (
    query: string,
    replacement: string,
    all: boolean,
    matchCase: boolean,
  ) => number;
}

const FindReplaceDialog = ({ open, onOpenChange, onReplace }: Props) => {
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const run = (all: boolean) => {
    if (!query.trim()) {
      setResult('Введите текст для поиска');
      return;
    }
    const count = onReplace(query, replacement, all, matchCase);
    setResult(
      count === 0
        ? 'Совпадений не найдено'
        : `Заменено вхождений: ${count}`,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">Поиск и замена</DialogTitle>
          <DialogDescription>
            Замена выполняется по всему тексту документа.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="find">Найти</Label>
            <Input
              id="find"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setResult(null);
              }}
              placeholder="например: приказ"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="replace">Заменить на</Label>
            <Input
              id="replace"
              value={replacement}
              onChange={(e) => setReplacement(e.target.value)}
              placeholder="новый текст"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={matchCase}
              onCheckedChange={(v) => setMatchCase(Boolean(v))}
            />
            Учитывать регистр
          </label>
          {result && (
            <p className="animate-fade-in text-sm text-primary">{result}</p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => run(false)}>
            Заменить одно
          </Button>
          <Button onClick={() => run(true)}>Заменить все</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FindReplaceDialog;
