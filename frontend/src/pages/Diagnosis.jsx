import React, { useState } from 'react';

// Import API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Diagnostic categories
const diagnosticTypes = [
  "General medical",
  "Cardiovascular",
  "Respiratory",
  "Gastrointestinal",
  "Neurological",
  "Musculoskeletal",
  "Dermatological",
  "Psychological"
];

// Gemini API call function
async function callGemini(messages, apiKey) {
  // Format messages for Gemini API
  const formattedMessages = messages.map(msg => ({
    role: msg.role === "system" ? "user" : msg.role,
    parts: [{ text: msg.content }]
  }));
  
  // If there's a system message, prepend it to the first user message
  if (messages.some(msg => msg.role === "system")) {
    const systemMsg = messages.find(msg => msg.role === "system");
    const firstUserMsgIndex = formattedMessages.findIndex(msg => msg.role === "user");
    
    if (firstUserMsgIndex !== -1) {
      formattedMessages[firstUserMsgIndex].parts[0].text = 
        `${systemMsg.content}\n\n${formattedMessages[firstUserMsgIndex].parts[0].text}`;
    }
  }
  
  // Filter out system messages
  const geminiMessages = formattedMessages.filter(msg => msg.role !== "system");
  
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      contents: geminiMessages,
      generationConfig: {
        temperature: 0.7
      }
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: { message: `HTTP error! Status: ${response.status}` }
    }));
    throw new Error(error.error?.message || `API request failed with status ${response.status}`);
  }

  return await response.json();
}

