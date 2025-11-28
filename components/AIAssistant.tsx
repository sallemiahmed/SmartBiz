
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User as UserIcon, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useApp } from '../context/AppContext';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const { stats, clients, products, invoices, settings, formatCurrency, t } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting with translation, handling async loading
  useEffect(() => {
    const greetingText = t('ai_greeting');
    
    // Check if we need to initialize or update the greeting
    // Update if list is empty OR if the first message is the raw key (meaning translation wasn't ready)
    if (messages.length === 0 || (messages.length === 1 && messages[0].role === 'model' && messages[0].text === 'ai_greeting')) {
      if (greetingText && greetingText !== 'ai_greeting') {
        setMessages([{ 
          id: '1', 
          role: 'model', 
          text: greetingText 
        }]);
      } else if (messages.length === 0) {
        // Initial placeholder while loading
        setMessages([{ 
          id: '1', 
          role: 'model', 
          text: '...' 
        }]);
      }
    }
  }, [t, messages]); // Depend on t to trigger re-render when translations load

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const generateContextPrompt = () => {
    // Summarize data to avoid token limits while providing useful context
    const topClients = [...clients].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)
      .map(c => `${c.company} (${formatCurrency(c.totalSpent)})`).join(', ');
    
    const lowStockItems = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock')
      .map(p => `${p.name} (${p.stock})`).join(', ');

    const recentInvoices = invoices.slice(0, 5).map(i => `${i.number} for ${i.clientName}: ${formatCurrency(i.amount)} (${i.status})`).join(', ');

    // Determine target language name
    const languageMap: Record<string, string> = {
      en: 'English',
      fr: 'French',
      ar: 'Arabic'
    };
    const targetLanguage = languageMap[settings.language] || 'English';

    return `
      Current Business Context:
      - Company Name: ${settings.companyName}
      - Total Revenue: ${formatCurrency(stats.revenue)}
      - Total Expenses: ${formatCurrency(stats.expenses)}
      - Net Profit: ${formatCurrency(stats.profit)}
      - Pending Invoices: ${stats.pendingInvoices}
      - Top 5 Clients: ${topClients || 'None'}
      - Low Stock Items: ${lowStockItems || 'None'}
      - Recent Invoices: ${recentInvoices}
      
      You are a helpful business assistant embedded in the SmartBiz SaaS application. 
      Answer questions based on the context provided above. 
      Keep answers concise, professional, and helpful.
      If asked to perform actions (like creating invoices), explain that you can't execute actions yet but can guide them.

      IMPORTANT: You must answer in ${targetLanguage}.
    `;
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const apiKey = settings.geminiApiKey;

      if (!apiKey) {
        throw new Error("API Key not found. Please configure it in Settings > General.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const context = generateContextPrompt();
      const prompt = `${context}\n\nUser Query: ${userMessage.text}`;

      // Using gemini-2.5-flash for reliability and speed
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const responseText = response.text || "I'm sorry, I couldn't generate a response at this time.";

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessage = t('ai_error_generic');
      if (error.message && (error.message.includes("API Key") || error.message.includes("403") || error.message.includes("400"))) {
        errorMessage = t('ai_error_config');
      }
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: errorMessage
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-10 duration-300">
      {/* Header */}
      <div className="p-4 bg-indigo-600 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-bold">{t('ask_ai')}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-indigo-700 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
              ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}
            `}>
              {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`
              max-w-[75%] p-3 rounded-2xl text-sm
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'}
            `}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-xs text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={t('ai_placeholder')}
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 border-0 rounded-full focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
        />
        <button 
          type="submit" 
          disabled={!inputValue.trim() || isLoading}
          className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;
