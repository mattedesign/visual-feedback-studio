
import React, { useState } from 'react';
import { AmazonHeader } from '@/components/ui/AmazonHeader';
import { AmazonCard, AmazonCardHeader, AmazonCardTitle, AmazonCardContent } from '@/components/ui/AmazonCard';
import { AmazonButton } from '@/components/ui/AmazonButton';
import { AmazonForm, AmazonFormField, AmazonTextareaField, AmazonSelectField } from '@/components/forms/AmazonForm';
import { MessageCircle, Brain, Target, Lightbulb, Send, User, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'analysis';
}

const UXConsultant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      message: "Hello! I'm your AI UX Consultant. I can help you with design problems, user experience questions, conversion optimization, accessibility issues, and more. What would you like to discuss?",
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const consultationTopics = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Conversion Optimization",
      description: "Improve your conversion rates with data-driven design recommendations",
      examples: ["Why isn't my CTA converting?", "How to optimize checkout flow?", "Best practices for landing pages"]
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "User Experience Audit",
      description: "Get comprehensive UX analysis and improvement suggestions",
      examples: ["Navigation issues analysis", "Information architecture review", "User flow optimization"]
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Design Strategy",
      description: "Strategic design guidance for product development",
      examples: ["Design system planning", "Mobile-first approach", "Accessibility compliance"]
    }
  ];

  const quickQuestions = [
    "How can I improve my website's conversion rate?",
    "What are the best practices for mobile UX?",
    "How do I make my design more accessible?",
    "What's the ideal user flow for e-commerce?",
    "How to create an effective landing page?"
  ];

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      message: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        message: generateAIResponse(newMessage),
        timestamp: new Date(),
        type: 'text'
      };
      
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (question: string): string => {
    // Simple response generation for demo
    const responses = [
      "Great question! Based on UX research and best practices, here are some key recommendations...",
      "I'd be happy to help with that. Let me break this down into actionable steps...",
      "This is a common challenge in UX design. Here's what I recommend based on data from similar cases...",
      "Excellent point! From an accessibility and conversion perspective, consider these approaches..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + 
           " [This is a demo response. In the full version, this would provide detailed, contextual UX advice based on your specific question.]";
  };

  const handleQuickQuestion = (question: string) => {
    setNewMessage(question);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AmazonHeader />
      
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Header */}
        <AmazonCard className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-0 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              AI UX Consultant
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Get professional UX consultation powered by research and best practices. 
              Ask anything about design, user experience, or conversion optimization.
            </p>
            <div className="flex justify-center gap-4">
              <div className="amazon-badge amazon-badge-success">
                💡 Instant Expert Advice
              </div>
              <div className="amazon-badge amazon-badge-warning">
                📊 Research-Backed
              </div>
              <div className="amazon-badge amazon-badge-error">
                🎯 Actionable Insights
              </div>
            </div>
          </div>
        </AmazonCard>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Consultation Topics */}
          <div className="lg:col-span-1 space-y-6">
            <AmazonCard>
              <AmazonCardHeader>
                <AmazonCardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Consultation Topics
                </AmazonCardTitle>
              </AmazonCardHeader>
              <AmazonCardContent>
                <div className="space-y-4">
                  {consultationTopics.map((topic, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-blue-600">{topic.icon}</div>
                        <h4 className="font-semibold text-slate-900">{topic.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                      <div className="space-y-1">
                        {topic.examples.map((example, idx) => (
                          <div key={idx} className="text-xs text-gray-500">• {example}</div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </AmazonCardContent>
            </AmazonCard>

            {/* Quick Questions */}
            <AmazonCard>
              <AmazonCardHeader>
                <AmazonCardTitle>Quick Questions</AmazonCardTitle>
              </AmazonCardHeader>
              <AmazonCardContent>
                <div className="space-y-2">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question)}
                      className="w-full text-left p-3 text-sm border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </AmazonCardContent>
            </AmazonCard>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <AmazonCard className="h-[600px] flex flex-col">
              <AmazonCardHeader>
                <AmazonCardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  UX Consultation Chat
                </AmazonCardTitle>
              </AmazonCardHeader>
              
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-lg mx-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'ai' && (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.message}</p>
                      <div className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>

                    {message.sender === 'user' && (
                      <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center text-white">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-white border border-gray-200 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-200">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask me anything about UX design, conversion optimization, accessibility..."
                    className="amazon-input flex-1"
                    disabled={isTyping}
                  />
                  <AmazonButton
                    type="submit"
                    disabled={!newMessage.trim() || isTyping}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send
                  </AmazonButton>
                </form>
              </div>
            </AmazonCard>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UXConsultant;
