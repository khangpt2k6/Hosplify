import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, User, Bot, Zap, Paperclip, Image, File } from 'lucide-react';

const GeminiChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState('');
  const [fullResponseText, setFullResponseText] = useState('');
  const [typingSpeed, setTypingSpeed] = useState(25); // ms per character
  const messagesEndRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([]);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  
  // Get API key from environment variables
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.REACT_APP_GEMINI_API_KEY;

  // Initialize chat with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        role: 'model',
        content: "Hi, I'm your AI Assistant. You can ask me questions or upload images for analysis.",
        options: [
          "Dermatologist",
          "General physician",
          "Gynecologist",
          "Pediatricians",
          "Neurologist",
          "Gastroenterologist"
        ]
      };
      
      setMessages([welcomeMessage]);
      setChatHistory([{ role: 'model', parts: [{ text: welcomeMessage.content }] }]);
    }
  }, [isOpen, messages.length]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Text typing animation effect
  useEffect(() => {
    if (isTyping && fullResponseText) {
      if (currentTypingText.length < fullResponseText.length) {
        const timeout = setTimeout(() => {
          setCurrentTypingText(fullResponseText.slice(0, currentTypingText.length + 1));
        }, typingSpeed);
        return () => clearTimeout(timeout);
      } else {
        setIsTyping(false);
        
        // Update the message with the full response
        setMessages(prevMessages => {
          const newMessages = [...prevMessages];
          // Replace the last message with the complete response
          if (newMessages.length > 0) {
            newMessages[newMessages.length - 1] = {
              ...newMessages[newMessages.length - 1],
              content: fullResponseText,
              isTyping: false
            };
          }
          return newMessages;
        });
      }
    }
  }, [isTyping, currentTypingText, fullResponseText, typingSpeed]);

  // Scroll to bottom of chat whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages, currentTypingText]);

  // Close file menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFileMenuOpen && !event.target.closest('.file-upload-menu')) {
        setIsFileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isFileMenuOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const toggleFileMenu = () => {
    setIsFileMenuOpen(!isFileMenuOpen);
  };

  const handleOptionClick = (option) => {
    setInput(option);
    handleSubmit(null, option);
  };

  // Format response text to have proper markdown and structure
  const formatResponseText = (text) => {
    // Replace asterisks with proper formatting
    let formattedText = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Format bullet points to appear on separate lines
    formattedText = formattedText.replace(/•\s+/g, '</p><p class="mt-2">• ');
    formattedText = formattedText.replace(/\*\s+/g, '</p><p class="mt-2">• ');
    
    // Fix adjacent bullet points that have no separator
    formattedText = formattedText.replace(/([.:;])\s*•/g, '$1</p><p class="mt-2">•');
    
    // Fix specific pattern in the example: "r² = 20 • Circle Properties:"
    formattedText = formattedText.replace(/(\d+)\s+•\s+/g, '$1</p><p class="mt-2">• ');
    
    // Add paragraph breaks where appropriate
    formattedText = formattedText.replace(/\.\s+(?=[A-Z])/g, '.</p><p class="mt-2">');
    
    // Wrap in paragraph tags if needed
    if (!formattedText.startsWith('<p>')) {
      formattedText = '<p>' + formattedText;
    }
    if (!formattedText.endsWith('</p>')) {
      formattedText += '</p>';
    }
    
    return formattedText;
  };

  // Trigger file input click
  const handleFileButtonClick = (type) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'image' ? 'image/*' : '*/*';
      fileInputRef.current.click();
    }
    setIsFileMenuOpen(false);
  };

  // Handle file input change
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadedFile(file);
      
      // Add a preview message for the uploaded file/image
      const isImage = file.type.startsWith('image/');
      let filePreview = null;
      
      if (isImage) {
        // Create an image preview
        filePreview = await createImagePreview(file);
      }
      
      // Add file/image message to chat
      const fileMessage = { 
        role: 'user', 
        content: `Uploaded ${isImage ? 'image' : 'file'}: ${file.name}`,
        fileType: file.type,
        fileName: file.name,
        preview: filePreview
      };
      
      setMessages(prevMessages => [...prevMessages, fileMessage]);
      
      // Process the file with Gemini
      await processFileWithGemini(file);
      
    } catch (error) {
      console.error('Error handling file:', error);
      setMessages(prevMessages => [...prevMessages, {
        role: 'model',
        content: 'Sorry, I encountered an error processing your file. Please try again.'
      }]);
    }
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Create an image preview as a data URL
  const createImagePreview = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Process file with Gemini API
  const processFileWithGemini = async (file) => {
    setIsLoading(true);
    
    try {
      // Check if the file is an image
      const isImage = file.type.startsWith('image/');
      
      if (isImage) {
        // Process image with Gemini Vision API
        const response = await callGeminiVisionAPI(file);
        
        if (response && response.text) {
          const formattedResponse = formatResponseText(response.text);
          
          // Start typing animation
          setFullResponseText(formattedResponse);
          setCurrentTypingText('');
          
          // Add initial empty model response that will be updated during typing
          setMessages(prevMessages => [...prevMessages, { 
            role: 'model', 
            content: '',
            isTyping: true
          }]);
          
          setIsTyping(true);
          
          // Update history with the bot's response
          setChatHistory(prev => [...prev, { 
            role: 'model', 
            parts: [{ text: response.text }] 
          }]);
        }
      } else {
        // For non-image files, extract text if possible or analyze filename
        // For PDF, DOC, etc. we'd need additional libraries to extract content
        // For simplicity, we'll just analyze the file name and type
        const fileInfo = `The user uploaded a file named "${file.name}" of type "${file.type}" and size ${(file.size / 1024).toFixed(2)}KB.`;
        const userMessage = { role: 'user', parts: [{ text: fileInfo }] };
        
        // Update history with file info
        const updatedHistory = [...chatHistory, userMessage];
        setChatHistory(updatedHistory);
        
        // Call regular Gemini API with file info
        const response = await callGeminiAPI(updatedHistory);
        
        if (response && response.text) {
          const formattedResponse = formatResponseText(response.text);
          
          // Start typing animation
          setFullResponseText(formattedResponse);
          setCurrentTypingText('');
          
          // Add initial empty model response that will be updated during typing
          setMessages(prevMessages => [...prevMessages, { 
            role: 'model', 
            content: '',
            isTyping: true
          }]);
          
          setIsTyping(true);
          
          // Update history with the bot's response
          setChatHistory([...updatedHistory, { 
            role: 'model', 
            parts: [{ text: response.text }] 
          }]);
        }
      }
    } catch (error) {
      console.error('Error processing file with Gemini:', error);
      
      // Add error message to chat
      setMessages(prevMessages => [...prevMessages, {
        role: 'model',
        content: 'Sorry, I encountered an error processing your file. Please try again later.'
      }]);
    }
    
    setIsLoading(false);
  };

  const handleSubmit = async (e, optionText = null) => {
    if (e) e.preventDefault();
    
    const messageText = optionText || input;
    if (!messageText.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', parts: [{ text: messageText }] };
    setMessages(prevMessages => [...prevMessages, { role: 'user', content: messageText }]);
    
    // Clear input field
    setInput('');
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Update history with the user message
      const updatedHistory = [...chatHistory, userMessage];
      setChatHistory(updatedHistory);
      
      // Call Gemini API
      const response = await callGeminiAPI(updatedHistory);
      
      if (response && response.text) {
        const formattedResponse = formatResponseText(response.text);
        
        // Start typing animation
        setFullResponseText(formattedResponse);
        setCurrentTypingText('');
        
        // Add initial empty model response that will be updated during typing
        setMessages(prevMessages => [...prevMessages, { 
          role: 'model', 
          content: '',
          isTyping: true
        }]);
        
        setIsTyping(true);
        setIsLoading(false);
        
        // Update history with the bot's response
        setChatHistory([...updatedHistory, { 
          role: 'model', 
          parts: [{ text: response.text }] 
        }]);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      
      // Add error message to chat
      setMessages(prevMessages => [...prevMessages, {
        role: 'model',
        content: 'Sorry, I encountered an error. Please try again later.'
      }]);
      
      setIsLoading(false);
    }
  };

  // Function to call Gemini API
  const callGeminiAPI = async (history) => {
    // API endpoint for Gemini 2.0 Flash
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
    
    try {
      if (!apiKey) {
        throw new Error('API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
      }
      
      // Make the API request
      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: history,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract the response text
      return {
        text: data.candidates[0].content.parts[0].text
      };
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  // Function to call Gemini Vision API for image processing
  const callGeminiVisionAPI = async (imageFile) => {
    // API endpoint for Gemini Pro Vision - corrected endpoint
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent';
    
    try {
      if (!apiKey) {
        throw new Error('API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
      }
      
      // Convert image to base64
      const base64Image = await fileToBase64(imageFile);
      const mimeType = imageFile.type;
      
      // Make the API request
      const response = await fetch(`${endpoint}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Please analyze this image and describe what you see in detail."
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Vision API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      // Extract the response text
      return {
        text: data.candidates[0].content.parts[0].text
      };
    } catch (error) {
      console.error('Vision API call error:', error);
      throw error;
    }
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Extract the base64 part (remove the data:image/jpeg;base64, prefix)
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat toggle button */}
      <button 
        onClick={toggleChat}
        className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X size={24} className="text-white" />
        ) : (
          <MessageCircle size={24} className="text-white" />
        )}
      </button>
      
      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col w-80 md:w-96 h-96 rounded-2xl overflow-hidden shadow-2xl bg-white transition-all duration-300 border border-gray-200">
          {/* Chat header */}
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 px-4 py-3 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-yellow-300" />
              <h2 className="text-lg font-medium">AI Assistant</h2>
            </div>
            <button onClick={toggleChat} className="text-white hover:text-gray-200 transition-colors">
              <X size={18} />
            </button>
          </div>
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-gray-400 text-center italic mt-8">
                Send a message to start chatting with our assistant
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="space-y-2">
                  <div 
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {/* Avatar for bot messages */}
                    {message.role === 'model' && (
                      <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center mr-2 flex-shrink-0">
                        <Bot size={16} className="text-white" />
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div 
                      className={`px-4 py-3 rounded-2xl max-w-xs md:max-w-sm break-words ${
                        message.role === 'user' 
                          ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white ml-2' 
                          : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                      }`}
                    >
                      {message.isTyping ? (
                        <div>
                          <span 
                            dangerouslySetInnerHTML={{ 
                              __html: currentTypingText || '<div class="flex space-x-2"><div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div><div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div><div class="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div></div>' 
                            }} 
                          />
                          {currentTypingText && currentTypingText.length === fullResponseText.length ? null : (
                            <span className="inline-block w-1 h-4 ml-1 bg-gray-500 animate-blink"></span>
                          )}
                        </div>
                      ) : (
                        <div className="message-content">
                          {message.preview ? (
                            <div className="mb-2">
                              <img 
                                src={message.preview} 
                                alt={message.fileName || "Uploaded image"} 
                                className="max-w-full rounded-lg max-h-32 object-contain my-2"
                              />
                              <div className="text-sm opacity-80">{message.fileName}</div>
                            </div>
                          ) : (
                            <span 
                              dangerouslySetInnerHTML={{ __html: message.content }} 
                              className="bullet-point-container"
                            />
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Avatar for user messages */}
                    {message.role === 'user' && (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0">
                        <User size={16} className="text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  {/* Option buttons */}
                  {message.options && !message.isTyping && (
                    <div className="flex flex-wrap gap-2 mt-3 ml-10">
                      {message.options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => handleOptionClick(option)}
                          className="bg-white border border-gray-200 hover:border-blue-500 text-gray-700 text-sm px-3 py-1.5 rounded-full transition-all duration-200 hover:bg-blue-50 shadow-sm"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Loading indicator */}
            {isLoading && !isTyping && (
              <div className="flex justify-start">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-600 to-violet-600 flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input form */}
          <form onSubmit={handleSubmit} className="border-t border-gray-100 p-3 flex bg-white">
            {/* File upload input (hidden) */}
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {/* File upload button */}
            <div className="relative mr-2">
              <button 
                type="button"
                onClick={toggleFileMenu}
                className="h-full border border-gray-300 rounded-lg px-3 flex items-center justify-center hover:bg-gray-50 transition-colors"
                disabled={isLoading || isTyping}
              >
                <Paperclip size={18} className="text-gray-500" />
              </button>
              
              {/* File upload menu */}
              {isFileMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-40 file-upload-menu">
                  <button
                    type="button"
                    onClick={() => handleFileButtonClick('image')}
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center text-gray-700"
                  >
                    <Image size={16} className="mr-2 text-blue-500" />
                    <span>Upload Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFileButtonClick('file')} 
                    className="w-full text-left px-3 py-2 rounded hover:bg-gray-100 flex items-center text-gray-700"
                  >
                    <File size={16} className="mr-2 text-blue-500" />
                    <span>Upload File</span>
                  </button>
                </div>
              )}
            </div>
            
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-l-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading || isTyping}
            />
            <button 
              type="submit" 
              disabled={isLoading || isTyping || !input.trim()} 
              className="bg-gradient-to-r from-blue-600 to-violet-600 text-white px-4 py-3 rounded-r-xl hover:from-blue-700 hover:to-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Add custom CSS without the "jsx" attribute */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blink {
          0% { opacity: 1; }
          50% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-blink {
          animation: blink 0.8s infinite;
        }
        .message-content p {
          margin-bottom: 8px;
        }
        .message-content p:last-child {
          margin-bottom: 0;
        }
        .bullet-point-container strong {
          font-weight: 600;
        }
      `}} />
    </div>
  );
};

export default GeminiChatbot;