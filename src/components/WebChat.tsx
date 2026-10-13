"use client";

import { useState, useRef, useEffect } from "react";

export default function WebChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "ai" | "user"; text: string }[]>([
    { role: "ai", text: "Hi there! 👋 How can I help you today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "ai", text: data.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Sorry, connection failed." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        #web-chat-toggle {
            position: fixed;
            bottom: 24px;
            right: 24px;
            width: 56px;
            height: 56px;
            background-color: #2D2D2D;
            color: #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            cursor: pointer;
            z-index: 9999;
            transition: transform 0.2s;
            border: none;
            outline: none;
        }
        #web-chat-toggle:hover {
            transform: scale(1.05);
        }
        
        #web-chat-window {
            position: fixed;
            bottom: 96px;
            right: 24px;
            width: 350px;
            height: 500px;
            max-height: 70vh;
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            border: 1px solid #e5e7eb;
            transition: all 0.3s ease;
            transform: translateY(20px);
            opacity: 0;
            pointer-events: none;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        #web-chat-window.chat-active {
            transform: translateY(0);
            opacity: 1;
            pointer-events: auto;
        }

        .chat-header {
            background-color: #2D2D2D;
            color: #ffffff;
            padding: 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        
        .chat-header-info {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .chat-logo {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        }
        
        .chat-logo span {
            color: #2D2D2D;
            font-weight: bold;
            font-family: serif;
        }

        .chat-title {
            margin: 0;
            font-size: 16px;
            font-weight: 500;
            line-height: 1;
        }
        
        .chat-subtitle {
            margin: 4px 0 0 0;
            font-size: 12px;
            color: #d1d5db;
        }

        #web-chat-close {
            background: none;
            border: none;
            color: #d1d5db;
            cursor: pointer;
        }
        #web-chat-close:hover {
            color: #ffffff;
        }

        #web-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            background-color: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .msg-wrap {
            display: flex;
            width: 100%;
        }

        .msg-bubble {
            padding: 12px;
            border-radius: 16px;
            font-size: 14px;
            max-width: 85%;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            line-height: 1.4;
        }

        .msg-ai {
            justify-content: flex-start;
        }
        
        .msg-ai .msg-bubble {
            background-color: #ffffff;
            border: 1px solid #f3f4f6;
            color: #1f2937;
            border-top-left-radius: 4px;
        }

        .msg-user {
            justify-content: flex-end;
        }

        .msg-user .msg-bubble {
            background-color: #2D2D2D;
            color: #ffffff;
            border-top-right-radius: 4px;
        }

        .chat-input-area {
            padding: 12px;
            background-color: #ffffff;
            border-top: 1px solid #f3f4f6;
            display: flex;
            align-items: flex-end;
            gap: 8px;
        }

        #web-chat-input {
            flex: 1;
            background-color: #f3f4f6;
            border: none;
            border-radius: 12px;
            padding: 12px 16px;
            font-size: 14px;
            resize: none;
            max-height: 100px;
            font-family: inherit;
        }
        #web-chat-input:focus {
            outline: none;
            box-shadow: inset 0 0 0 1px #2D2D2D;
        }

        #web-chat-send {
            width: 44px;
            height: 44px;
            background-color: #2D2D2D;
            color: #ffffff;
            border: none;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            flex-shrink: 0;
        }
        #web-chat-send:hover {
            background-color: #A67B5B; 
        }

        .typing-indicator {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 12px;
            background-color: #ffffff;
            border: 1px solid #f3f4f6;
            border-radius: 16px;
            border-top-left-radius: 4px;
            width: fit-content;
        }
        .typing-dot {
            width: 6px;
            height: 6px;
            background-color: #9ca3af;
            border-radius: 50%;
            animation: typingBounce 1.4s infinite ease-in-out both;
        }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typingBounce {
            0%, 80%, 100% { transform: scale(0); }
            40% { transform: scale(1); }
        }
      `}} />

      <button id="web-chat-toggle" onClick={toggleChat}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      </button>

      <div id="web-chat-window" className={isOpen ? "chat-active" : ""}>
        <div className="chat-header">
            <div className="chat-header-info">
                <div className="chat-logo">
                    <span>ÉL</span>
                </div>
                <div>
                    <h3 className="chat-title">Store AI</h3>
                    <p className="chat-subtitle">Typically replies instantly</p>
                </div>
            </div>
            <button id="web-chat-close" onClick={toggleChat}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
        </div>

        <div id="web-chat-messages">
            {messages.map((msg, i) => (
                <div key={i} className={`msg-wrap ${msg.role === "ai" ? "msg-ai" : "msg-user"}`}>
                    <div className="msg-bubble" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\\n/g, '<br>') }} />
                </div>
            ))}
            {isTyping && (
                <div id="web-chat-typing" style={{ padding: "0 16px 12px 16px" }}>
                    <div className="typing-indicator">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
            <textarea 
                id="web-chat-input" 
                rows={1} 
                placeholder="Write a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                    }
                }}
            />
            <button id="web-chat-send" onClick={sendMessage}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style={{ transform: "translateX(1px)" }}><path d="M1.101 21.757 23.8 12.028 1.101 2.3l.011 7.912 13.623 1.816-13.623 1.817-.011 7.912z"></path></svg>
            </button>
        </div>
      </div>
    </>
  );
}
