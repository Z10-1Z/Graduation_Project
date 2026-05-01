import { createElement, useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Send, Mic, Paperclip, Bot, User, FileText, Calendar, Pill, Stethoscope, X } from 'lucide-react';
import { createChatConversation, fetchChatConversation, listChatConversations, sendChatMessageStream } from '../../api/aiAssistantAPI';
import { getApiErrorMessage } from '../../utils/apiError';

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getCurrentTime() {
  const now = new Date();
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function buildInitialMessage(text) {
  return {
    id: createMessageId(),
    role: 'assistant',
    text,
    time: getCurrentTime(),
  };
}

function formatMessageTime(value) {
  if (!value) return getCurrentTime();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return getCurrentTime();
  return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function mapConversationMessages(conversation, fallbackText) {
  const items = conversation?.messages || [];
  if (items.length === 0) return [buildInitialMessage(fallbackText)];

  return items.map((message) => ({
    id: message.id || createMessageId(),
    role: message.role === 'user' ? 'user' : 'assistant',
    text: message.content || '',
    time: formatMessageTime(message.created_at),
    citations: message.citations || [],
  }));
}

function getConversationTitle(conversation, fallback) {
  const latest = conversation?.messages?.[0];
  const content = latest?.content || conversation?.metadata?.topic || fallback;
  return content.length > 48 ? `${content.slice(0, 48)}...` : content;
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 justify-start">
      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
        <Bot size={16} className="text-white" />
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <Bot size={16} className="text-white" />
        </div>
      )}
      <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-white text-gray-800 border border-slate-200 rounded-bl-sm shadow-sm'
          }`}
        >
          {msg.text}
          {msg.file && (
            <div className={`mt-2 flex items-center gap-2 text-xs ${isUser ? 'text-blue-100' : 'text-gray-400'}`}>
              <FileText size={13} />
              <span>{msg.file}</span>
            </div>
          )}
        </div>
        <span className="text-xs text-gray-400 px-1">{msg.time}</span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
          <User size={16} className="text-gray-600" />
        </div>
      )}
    </div>
  );
}

function AIAssistantPageInner() {
  const { t } = useTranslation();
  const { token } = useSelector((state) => state.auth);
  const [messages, setMessages] = useState(() => [buildInitialMessage(t('ai.patientPage.initial'))]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [chatError, setChatError] = useState(null);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const quickActions = useMemo(
    () => [
      { label: t('ai.patientPage.quick.book'), icon: Calendar },
      { label: t('ai.patientPage.quick.meds'), icon: Pill },
      { label: t('ai.patientPage.quick.labs'), icon: FileText },
      { label: t('ai.patientPage.quick.diet'), icon: Stethoscope },
    ],
    [t]
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  useEffect(() => {
    if (!token) return undefined;
    let cancelled = false;

    listChatConversations({ token })
      .then((items) => {
        if (!cancelled) setConversations(items);
      })
      .catch(() => {
        if (!cancelled) setConversations([]);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const ensureConversation = useCallback(async () => {
    if (conversationId) return conversationId;

    const conversation = await createChatConversation({ surface: 'patient_dashboard' }, { token });
    setConversationId(conversation.id);
    setConversations((prev) => [conversation, ...prev.filter((item) => item.id !== conversation.id)]);
    return conversation.id;
  }, [conversationId, token]);

  const handleNewChat = () => {
    if (streaming) return;
    setConversationId(null);
    setChatError(null);
    setAttachment(null);
    setInput('');
    setMessages([buildInitialMessage(t('ai.patientPage.initial'))]);
  };

  const handleOpenConversation = async (id) => {
    if (streaming || !id) return;
    setLoadingConversation(true);
    setChatError(null);

    try {
      const conversation = await fetchChatConversation(id, { token });
      setConversationId(conversation.id);
      setMessages(mapConversationMessages(conversation, t('ai.patientPage.initial')));
    } catch (err) {
      setChatError(getApiErrorMessage(err, t('ai.patientPage.sendError')));
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleSend = async (text = input) => {
    const cleanText = text.trim();
    if (!cleanText || streaming) return;

    const userMsg = {
      id: createMessageId(),
      role: 'user',
      text: cleanText,
      file: attachment?.name || null,
      time: getCurrentTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachment(null);
    setTyping(true);
    setStreaming(true);
    setChatError(null);

    const assistantId = createMessageId();
    let assistantText = '';
    let assistantStarted = false;

    try {
      const activeConversationId = await ensureConversation();

      await sendChatMessageStream({
        conversationId: activeConversationId,
        message: cleanText,
        token,
        onDelta: (delta) => {
          if (!assistantStarted) {
            assistantStarted = true;
            setTyping(false);
            setMessages((prev) => [
              ...prev,
              { id: assistantId, role: 'assistant', text: '', time: getCurrentTime() },
            ]);
          }

          assistantText += delta;
          setMessages((prev) => prev.map((msg) => (
            msg.id === assistantId ? { ...msg, text: assistantText } : msg
          )));
        },
      });

      if (!assistantStarted) {
        setMessages((prev) => [
          ...prev,
          { id: assistantId, role: 'assistant', text: t('ai.patientPage.emptyResponse'), time: getCurrentTime() },
        ]);
      }
    } catch (err) {
      const errorText = getApiErrorMessage(err, t('ai.patientPage.sendError'));
      setChatError(errorText);
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: 'assistant', text: errorText, time: getCurrentTime() },
      ]);
    } finally {
      setTyping(false);
      setStreaming(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setAttachment(file);
  };

  const handleQuickAction = (label) => {
    handleSend(label);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-slate-100/90 backdrop-blur-sm">
      <div className="bg-slate-50 border-b border-slate-200 shadow-sm px-4 md:px-6 py-4 flex items-center justify-between shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>{t('ai.patientPage.online')}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-start">
            <h2 className="font-bold text-gray-800">{t('ai.patientPage.title')}</h2>
            <p className="text-xs text-gray-400">{t('ai.patientPage.subtitle')}</p>
          </div>
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <Bot size={20} className="text-white" />
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewChat}
            disabled={streaming}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
          >
            {t('ai.patientPage.newChat')}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:flex w-64 bg-slate-50 border-s border-slate-200 flex-col p-4 gap-3 overflow-y-auto shrink-0">
          <button
            type="button"
            onClick={handleNewChat}
            disabled={streaming}
            className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {t('ai.patientPage.newChat')}
          </button>

          <p className="text-xs font-bold text-gray-400 mt-2">{t('ai.patientPage.prevTitle')}</p>
          {conversations.length === 0 && (
            <p className="text-xs text-gray-400 text-start">{t('ai.patientPage.emptyHistory')}</p>
          )}
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => handleOpenConversation(conversation.id)}
              disabled={streaming || loadingConversation}
              className={`text-start p-3 rounded-xl bg-white hover:bg-slate-100 transition-colors border shadow-sm w-full disabled:opacity-60 ${conversation.id === conversationId ? 'border-blue-300' : 'border-slate-200'}`}
            >
              <p className="text-sm font-semibold text-gray-700 truncate">{getConversationTitle(conversation, t('ai.patientPage.newChat'))}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatMessageTime(conversation.updated_at || conversation.created_at)}</p>
            </button>
          ))}

          <p className="text-xs font-bold text-gray-400 mt-2">{t('ai.patientPage.toolsTitle')}</p>
          {[
            { label: t('ai.patientPage.toolMedical'), icon: FileText },
            { label: t('ai.patientPage.toolMeds'), icon: Pill },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              className="flex items-center gap-2 p-3 rounded-xl bg-white hover:bg-slate-100 transition-colors border border-slate-200 shadow-sm w-full text-start"
            >
              {createElement(icon, { size: 15, className: 'text-blue-600 shrink-0' })}
              <span className="text-sm text-gray-600">{label}</span>
            </button>
          ))}
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 bg-slate-100">
            {messages.map((msg) => (
              <Message key={msg.id} msg={msg} />
            ))}
            {(typing || loadingConversation) && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {chatError && (
            <div className="px-4 md:px-6 py-2 bg-red-50 text-red-600 text-xs font-semibold text-start border-t border-red-100">
              {chatError}
            </div>
          )}

          <div className="px-4 md:px-6 py-2 flex gap-2 overflow-x-auto scrollbar-hide shrink-0 bg-slate-100 border-t border-slate-200">
            {quickActions.map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => handleQuickAction(label)}
                disabled={streaming}
                className="shrink-0 flex items-center gap-1.5 bg-white border-2 border-slate-200 text-gray-700 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm hover:border-blue-500 hover:text-blue-700 transition-all"
              >
                {createElement(icon, { size: 13 })}
                {label}
              </button>
            ))}
          </div>

          {attachment && (
            <div className="px-4 md:px-6 pb-2 shrink-0">
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 w-fit max-w-full">
                <button type="button" onClick={() => setAttachment(null)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0">
                  <X size={14} />
                </button>
                <span className="text-xs text-blue-600 font-semibold truncate">{attachment.name}</span>
                <FileText size={14} className="text-blue-500 shrink-0" />
              </div>
            </div>
          )}

          <div className="bg-slate-50 border-t-2 border-slate-200 px-4 md:px-6 py-3 shrink-0 shadow-[0_-4px_12px_rgba(15,23,42,0.06)]">
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={!input.trim() || streaming}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-sm"
              >
                <Send size={16} />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('ai.patientPage.placeholder')}
                rows={1}
                className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm text-start text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition resize-none max-h-32 overflow-y-auto shadow-inner"
                style={{ minHeight: '42px' }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 border-2 border-slate-200 bg-white text-gray-600 rounded-xl flex items-center justify-center hover:border-blue-500 hover:text-blue-700 transition-colors shrink-0 shadow-sm"
              >
                <Paperclip size={16} />
              </button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFile} />

              <button
                type="button"
                className="w-10 h-10 border-2 border-slate-200 bg-white text-gray-600 rounded-xl flex items-center justify-center hover:border-blue-500 hover:text-blue-700 transition-colors shrink-0 shadow-sm"
              >
                <Mic size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">{t('ai.patientPage.disclaimer')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AIAssistantPage() {
  const { i18n } = useTranslation();
  const langKey = i18n.resolvedLanguage || i18n.language;
  return <AIAssistantPageInner key={langKey} />;
}