function Diagnosis() {
  // State variables
  const [step, setStep] = useState(1); // 1: Diagnostic Type, 2: Symptoms, 3: Follow-up, 4: Results, 5: Next Steps
  const [diagnosticType, setDiagnosticType] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [followUpQuestions, setFollowUpQuestions] = useState([]);
  const [followUpAnswers, setFollowUpAnswers] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle diagnostic type selection
  const handleDiagnosticTypeSelect = (type) => {
    setDiagnosticType(type);
    setStep(2);
  };

  // Handle symptoms submission
  const handleSymptomsSubmit = async (e) => {
    e.preventDefault();
    if (symptoms.trim() === '') {
      setError('Please enter your symptoms');
      return;
    }
    if (!GEMINI_API_KEY) {
      setError('Gemini API key not found. Please check your environment variables.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const messages = [
        {
          role: "system",
          content: `You are a medical diagnostic assistant. Your task is to ask appropriate follow-up questions based on the user's symptoms and the diagnostic category "${diagnosticType}". Ask 3-5 specific questions that would help clarify the condition. Format your response as a numbered list without bullet points, JSON formatting or any additional text.`
        },
        {
          role: "user",
          content: `Initial symptoms: ${symptoms}`
        }
      ];
      
      const response = await callGemini(messages, GEMINI_API_KEY);
      
      // Process the response to extract questions
      const content = response.candidates[0].content.parts[0].text;
      
      // Clean and parse the response to extract questions
      let questions = [];
      
      // Try to parse as a numbered list
      const numberListPattern = /^\d+[\.\)]\s*(.*?)$/gm;
      const listMatch = content.match(numberListPattern);
      
      if (listMatch && listMatch.length > 0) {
        questions = listMatch.map(q => q.replace(/^\d+[\.\)]\s*/, '').trim());
      } else {
        // Fall back to splitting by line breaks and cleaning
        questions = content
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0 && !line.startsWith('[') && !line.endsWith(']'))
          // Remove any numbers at the beginning of lines
          .map(line => line.replace(/^\d+[\.\)]\s*/, '').trim());
      }
      
      // Remove any markdown or special characters
      questions = questions.map(q => q.replace(/[*_`]/g, '').trim());
      
      // Filter out empty lines and ensure we have questions
      questions = questions.filter(q => q.length > 0);
      
      // If all else fails, use the whole content but clean it up
      if (questions.length === 0) {
        const cleanContent = content
          .replace(/[\[\]"*_`]/g, '')
          .trim();
        questions = cleanContent
          .split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      }
      
      setFollowUpQuestions(questions);
      setStep(3);
    } catch (err) {
      console.error("Error generating follow-up questions:", err);
      setError(`Failed to generate follow-up questions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle follow-up answers submission
  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();
    if (followUpAnswers.trim() === '') {
      setError('Please answer the follow-up questions');
      return;
    }
    if (!GEMINI_API_KEY) {
      setError('Gemini API key not found. Please check your environment variables.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const messages = [
        {
          role: "system",
          content: `You are a medical diagnostic assistant. Based on the user's symptoms and follow-up answers, provide a preliminary assessment. Format your response with clear sections for: Possible Conditions, Recommended Actions, and When to Seek Immediate Medical Attention. Do not use markdown, JSON, or other formatting syntax.`
        },
        {
          role: "user",
          content: `Diagnostic category: ${diagnosticType}\nInitial symptoms: ${symptoms}\nFollow-up questions: ${followUpQuestions.join('\n')}\nFollow-up answers: ${followUpAnswers}`
        }
      ];
      
      const response = await callGemini(messages, GEMINI_API_KEY);
      
      // Clean the response of any markdown formatting
      let diagnosisText = response.candidates[0].content.parts[0].text;
      diagnosisText = diagnosisText.replace(/[*_`]/g, ''); // Remove markdown symbols
      
      setDiagnosis(diagnosisText);
      setStep(4);
    } catch (err) {
      console.error("Error generating diagnosis:", err);
      setError(`Failed to generate diagnosis: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Generate next steps guidance
  const handleGetNextSteps = async () => {
    if (!GEMINI_API_KEY) {
      setError('Gemini API key not found. Please check your environment variables.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const messages = [
        {
          role: "system",
          content: `You are a medical guidance assistant. Based on the diagnosis and user's condition, provide clear next steps and personalized recommendations for the patient. Include: 1) Immediate actions they should take, 2) Lifestyle modifications that may help, 3) When they should seek professional medical care, and 4) Resources they can use to learn more. Format your response in clear, simple language without using markdown, JSON or other technical formatting.`
        },
        {
          role: "user",
          content: `Diagnostic category: ${diagnosticType}\nInitial symptoms: ${symptoms}\nDiagnosis: ${diagnosis}`
        }
      ];
      
      const response = await callGemini(messages, GEMINI_API_KEY);
      
      // Clean the response of any markdown formatting
      let nextStepsText = response.candidates[0].content.parts[0].text;
      nextStepsText = nextStepsText.replace(/[*_`]/g, ''); // Remove markdown symbols
      
      setNextSteps(nextStepsText);
      setStep(5);
    } catch (err) {
      console.error("Error generating next steps:", err);
      setError(`Failed to generate next steps guidance: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Reset the app
  const handleReset = () => {
    setStep(1);
    setDiagnosticType('');
    setSymptoms('');
    setFollowUpQuestions([]);
    setFollowUpAnswers('');
    setDiagnosis('');
    setNextSteps('');
    setError('');
  };

  // Format text content to display properly
  const formatContent = (content) => {
    if (!content) return '';
    
    // Clean the content of any remaining markdown or special characters
    let formatted = content.replace(/[*_`]/g, '');
    
    // Replace section headers with styled headers
    formatted = formatted
      .replace(/^(Possible Conditions:)/gm, '<h3 class="text-lg font-semibold text-blue-600 mt-4 mb-2">Possible Conditions:</h3>')
      .replace(/^(Recommended Actions:)/gm, '<h3 class="text-lg font-semibold text-green-600 mt-4 mb-2">Recommended Actions:</h3>')
      .replace(/^(When to Seek Immediate Medical Attention:)/gm, '<h3 class="text-lg font-semibold text-red-600 mt-4 mb-2">When to Seek Immediate Medical Attention:</h3>')
      .replace(/^(Immediate Actions:)/gm, '<h3 class="text-lg font-semibold text-blue-600 mt-4 mb-2">Immediate Actions:</h3>')
      .replace(/^(Lifestyle Modifications:)/gm, '<h3 class="text-lg font-semibold text-green-600 mt-4 mb-2">Lifestyle Modifications:</h3>')
      .replace(/^(When to Seek Professional Care:)/gm, '<h3 class="text-lg font-semibold text-orange-600 mt-4 mb-2">When to Seek Professional Care:</h3>')
      .replace(/^(Resources:)/gm, '<h3 class="text-lg font-semibold text-purple-600 mt-4 mb-2">Resources:</h3>');
    
    // Process bullet points and numbered lists
    formatted = formatted
      // Match dashes or asterisks for bullet points
      .replace(/^\s*[-*]\s+(.+)$/gm, '<li class="ml-5 list-disc mb-1">$1</li>')
      // Match numbered lists
      .replace(/^\s*(\d+)[\.\)]\s+(.+)$/gm, '<li class="ml-5 list-decimal mb-1">$2</li>');
    
    // Add paragraph tags to text blocks
    const paragraphs = formatted.split('\n\n');
    formatted = paragraphs.map(p => {
      if (p.includes('<h3') || p.includes('<li')) return p;
      return `<p class="mb-3">${p}</p>`;
    }).join('');
    
    // Replace single line breaks that are not within lists
    formatted = formatted.replace(/(?<!\<li class="ml-5 list-[^>]+>.*)\n(?!\<\/li\>)/g, '<br>');
    
    return formatted;
  };

  // Show API key error if not available
  if (!GEMINI_API_KEY) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">API Key Not Found</h1>
          <p className="text-gray-700 mb-4">
            The Gemini API key was not found in your environment variables. 
            Please make sure you have created a <code>.env</code> file in your project root with the following content:
          </p>
          <pre className="bg-gray-100 p-3 rounded mb-4 overflow-x-auto">
            VITE_GEMINI_API_KEY=your_gemini_api_key_here
          </pre>
          <p className="text-gray-700">
            After adding the API key, restart the development server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto p-4">
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-blue-700">HealthAssist AI</h1>
          <p className="text-gray-600 mt-2">Intelligent Health Assessment Powered by Gemini AI</p>
        </header>

        {/* Progress steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4, 5].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center
                  ${step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                  {stepNum}
                </div>
                <span className={`text-xs mt-2 ${step >= stepNum ? 'text-blue-600' : 'text-gray-500'}`}>
                  {stepNum === 1 && 'Category'}
                  {stepNum === 2 && 'Symptoms'}
                  {stepNum === 3 && 'Details'}
                  {stepNum === 4 && 'Assessment'}
                  {stepNum === 5 && 'Guidance'}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-1 mt-4 relative">
            <div 
              className="absolute top-0 left-0 bg-blue-600 h-1 transition-all duration-500" 
              style={{ width: `${(step - 1) * 25}%` }}
            ></div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md mb-6 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
              <p className="text-center mt-4 text-lg font-medium text-gray-700">Processing your information...</p>
              <p className="text-center mt-2 text-gray-500">This may take a moment</p>
            </div>
          </div>
        )}

        {/* Step 1: Diagnostic Type */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-xl shadow-md transition-all duration-300">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">What type of health concern are you experiencing?</h2>
            <p className="text-gray-600 mb-6">
              Select the category that best matches your symptoms. This helps us provide more accurate follow-up questions.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {diagnosticTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleDiagnosticTypeSelect(type)}
                  className="group bg-white hover:bg-blue-50 text-left p-5 rounded-lg border border-gray-200 hover:border-blue-500 transition duration-200 shadow-sm hover:shadow-md"
                >
                  <span className="font-medium text-lg text-gray-800 group-hover:text-blue-700 transition duration-200">{type}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Symptoms */}
        {step === 2 && (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Describe Your Symptoms</h2>
            <p className="text-blue-600 font-medium mb-6">
              Category: {diagnosticType}
            </p>
            <p className="text-gray-600 mb-6">
              Please provide details about your symptoms. The more information you share, the more helpful our assessment can be.
            </p>
            <form onSubmit={handleSymptomsSubmit}>
              <div className="mb-6">
                <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                  Symptom description:
                </label>
                <textarea
                  id="symptoms"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 text-gray-700"
                  placeholder="For example: I've been experiencing a sharp pain in my lower right abdomen for the past three days. The pain gets worse when I move and is accompanied by nausea. I haven't had a fever..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                ></textarea>
                <p className="text-sm text-gray-500 mt-2">
                  Include when symptoms started, their severity, and factors that make them better or worse.
                </p>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-200 transition duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
                >
                  Continue
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Follow-up Questions */}
        {step === 3 && (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Additional Information Needed</h2>
            <p className="text-blue-600 font-medium mb-6">
              Category: {diagnosticType}
            </p>
            <p className="text-gray-600 mb-6">
              Please answer these questions to help us better understand your condition:
            </p>
            <form onSubmit={handleFollowUpSubmit}>
              <div className="mb-6">
                <div className="bg-blue-50 p-6 rounded-lg mb-6 border-l-4 border-blue-500">
                  {followUpQuestions.map((question, index) => (
                    <div key={index} className="mb-4 last:mb-0">
                      <p className="text-gray-800 font-medium">
                        {index + 1}. {question}
                      </p>
                    </div>
                  ))}
                </div>
                <label htmlFor="answers" className="block text-sm font-medium text-gray-700 mb-2">
                  Your answers:
                </label>
                <textarea
                  id="answers"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-48 text-gray-700"
                  placeholder="Please provide your answers to each question above..."
                  value={followUpAnswers}
                  onChange={(e) => setFollowUpAnswers(e.target.value)}
                ></textarea>
                <p className="text-sm text-gray-500 mt-2">
                  Try to address each question specifically for the most accurate assessment.
                </p>
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-200 transition duration-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Back
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
                >
                  Get Assessment
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 4 && (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Health Assessment</h2>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Medical Disclaimer:</strong> This assessment is generated by AI and is not a medical diagnosis. Always consult with a healthcare professional for proper medical advice.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: formatContent(diagnosis) }}></div>
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(3)}
                className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-200 transition duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
              <button
                onClick={handleGetNextSteps}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
              >
                Get Personalized Guidance
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Next Steps Guidance */}
        {step === 5 && (
          <div className="bg-white p-8 rounded-xl shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Personalized Health Guidance</h2>
            <p className="text-blue-600 font-medium mb-6">
              Based on your {diagnosticType.toLowerCase()} assessment
            </p>
            
            <div className="mb-6 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-gray-200 p-6">
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: formatContent(nextSteps) }}></div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="ml-2 font-medium text-gray-800">Save Results</h3>
                </div>
                <p className="text-sm text-gray-600">Download or email this assessment to share with your healthcare provider.</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <h3 className="ml-2 font-medium text-gray-800">Find A Doctor</h3>
                </div>
                <p className="text-sm text-gray-600">Locate specialists near you who can provide expert care for your condition.</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <div className="flex items-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="ml-2 font-medium text-gray-800">Health Resources</h3>
                </div>
                <p className="text-sm text-gray-600">Access reliable information and resources about your health condition.</p>
              </div>
            </div>
            
            <div className="mt-8 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">
                    <strong>Important:</strong> If your symptoms worsen or you experience any emergency warning signs, seek immediate medical attention or call emergency services.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setStep(4)}
                className="bg-gray-100 text-gray-700 py-2 px-6 rounded-lg border border-gray-300 hover:bg-gray-200 transition duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Assessment
              </button>
              <button
                onClick={handleReset}
                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
              >
                Start a New Assessment
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Diagnosis;