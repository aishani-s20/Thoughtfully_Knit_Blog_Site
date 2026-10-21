import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, BookOpen, Bot, User, CornerDownLeft } from 'lucide-react';
import { useExperience } from '../context/ExperienceContext.tsx';
import { ChatMessage } from '../types/index.ts';

export const ArchiveChatDrawer: React.FC = () => {
  const { isChatOpen, setIsChatOpen, activePoemSlug, poems } = useExperience();

  const activePoem = poems.find((p) => p.slug === activePoemSlug) || poems[0];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'archive',
      text: `Greetings. I am the Literary Archivist of Thoughtfully Knit. I hold both the published verse and the author's private notes in memory. How may I illuminate the archive for you today?`,
      timestamp: 'Now',
    },
  ]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (!isChatOpen) return null;

  const sampleQuestions = [
    `What is the hidden backstory in the Author Notes?`,
    `Explain the emotional contrast between the stanzas`,
    `How does the weather adaptation alter this poem?`,
    `What does the title "${activePoem?.title}" signify?`,
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isStreaming) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: 'Now',
    };

    const botMsgId = `bot_${Date.now()}`;
    const botMsgPlaceholder: ChatMessage = {
      id: botMsgId,
      sender: 'archive',
      text: '',
      timestamp: 'Typing...',
    };

    setMessages((prev) => [...prev, userMsg, botMsgPlaceholder]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          activePoem: activePoem
            ? {
                title: activePoem.title,
                subtitle: activePoem.subtitle,
                authorNotes: activePoem.authorNotes,
                stanzas: activePoem.stanzas.map((s) => ({ index: s.index, baseText: s.baseText })),
              }
            : null,
          poemsContext: poems.map((p) => ({
            title: p.title,
            tags: p.tags,
            authorNotes: p.authorNotes,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No readable stream available in response.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.text) {
                accumulatedText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, text: accumulatedText, timestamp: 'Archivist' } : m))
                );
              } else if (parsed.error) {
                accumulatedText += `\n[Note: ${parsed.error}]`;
                setMessages((prev) =>
                  prev.map((m) => (m.id === botMsgId ? { ...m, text: accumulatedText } : m))
                );
              }
            } catch {
              /* ignore partial lines */
            }
          }
        }
      }
    } catch (err: unknown) {
      console.warn('Chat stream failure:', err);
      const errMsg = err instanceof Error ? err.message : 'Connection interrupted.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botMsgId
            ? {
                ...m,
                text: `The Archivist notes an interruption in retrieval: ${errMsg}. Please ensure your network connection and server keys are active.`,
              }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-110 bg-[#fbf9f5] dark:bg-[#181615] border-l border-[#e5e0d8] dark:border-[#2f2b28] shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 px-6 border-b border-[#e5e0d8] dark:border-[#2f2b28] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-editorial text-lg font-bold text-stone-900 dark:text-stone-100">
              Ask the Archive
            </h3>
            <p className="font-sans-ui text-xs text-stone-500 dark:text-stone-400">
              {activePoem ? `Grounded in "${activePoem.title}"` : 'Exploring Full Archive'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsChatOpen(false)}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          aria-label="Close drawer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 text-xs leading-relaxed ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'archive' && (
              <div className="w-7 h-7 rounded-full bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.sender === 'user'
                  ? 'bg-stone-900 text-stone-100 dark:bg-stone-100 dark:text-stone-900 rounded-br-xs'
                  : 'bg-white dark:bg-[#201d1a] border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 rounded-bl-xs shadow-xs'
              }`}
            >
              <div className="font-editorial text-sm whitespace-pre-wrap leading-relaxed">
                {msg.text || (isStreaming ? 'Reflecting across the archive...' : '')}
              </div>
            </div>

            {msg.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-stone-900 dark:bg-stone-100 flex items-center justify-center text-stone-100 dark:text-stone-900 shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Inquiries */}
      <div className="px-6 py-2 border-t border-stone-200/70 dark:border-stone-800/60 bg-stone-50/50 dark:bg-[#141312]">
        <span className="text-[10px] uppercase font-semibold text-stone-400 tracking-wider block mb-1.5">
          Suggested Inquiries
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sampleQuestions.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isStreaming}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700/60 text-stone-600 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white hover:border-stone-300 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="p-4 px-6 border-t border-[#e5e0d8] dark:border-[#2f2b28] bg-[#fbf9f5] dark:bg-[#181615]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask of stanza imagery, author notes, or metaphor..."
            disabled={isStreaming}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#201d1a] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:border-purple-600"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="p-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 disabled:opacity-40 hover:opacity-90 transition-opacity"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
