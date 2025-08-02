import React, { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { ChatMessage } from '../types';
import { getAIStream } from '../services/geminiService';
import { PaperAirplaneIcon, ChatBubbleOvalLeftEllipsisIcon, XMarkIcon } from './Icons';
import { AppContext, AppContextType } from '../contexts/AppContext';

const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { player } = useContext(AppContext) as AppContextType;
  
  const isChatDisabled = isLoading || !!player.isAnonymous;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSend = useCallback(async () => {
    if (!input.trim() || isChatDisabled) return;
    
    const userMessage: ChatMessage = { id: `user-${Date.now()}`, sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const aiMessageId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: '', isStreaming: true }]);

    try {
      const stream = await getAIStream(messages, input);
      let fullText = '';
      for await (const chunk of stream) {
        const chunkText = chunk.text;
        fullText += chunkText;
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId ? { ...msg, text: fullText } : msg
        ));
      }
    } catch (error) {
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId ? { ...msg, text: "Sorry, I'm having trouble connecting. Please try again later." } : msg
      ));
    } finally {
      setIsLoading(false);
      setMessages(prev => prev.map(msg =>
        msg.id === aiMessageId ? { ...msg, isStreaming: false } : msg
      ));
    }
  }, [input, isChatDisabled, messages]);


  return (
    <>
      <div className={`fixed bottom-5 right-5 z-50 transition-transform duration-300 ease-out ${isOpen ? 'translate-y-full scale-0' : 'translate-y-0 scale-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-brand-green text-dark-1 rounded-full p-4 shadow-lg shadow-green-glow hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 focus:ring-offset-dark-1"
          aria-label="Open AI Chat"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
        </button>
      </div>

      <div className={`fixed bottom-0 right-0 sm:bottom-5 sm:right-5 h-full w-full sm:h-[70vh] sm:max-h-[600px] sm:w-[400px] bg-dark-2 border-t-4 sm:border-4 border-brand-green rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-dark-3/50 rounded-t-2xl sm:rounded-t-xl">
          <h3 className="text-lg font-bold text-white">Bame Assistant</h3>
          <button onClick={() => setIsOpen(false)} className="text-light-2 hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans">
          <div className="flex space-x-2">
            <span className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-green text-dark-1 font-display flex items-center justify-center font-bold text-sm">AI</span>
            <div className="bg-dark-3 rounded-lg p-3 max-w-xs text-sm">
              <p>Hello! I'm the Bame Assistant. How can I help you with our tournaments today?</p>
            </div>
          </div>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-end space-x-2 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
               {msg.sender === 'ai' && <span className="flex-shrink-0 h-8 w-8 rounded-full bg-brand-green text-dark-1 font-display flex items-center justify-center font-bold text-sm">AI</span>}
               <div className={`rounded-lg p-3 max-w-xs text-sm ${msg.sender === 'user' ? 'bg-brand-green text-dark-1' : 'bg-dark-3 text-light-1'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.isStreaming && <span className="inline-block w-2 h-2 bg-white rounded-full animate-pulse ml-2"></span>}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center bg-dark-3 rounded-full p-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isChatDisabled ? "Sign in to chat" : "Ask a question..."}
              className="flex-1 bg-transparent px-4 py-2 text-white placeholder-light-2/50 focus:outline-none"
              disabled={isChatDisabled}
            />
            <button
              onClick={handleSend}
              disabled={isChatDisabled || !input.trim()}
              className="bg-brand-green text-dark-1 rounded-full p-2 disabled:bg-gray-500 disabled:cursor-not-allowed hover:bg-opacity-80 transition-colors"
            >
              <PaperAirplaneIcon className="h-5 w-5"/>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChat;
