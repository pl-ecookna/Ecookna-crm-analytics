
import React from 'react';
import { Headphones, User } from 'lucide-react';

interface TranscriptLine {
  timestamp: string;
  role: 'Оператор' | 'Клиент';
  text: string;
  speakerName?: string;
}

interface TranscriptDisplayProps {
  transcript: string | null;
  operatorName?: string;
}

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript, operatorName }) => {
  const displayOperatorName = operatorName || 'Оператор';
  if (!transcript) {
    return <p className="text-muted-foreground">Транскрипция недоступна</p>;
  }

  const parseTranscript = (text: string): TranscriptLine[] => {
    const lines = text.split('\n');
    const parsed: TranscriptLine[] = [];
    let currentEntry: TranscriptLine | null = null;

    for (const line of lines) {
      // Match pattern: "[00:00] Speaker Name:" or "[MM:SS] Speaker:"
      const match = line.match(/^\[(\d{2}:\d{2})\]\s*(.+?):\s*$/);
      
      if (match) {
        // If there's a current entry being built, save it
        if (currentEntry && currentEntry.text.trim()) {
          parsed.push(currentEntry);
        }
        
        // Start a new entry
        const timestamp = match[1];
        const speakerName = match[2].trim();
        const role = speakerName.toLowerCase().includes('клиент') ? 'Клиент' : 'Оператор';
        
        currentEntry = {
          timestamp,
          role,
          text: '',
          speakerName
        };
      } else if (currentEntry && line.trim()) {
        // Add text to current entry
        currentEntry.text += (currentEntry.text ? '\n' : '') + line.trim();
      }
    }
    
    // Don't forget the last entry
    if (currentEntry && currentEntry.text.trim()) {
      parsed.push(currentEntry);
    }

    return parsed;
  };

  const transcriptLines = parseTranscript(transcript);

  if (transcriptLines.length === 0) {
    // Fallback parsing - try to extract any speaker patterns
    const fallbackParse = (text: string) => {
      const lines = text.split('\n').filter(line => line.trim());
      const messages: TranscriptLine[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Try to find speaker patterns like "Оператор:", "Клиент:", or speaker indicators
        const operatorMatch = line.match(/^(оператор|operator|менеджер|manager)[\s:]/i);
        const clientMatch = line.match(/^(клиент|client|абонент|caller|звонящий)[\s:]/i);
        
        if (operatorMatch || clientMatch) {
          const role = operatorMatch ? 'Оператор' : 'Клиент';
          const text = line.replace(/^[^:]*:\s*/, '').trim();
          if (text) {
            messages.push({
              timestamp: (messages.length + 1).toString(),
              role,
              text
            });
          }
        } else if (line.length > 10 && !line.match(/^\d+[\.:]/)) {
          // If it's a longer text without number prefix, treat as continuation or new message
          // Alternate between operator and client for better structure
          const role = messages.length % 2 === 0 ? 'Оператор' : 'Клиент';
          messages.push({
            timestamp: (messages.length + 1).toString(),
            role,
            text: line
          });
        }
      }
      
      return messages;
    };
    
    const fallbackMessages = fallbackParse(transcript);
    
    if (fallbackMessages.length > 0) {
      return (
        <div className="max-h-96 overflow-y-auto space-y-3 p-2">
          {fallbackMessages.map((line, index) => (
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
                    {line.role === 'Оператор' ? displayOperatorName : line.role}
                  </span>
                  <span className="text-xs text-muted-foreground">{line.timestamp}</span>
                </div>
                <p className="text-sm leading-relaxed">{line.text}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // Final fallback - split by sentences and create message structure
    return (
      <div className="max-h-96 overflow-y-auto space-y-3 p-2">
        {transcript.split(/[.!?]+/).filter(sentence => sentence.trim().length > 10).map((sentence, index) => {
          const role = index % 2 === 0 ? 'Оператор' : 'Клиент';
          return (
            <div
              key={index}
              className={`flex gap-3 animate-fade-in ${
                role === 'Клиент' ? 'flex-row-reverse' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                {role === 'Оператор' ? (
                  <Headphones className="w-4 h-4 text-primary" />
                ) : (
                  <User className="w-4 h-4 text-secondary" />
                )}
              </div>
              
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                  role === 'Оператор'
                    ? 'bg-blue-50 border border-blue-200 text-blue-900'
                    : 'bg-green-50 border border-green-200 text-green-900'
                }`}
              >
                 <div className="flex items-center gap-2 mb-1">
                   <span className={`text-xs font-medium ${
                     role === 'Оператор' ? 'text-blue-700' : 'text-green-700'
                   }`}>
                     {role === 'Оператор' ? displayOperatorName : role}
                   </span>
                  <span className="text-xs text-muted-foreground">{index + 1}</span>
                </div>
                <p className="text-sm leading-relaxed">{sentence.trim()}</p>
              </div>
            </div>
          )})}
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
                 {line.role === 'Оператор' ? (line.speakerName || displayOperatorName) : line.role}
               </span>
              <span className="text-xs text-muted-foreground">{line.timestamp}</span>
            </div>
            <p className="text-sm leading-relaxed">{line.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TranscriptDisplay;
