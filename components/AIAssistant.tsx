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
  const { stats, clients, products, invoices, settings, formatCurrency } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: `Hello! I'm your SmartBiz AI assistant. I have access to your current dashboard data. How can I help you today?` }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
      // Initialize Gemini Client
      // NOTE: In a real app, ensure process.env.API_KEY is set. 
      // For this demo environment, we assume the environment is configured correctly.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      
      const context = generateContextPrompt();
      const prompt = `${context}\n\nUser Query: ${userMessage.text}`;

      // Using gemini-3-pro-preview with Thinking Mode
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });

      const responseText = response.text || "I'm sorry, I couldn't generate a response at this time.";

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: "I'm having trouble connecting to the AI service right now. Please check your API key configuration." 
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
          <span className="font-bold">SmartBiz Assistant</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-indigo-700 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[80%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-indigo-100 text-indigo-600'}`}>
                {msg.role === 'user' ? <UserIcon className="w-5 h-5 text-gray-500" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex max-w-[80%] gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-3 rounded-2xl rounded-tl-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask complex business questions..."
          className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white text-sm"
        />
        <button 
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};

export default AIAssistant;