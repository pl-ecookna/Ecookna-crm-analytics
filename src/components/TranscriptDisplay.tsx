
import React from 'react';
import { Headphones, User } from 'lucide-react';

interface TranscriptLine {
  number: string;
  role: 'Оператор' | 'Клиент';
  text: string;
}

interface TranscriptDisplayProps {
  transcript: string | null;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript }) => {
  if (!transcript) {
    return <p className="text-muted-foreground">Транскрипция недоступна</p>;
  }

  const parseTranscript = (text: string): TranscriptLine[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const parsed: TranscriptLine[] = [];

    for (const line of lines) {
      // Match pattern: "1. Оператор: текст" or "2. Клиент: текст"
      // Also handle cases where there might be extra spaces or variations
      const match = line.match(/^(\d+)\.\s*(Оператор|Клиент):\s*(.*)$/);
      if (match) {
        const text = match[3].trim();
        if (text) { // Only add if there's actual text content
          parsed.push({
            number: match[1],
            role: match[2] as 'Оператор' | 'Клиент',
            text: text
          });
        }
      } else if (line.trim() && !line.match(/^\d+\.\s*(Оператор|Клиент):\s*$/)) {
        // If line doesn't match pattern but has content and is not an empty role line, 
        // add to last entry if exists
        if (parsed.length > 0) {
          parsed[parsed.length - 1].text += ' ' + line.trim();
        }
      }
    }

    return parsed;
  };

  const transcriptLines = parseTranscript(transcript);

  if (transcriptLines.length === 0) {
    return (
      <div className="bg-muted/50 p-4 rounded text-sm max-h-96 overflow-y-auto">
        {transcript}
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-3 p-2">
      {transcriptLines.map((line, index) => (
        <div
          key={index}
          className={`flex gap-3 animate-fade-in ${
            line.role === 'Клиент' ? 'flex-row-reverse' : ''
          }`}
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            {line.role === 'Оператор' ? (
              <Headphones className="w-4 h-4 text-primary" />
            ) : (
              <User className="w-4 h-4 text-secondary" />
            )}
          </div>
          
          <div
            className={`max-w-[75%] rounded-2xl px-4 py-3 ${
              line.role === 'Оператор'
                ? 'bg-blue-50 border border-blue-200 text-blue-900'
                : 'bg-green-50 border border-green-200 text-green-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium ${
                line.role === 'Оператор' ? 'text-blue-700' : 'text-green-700'
              }`}>
                {line.role}
              </span>
              <span className="text-xs text-muted-foreground">#{line.number}</span>
            </div>
            <p className="text-sm leading-relaxed">{line.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranscriptDisplay;
