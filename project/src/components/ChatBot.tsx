import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your PizzaCraft assistant. I can help you with menu questions, order information, and general inquiries about our services. How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
  const GEMINI_API_URL =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  const WEATHER_API_KEY = import.meta.env.VITE_WEATHER_API_KEY || '';
  const WEATHER_CITY = 'Hyderabad';

  const MOODS = [
    { label: '😊 Happy', value: 'happy' },
    { label: '😋 Hungry', value: 'hungry' },
    { label: '😔 Sad', value: 'sad' },
    { label: '🥳 Party', value: 'party' },
    { label: '🤔 Adventurous', value: 'adventurous' },
  ];

  function suggestPizza(mood: string, weather: string, time: number) {
    if (mood === 'happy' && weather === 'cold') return 'Pepperoni Cheese Burst';
    if (time >= 11 && time <= 14) return 'Lunch Combo Pizza';
    if (weather === 'rainy') return 'Hot & Spicy Pizza';
    if (mood === 'sad') return 'Chocolate Lava Cake with Margherita';
    if (mood === 'hungry') return 'Loaded Meat Feast';
    if (mood === 'party') return 'Party Platter Pizza';
    if (mood === 'adventurous') return 'Chef Special Surprise';
    return 'Classic Veggie';
  }

  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [weather, setWeather] = useState<string>('clear');

  useEffect(() => {
    async function fetchWeather() {
      if (!WEATHER_API_KEY) {
        setWeather('clear');
        return;
      }
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_CITY}&appid=${WEATHER_API_KEY}&units=metric`
        );

        if (!res.ok) {
          setWeather('clear');
          return;
        }

        const data = await res.json();
        if (data.weather && data.weather[0]) {
          const main = data.weather[0].main.toLowerCase();
          if (main.includes('rain')) setWeather('rainy');
          else if (data.main.temp < 20) setWeather('cold');
          else setWeather('clear');
        }
      } catch {
        setWeather('clear');
      }
    }
    fetchWeather();
  }, []);

  const handleMoodSelect = () => {
    if (!selectedMood) return;

    const hour = new Date().getHours();
    const pizza = suggestPizza(selectedMood, weather, hour);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        text: `Based on your mood (${selectedMood}), weather (${weather}), and time (${hour}h), I recommend: 🍕 ${pizza}`,
        sender: 'bot',
        timestamp: new Date(),
      },
    ]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = async (msg: string): Promise<string> => {
    try {
      const systemPrompt = `
        You are a helpful assistant for PizzaCraft.
        Help customers with menu questions, order status, store info, and pizza suggestions.
        User: ${msg}
      `;

      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
        }),
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch {
      return "I'm having trouble responding right now. Please try again later.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const botReply = await generateBotResponse(inputMessage);

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 shadow-lg"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 h-96 bg-white rounded-lg shadow-xl border flex flex-col">
          <div className="bg-blue-500 text-white p-4 rounded-t-lg">
            <h3 className="font-semibold flex items-center">
              <Bot className="h-5 w-5 mr-2" /> PizzaCraft Assistant
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {msg.sender === 'bot' && <Bot className="h-4 w-4" />}
                    {msg.sender === 'user' && <User className="h-4 w-4" />}
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="px-4 py-2 border-t bg-gray-50 flex flex-col items-center">
            <div className="text-xs text-gray-600 mb-2">How are you feeling?</div>

            <div className="flex flex-wrap gap-2 mb-2">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  className={`px-2 py-1 rounded-full text-sm border ${
                    selectedMood === m.value ? 'bg-blue-500 text-white' : 'bg-white'
                  }`}
                  onClick={() => setSelectedMood(m.value)}
                  disabled={isLoading}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleMoodSelect}
              disabled={!selectedMood || isLoading}
              className="text-xs px-3 py-1 rounded bg-blue-500 text-white disabled:bg-gray-300"
            >
              Suggest a Pizza
            </button>
          </div>

          <div className="border-t p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleSendMessage();
                }}
                placeholder="Type your message..."
                className="flex-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />

              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 disabled:bg-gray-300"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;
