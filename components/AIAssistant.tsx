
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Bot, User as UserIcon, Loader2, Settings } from 'lucide-react';
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
  isError?: boolean;
}

const APP_KNOWLEDGE = `
APP FUNCTIONALITY & NAVIGATION GUIDE:
- **Dashboard**: View real-time financial stats (Revenue, Expenses, Profit).
- **Clients**: Manage customer database. Click '+ Add Client' to create.
- **Suppliers**: Manage vendor database. Click '+ Add Supplier' to create.
- **Sales Module**:
  - **Estimates**: Create quotes. Can convert to Orders or Invoices.
  - **Orders**: Confirm customer requests.
  - **Deliveries**: Ship items (deducts stock).
  - **Invoices**: Finalize sales (updates revenue).
  - **Issues**: Manual stock issuance.
- **Purchases Module**:
  - **Orders (PO)**: Send orders to suppliers.
  - **Deliveries (GRN)**: Receive goods (adds stock).
  - **Invoices**: Log expenses.
- **Inventory**:
  - **Products**: Manage items, pricing, and stock levels.
  - **Warehouses**: Manage multiple locations.
  - **Transfers**: Move stock between warehouses.
- **Banking**: Manage bank accounts and reconcile transactions.
- **Cash Register**: Manage daily cash shifts (Open/Close register).
- **Reports**: View Sales, Purchase, and Financial analytics.
- **Settings**: Configure Company Info, Tax Rates, Currency, and API Keys.
`;

const AIAssistant: React.FC<AIAssistantProps> = ({ isOpen, onClose }) => {
  const { stats, clients, products, invoices, settings, formatCurrency, t, setIsLoading: setAppLoading } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize greeting with translation
  useEffect(() => {
    // Only set greeting if messages are empty to avoid overwriting conversation
    if (messages.length === 0) {
      const greeting = t('ai_greeting');
      // Ensure we don't show the raw key if translation isn't loaded yet
      if (greeting && greeting !== 'ai_greeting') {
        setMessages([{ 
          id: 'init', 
          role: 'model', 
          text: greeting 
        }]);
      }
    } else if (messages.length === 1 && messages[0].id === 'init' && messages[0].text === 'ai_greeting') {
      // Update if the existing message is the raw key
      const greeting = t('ai_greeting');
      if (greeting && greeting !== 'ai_greeting') {
        setMessages([{ ...messages[0], text: greeting }]);
      }
    }
  }, [t, messages.length]); 

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const generateContextPrompt = () => {
    const topClients = [...clients].sort((a, b) => b.totalSpent - a.totalSpent).slice(0, 5)
      .map(c => `${c.company} (${formatCurrency(c.totalSpent)})`).join(', ');
    
    const lowStockItems = products.filter(p => p.status === 'low_stock' || p.status === 'out_of_stock')
      .map(p => `${p.name} (${p.stock})`).join(', ');

    const recentInvoices = invoices.slice(0, 3).map(i => `${i.number}: ${formatCurrency(i.amount)} (${i.status})`).join(', ');

    // Determine target language name
    const languageMap: Record<string, string> = {
      en: 'English',
      fr: 'French',
      ar: 'Arabic'
    };
    const targetLanguage = languageMap[settings.language] || 'English';

    return `
      ${APP_KNOWLEDGE}

      CURRENT BUSINESS DATA:
      - Company: ${settings.companyName}
      - Revenue: ${formatCurrency(stats.revenue)} | Expenses: ${formatCurrency(stats.expenses)}
      - Top Clients: ${topClients || 'None'}
      - Low Stock: ${lowStockItems || 'None'}
      - Recent Invoices: ${recentInvoices}
      
      ROLE & INSTRUCTIONS:
      You are a smart business assistant embedded in this app.
      1. Answer questions about the business data provided above.
      2. If asked how to perform a task, use the "APP FUNCTIONALITY" guide to provide specific navigation steps.
      3. Keep answers concise and professional.
      4. IMPORTANT: Answer in ${targetLanguage}.
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
      // Prioritize Environment Variable, then Settings
      // We assume process.env.API_KEY is valid if present.
      const apiKey = process.env.API_KEY || settings.geminiApiKey;

      if (!apiKey) {
        throw new Error("MISSING_KEY");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const context = generateContextPrompt();
      const prompt = `${context}\n\nUser Question: ${userMessage.text}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const responseText = response.text || "I couldn't generate a response.";

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (error: any) {
      console.error("AI Error:", error);
      let errorMessage = t('ai_error_generic');
      let isConfigError = false;

      if (error.message === "MISSING_KEY" || (error.message && (error.message.includes("API Key") || error.message.includes("403") || error.message.includes("400")))) {
        errorMessage = t('ai_error_config');
        isConfigError = true;
      }
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: errorMessage,
        isError: true
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
              ${msg.role === 'user' ? 'bg-indigo-600 text-white' : msg.isError ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'}
            `}>
              {msg.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`
              max-w-[85%] p-3 rounded-2xl text-sm
              ${msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : msg.isError
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-tl-none'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'}
            `}>
              {msg.text}
              {msg.isError && (
                <button 
                  onClick={() => { onClose(); window.location.hash = '#settings-general'; }}
                  className="mt-2 flex items-center gap-1 text-xs font-bold underline hover:no-underline"
                >
                  <Settings className="w-3 h-3" /> Go to Settings
                </button>
              )}
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
