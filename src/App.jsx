import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import PdfDocument from './PdfDocument';
import './index.css';

const questions = [
  { id: 'name', label: 'Name', placeholder: 'Your Full Name', description: 'PERSONAL & BUSINESS INFORMATION' },
  { id: 'email', label: 'Email Address', placeholder: 'you@example.com', description: 'PERSONAL & BUSINESS INFORMATION' },
  { id: 'businessName', label: 'Business Name', placeholder: 'Your Company Name', description: 'PERSONAL & BUSINESS INFORMATION' },
  { id: 'businessWebsite', label: 'Business Website', placeholder: 'https://', description: 'PERSONAL & BUSINESS INFORMATION (if applicable)', optional: true },
  
  { id: 'profession', label: 'I am a...', placeholder: 'e.g., Marketing Strategist', description: 'PERSONAL & BUSINESS INFORMATION' },
  { id: 'aboutClients', label: 'who helps...', placeholder: 'e.g., B2B SaaS companies', description: 'PERSONAL & BUSINESS INFORMATION' },
  { id: 'aboutGoal', label: 'achieve...', placeholder: 'e.g., 3x their lead generation', description: 'PERSONAL & BUSINESS INFORMATION' },
  { id: 'aboutPainPoints', label: 'without...', placeholder: 'e.g., spending thousands on ads', description: 'PERSONAL & BUSINESS INFORMATION' },
  { id: 'summary1', label: '', type: 'summary', group: 1 },
  
  { id: 'productName', label: 'Product Name', placeholder: 'Name of your product or service', description: 'PRODUCT DETAILS' },
  { id: 'productType', label: 'My...', placeholder: 'e.g., signature coaching program', description: 'PRODUCT DETAILS' },
  { id: 'productClients', label: 'helps...', placeholder: 'e.g., new agency owners', description: 'PRODUCT DETAILS' },
  { id: 'productGoal', label: 'achieve...', placeholder: 'e.g., consistent 10k months', description: 'PRODUCT DETAILS' },
  { id: 'productHow', label: 'by...', placeholder: 'e.g., installing a predictable acquisition system', description: 'PRODUCT DETAILS' },
  { id: 'summary2', label: '', type: 'summary', group: 2 },
  
  { id: 'included', label: 'What\'s included?', placeholder: 'List main components / features / deliverables', description: 'PRODUCT DETAILS', type: 'textarea' },
  { id: 'different', label: 'What makes it different?', placeholder: 'Explain your unique edge or value proposition', description: 'PRODUCT DETAILS (optional)', type: 'textarea', optional: true },
  
  { id: 'price', label: 'Price', placeholder: 'e.g., $997 or $99/mo', description: 'PRICING & BUSINESS DETAILS' },
  { id: 'pricingStructure', label: 'Pricing Structure', description: 'PRICING & BUSINESS DETAILS (multiple selection)', type: 'multiselect', options: ['One-time Payment', 'Installment', 'Subscription', 'Others'] },
  
  { id: 'idealClients', label: 'This is ideal for...', placeholder: 'e.g., ambitious entrepreneurs', description: 'TARGET AUDIENCE' },
  { id: 'idealSituation', label: 'who...', placeholder: 'e.g., are ready to scale', description: 'TARGET AUDIENCE' },
  { id: 'notIdealSituation', label: 'This is not ideal for...', placeholder: 'e.g., people looking for get-rich-quick schemes', description: 'TARGET AUDIENCE', optional: true },
  { id: 'summary3', label: '', type: 'summary', group: 3 },
  
  { id: 'additionalInfo', label: 'Anything else we should know?', placeholder: 'To help bring your vision to life', description: 'ADDITIONAL INFO', type: 'textarea', optional: true },
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [highestStep, setHighestStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    businessName: '',
    businessWebsite: '',
    profession: '',
    aboutClients: '',
    aboutGoal: '',
    aboutPainPoints: '',
    productName: '',
    productType: '',
    productClients: '',
    productGoal: '',
    productHow: '',
    included: '',
    different: '',
    price: '',
    pricingStructure: [],
    pricingStructureOthers: '',
    idealClients: '',
    idealSituation: '',
    notIdealSituation: '',
    additionalInfo: ''
  });
  
  const inputRef = useRef(null);
  const autofilledRef = useRef({ productType: false, productClients: false, productGoal: false, idealClients: false });
  const lastAdvanceRef = useRef(0);

  // Load draft from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('onboardingDraft_v3');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('onboardingDraft_v3', JSON.stringify(formData));
  }, [formData]);

  // Focus input on step change
  useEffect(() => {
    setTimeout(() => {
      if (questions[currentStep]?.type === 'summary') {
        // Blur any stale focused input from the previous step
        if (document.activeElement && document.activeElement !== document.body) {
          document.activeElement.blur();
        }
      } else if (inputRef.current) {
        inputRef.current.focus({ preventScroll: true });
        if (inputRef.current.tagName === 'TEXTAREA') {
          inputRef.current.style.height = 'auto';
          inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
        }
      }
    }, 100);
  }, [currentStep]);

  // Typing animation for auto-fill
  useEffect(() => {
    const startTyping = (targetField, sourceValue) => {
      if (!sourceValue || autofilledRef.current[targetField]) return;
      if (formData[targetField]) {
        autofilledRef.current[targetField] = true;
        return;
      }
      
      autofilledRef.current[targetField] = true;
      let i = 0;
      const interval = setInterval(() => {
        setFormData(prev => ({
          ...prev,
          [targetField]: sourceValue.substring(0, i + 1)
        }));
        i++;
        if (i >= sourceValue.length) clearInterval(interval);
      }, 50);
    };

    if (currentStep === 10) {
      startTyping('productType', formData.productName);
    } else if (currentStep === 11) {
      startTyping('productClients', formData.aboutClients);
    } else if (currentStep === 12) {
      startTyping('productGoal', formData.aboutGoal);
    } else if (currentStep === 19) {
      startTyping('idealClients', formData.aboutClients);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  useEffect(() => {
    if (currentStep > highestStep) {
      setHighestStep(currentStep);
    }
  }, [currentStep, highestStep]);

  // Global enter key listener for summary screens
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Enter' && !showModal) {
        // Skip if user is actively editing a contentEditable field (those have their own onKeyDown)
        if (e.target.isContentEditable) {
          return;
        }

        if (questions[currentStep]?.type === 'summary') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [currentStep, showModal, formData]);

  const validateStep = (stepIndex) => {
    const q = questions[stepIndex];
    if (q.type === 'summary') return true;
    if (q.optional) {
      // Even optional fields should validate format if filled
      const value = formData[q.id];
      if (typeof value === 'string' && value.trim().length > 0) {
        if (q.id === 'businessWebsite' && !/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(value.trim())) return false;
      }
      return true;
    }
    
    const value = formData[q.id];
    if (Array.isArray(value)) {
      if (value.length === 0) return false;
      if (value.includes('Others') && !formData[`${q.id}Others`]?.trim()) return false;
      return true;
    }
    if (!value || !value.trim()) return false;

    // Format validations
    if (q.id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return false;
    if (q.id === 'businessWebsite' && !/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(value.trim())) return false;
    if (q.id === 'price' && !/\d/.test(value.trim())) return false;

    return true;
  };

  const getErrorMessage = (stepIndex) => {
    const q = questions[stepIndex];
    const value = formData[q.id];
    
    if (typeof value !== 'string' || !value.trim()) return null;

    if (q.id === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return "Please enter a valid email address.";
    }
    if (q.id === 'businessWebsite' && !/^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$/i.test(value.trim())) {
      return "Please enter a valid website URL (e.g., example.com)";
    }
    if (q.id === 'price' && !/\d/.test(value.trim())) {
      return "Please enter a valid price containing numbers.";
    }
    return null;
  };

  const handleNext = () => {
    const now = Date.now();
    if (now - lastAdvanceRef.current < 300) return;
    if (!validateStep(currentStep)) return;
    if (currentStep < questions.length - 1) {
      lastAdvanceRef.current = now;
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (option) => {
    setFormData(prev => {
      const currentArr = Array.isArray(prev.pricingStructure) ? prev.pricingStructure : [];
      const exists = currentArr.includes(option);
      if (exists) {
        return { ...prev, pricingStructure: currentArr.filter(o => o !== option) };
      } else {
        return { ...prev, pricingStructure: [...currentArr, option] };
      }
    });
  };

  const handleFormSubmit = (e) => {
    if (e) e.preventDefault();
    if (!validateStep(currentStep)) return;
    if (currentStep < questions.length - 1) {
      handleNext();
    } else {
      setIsCompleted(true);
      setShowModal(true);
      console.log('Form Submitted', formData);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.target.tagName.toLowerCase() === 'textarea' && e.shiftKey) {
        // Allow Shift+Enter to create a new line in textareas
        return;
      }
      e.preventDefault();
      handleFormSubmit();
    }
  };

  const getFilteredQuestions = () => {
    // Return all questions except the summary questions
    return questions.filter(q => q.type !== 'summary');
  };

  const isValid = validateStep(currentStep);

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>JENESIARED | LAUNCH READY</h1>
      </div>

      {/* Navigation buttons at top right, outside form to avoid stacking context issues */}
      <div className="navigation-buttons">
        <button 
          type="button" 
          className={`btn btn-secondary ${currentStep === 0 ? 'hidden' : ''}`} 
          onClick={handleBack}
        >
          ← Back
        </button>
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={handleFormSubmit}
          disabled={!isValid}
        >
          {currentStep < questions.length - 1 ? 'Next →' : 'Review'}
        </button>
      </div>

      {/* Ray of light */}
      <div className="ray-of-light" />

      {/* Fade overlays */}
      <div className="fade-overlay-top" />
      <div className="fade-overlay-bottom" />

      <div className="progress-timeline">
        <div className="progress-timeline-track">
          <div 
            className="progress-timeline-fill" 
            style={{ width: `${isCompleted ? 100 : (currentStep / (questions.length - 1)) * 100}%` }}
          />
          {[
            { index: 0, label: 'Personal Info' },
            { index: 9, label: 'Product' },
            { index: 17, label: 'Pricing' },
            { index: 19, label: 'Audience' }
          ].map((milestone, i, arr) => {
            const position = (milestone.index / (questions.length - 1)) * 100;
            const isPassed = isCompleted || highestStep >= milestone.index;
            const isCurrent = currentStep >= milestone.index && (i === arr.length - 1 || currentStep < arr[i + 1].index);
            
            const handleMilestoneClick = () => {
              if (isCompleted) {
                setCurrentStep(milestone.index);
                return;
              }
              if (milestone.index <= highestStep) {
                // Moving to a previously reached milestone.
                // Only allow if current step is valid, OR if moving backward.
                if (milestone.index > currentStep && !validateStep(currentStep)) {
                  return;
                }
                setCurrentStep(milestone.index);
              }
            };
            
            return (
              <div 
                key={milestone.index} 
                className={`milestone-dot ${isPassed ? 'passed' : ''} ${isCurrent ? 'current' : ''}`}
                style={{ left: `${position}%`, cursor: isPassed ? 'pointer' : 'default', opacity: isPassed ? 1 : 0.5 }}
                onClick={handleMilestoneClick}
              >
                <span className="milestone-label">
                  {milestone.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="form-wrapper">
        <form onSubmit={handleFormSubmit}>
          <div className="questions-stack">
            {questions.map((q, index) => {
              const offset = index - currentStep;
              
              // Clamp visual offset to prevent massive animations that can glitch Framer Motion
              const visualOffset = Math.max(-2, Math.min(2, offset));

              const isHorizontalGroup = (index >= 4 && index <= 7) || (index >= 10 && index <= 13) || (index >= 19 && index <= 21);
              
              const isGroup1 = index >= 4 && index <= 7;
              const isGroup2 = index >= 10 && index <= 13;
              const isGroup3 = index >= 19 && index <= 21;
              
              const currentInGroup1 = currentStep >= 4 && currentStep <= 7;
              const currentInGroup2 = currentStep >= 10 && currentStep <= 13;
              const currentInGroup3 = currentStep >= 19 && currentStep <= 21;
              const currentIsHorizontal = currentInGroup1 || currentInGroup2 || currentInGroup3;
              
              const isActiveGroup = 
                (isGroup1 && currentInGroup1) || 
                (isGroup2 && currentInGroup2) ||
                (isGroup3 && currentInGroup3);

              // Only render questions within range, or in the active horizontal group
              if (Math.abs(offset) > 3 && !isActiveGroup) return null;
                
              const isLeftStacked = isHorizontalGroup && isActiveGroup && offset < 0;
              const currentIsSummary = questions[currentStep]?.type === 'summary';
              const ySpacing = currentIsSummary ? 320 : 260;
              const inactiveYOffset = 25; // Shift down to balance the invisible input at the bottom

              let x = 0;
              let y = 0;
              let opacity = 0;
              let scale = 1;

              if (offset === 0) {
                x = 0;
                y = 0;
                opacity = 1;
                scale = 1;
              } else if (offset < 0) {
                const baseIndex = isGroup2 ? 10 : isGroup3 ? 19 : 4;
                if (isLeftStacked && index === baseIndex) {
                  // This is the preview sentence itself on the left
                  x = -550;
                  y = 0;
                  opacity = 1;
                  scale = 1;
                } else {
                  // This is a previous stacked input (whether in the same horizontal group or not)
                  x = 0; 
                  y = -ySpacing * Math.abs(visualOffset) + inactiveYOffset; 
                  opacity = Math.abs(offset) > 3 ? 0 : 0.9;
                  scale = 0.85;
                }
              } else if (offset > 0) {
                x = 0; 
                y = ySpacing * visualOffset + inactiveYOffset;
                opacity = (offset === 1) ? 0.25 : 0;
                scale = 0.85;
              }

              const isCurrent = offset === 0;
              const actualQuestionNumber = questions.slice(0, index + 1).filter(qq => qq.type !== 'summary').length;
              const totalQuestions = questions.filter(qq => qq.type !== 'summary').length;

              const segmentVariants = {
                hidden: { opacity: 0.2, filter: "blur(3px)" },
                visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: "easeOut" } }
              };

              const getPreviewText = (idx, data, current) => {
                if (idx === 4) {
                  return (
                    <>
                      I am a <strong>{data.profession || '...'}</strong>
                      <motion.span initial="hidden" animate={current >= 5 ? "visible" : "hidden"} variants={segmentVariants}> who helps <strong>{data.aboutClients || '...'}</strong></motion.span>
                      <motion.span initial="hidden" animate={current >= 6 ? "visible" : "hidden"} variants={segmentVariants}> achieve <strong>{data.aboutGoal || '...'}</strong></motion.span>
                      <motion.span initial="hidden" animate={current >= 7 ? "visible" : "hidden"} variants={segmentVariants}> without <strong>{data.aboutPainPoints || '...'}</strong></motion.span>
                    </>
                  );
                }
                if (idx === 10) {
                  return (
                    <>
                      My <strong>{data.productType || '...'}</strong>
                      <motion.span initial="hidden" animate={current >= 11 ? "visible" : "hidden"} variants={segmentVariants}> helps <strong>{data.productClients || '...'}</strong></motion.span>
                      <motion.span initial="hidden" animate={current >= 12 ? "visible" : "hidden"} variants={segmentVariants}> achieve <strong>{data.productGoal || '...'}</strong></motion.span>
                      <motion.span initial="hidden" animate={current >= 13 ? "visible" : "hidden"} variants={segmentVariants}> by <strong>{data.productHow || '...'}</strong></motion.span>
                    </>
                  );
                }
                if (idx === 19) {
                  return (
                    <>
                      This is ideal for <strong>{data.idealClients || '...'}</strong>
                      <motion.span initial="hidden" animate={current >= 20 ? "visible" : "hidden"} variants={segmentVariants}> who <strong>{data.idealSituation || '...'}</strong></motion.span>
                      <motion.span initial="hidden" animate={current >= 21 ? "visible" : "hidden"} variants={segmentVariants}>
                        {data.notIdealSituation ? <> but is not ideal for <strong>{data.notIdealSituation}</strong></> : ''}
                      </motion.span>
                    </>
                  );
                }
                return null;
              };

              const getGroupLength = (idx, data) => {
                if (idx === 4 || idx === 8) return (data.profession?.length || 0) + (data.aboutClients?.length || 0) + (data.aboutGoal?.length || 0) + (data.aboutPainPoints?.length || 0);
                if (idx === 10 || idx === 14) return (data.productType?.length || 0) + (data.productClients?.length || 0) + (data.productGoal?.length || 0) + (data.productHow?.length || 0);
                if (idx === 19 || idx === 22) return (data.idealClients?.length || 0) + (data.idealSituation?.length || 0) + (data.notIdealSituation?.length || 0);
                return 0;
              };
              
              const textLength = getGroupLength(index, formData);
              let dynamicFontSize = '1.8rem';
              if (textLength > 250) dynamicFontSize = '0.9rem';
              else if (textLength > 150) dynamicFontSize = '1.1rem';
              else if (textLength > 80) dynamicFontSize = '1.35rem';
              else if (textLength > 40) dynamicFontSize = '1.6rem';
              
              let summaryFontSize = '2.25rem';
              if (textLength > 300) summaryFontSize = '1.1rem';
              else if (textLength > 200) summaryFontSize = '1.4rem';
              else if (textLength > 100) summaryFontSize = '1.7rem';
              else if (textLength > 50) summaryFontSize = '2.0rem';

              return (
                <motion.div
                  key={q.id}
                  initial={false}
                  animate={{ 
                    x, 
                    y, 
                    opacity, 
                    scale, 
                    zIndex: 10 - Math.abs(offset) 
                  }}
                  transition={{ 
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    y: { type: "spring", stiffness: 100, damping: 20 },
                    opacity: { duration: 0.3 },
                    scale: { type: "spring", stiffness: 200, damping: 25 }
                  }}
                  className="question-container"
                  style={{ 
                    pointerEvents: isCurrent ? 'auto' : 'none',
                  }}
                >
                  {isLeftStacked && index === (isGroup2 ? 10 : isGroup3 ? 19 : 4) ? (
                      <div 
                        className="preview-line active" 
                        style={{ 
                          display: 'inline-block',
                          lineHeight: '1.8',
                          maxWidth: '400px',
                          paddingRight: '1rem',
                          fontSize: dynamicFontSize,
                          transition: 'font-size 0.3s ease'
                        }}
                      >
                        {getPreviewText(index, formData, currentStep)}
                      </div>
                  ) : (
                    <>
                      {q.type !== 'summary' && (
                        <>
                          <span 
                            className="step-indicator"
                            style={{ opacity: isCurrent ? 1 : 0, transition: 'opacity 0.3s ease' }}
                          >
                            Question {actualQuestionNumber} of {totalQuestions}
                          </span>
                          <h2 className="question-label">{q.label}</h2>
                          {q.description && <p className="question-description">{q.description}</p>}
                        </>
                      )}
                      
                      <div style={{ opacity: isCurrent ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                        {q.type === 'summary' ? (
                          <div className="summary-statement">
                            {q.id === 'summary1' && (
                              <p style={{ fontSize: summaryFontSize, transition: 'font-size 0.3s ease' }}>
                                I am a <strong className={isCurrent ? "editable-text" : ""} contentEditable={isCurrent} suppressContentEditableWarning onBlur={(e) => isCurrent && handleChange({ target: { name: 'profession', value: e.currentTarget.textContent } })} onKeyDown={isCurrent ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); handleNext(); } } : undefined}>{formData.profession || '___'}</strong> who helps <strong className={isCurrent ? "editable-text" : ""} contentEditable={isCurrent} suppressContentEditableWarning onBlur={(e) => isCurrent && handleChange({ target: { name: 'aboutClients', value: e.currentTarget.textContent } })} onKeyDown={isCurrent ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); handleNext(); } } : undefined}>{formData.aboutClients || '___'}</strong> achieve <strong className={isCurrent ? "editable-text" : ""} contentEditable={isCurrent} suppressContentEditableWarning onBlur={(e) => isCurrent && handleChange({ target: { name: 'aboutGoal', value: e.currentTarget.textContent } })} onKeyDown={isCurrent ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); handleNext(); } } : undefined}>{formData.aboutGoal || '___'}</strong> without <strong className={isCurrent ? "editable-text" : ""} contentEditable={isCurrent} suppressContentEditableWarning onBlur={(e) => isCurrent && handleChange({ target: { name: 'aboutPainPoints', value: e.currentTarget.textContent } })} onKeyDown={isCurrent ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); handleNext(); } } : undefined}>{formData.aboutPainPoints || '___'}</strong>.
                              </p>
                            )}
                            {q.id === 'summary2' && (
                              <p style={{ fontSize: summaryFontSize, transition: 'font-size 0.3s ease' }}>
                                My <strong className={isCurrent ? "editable-text" : ""} contentEditable={isCurrent} suppressContentEditableWarning onBlur={(e) => isCurrent && handleChange({ target: { name: 'productType', value: e.currentTarget.textContent } })} onKeyDown={isCurrent ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); handleNext(); } } : undefined}>{formData.productType || '___'}</strong> helps <strong className={isCurrent ? "editable-text" : ""} contentEditable={isCurrent} suppressContentEditableWarning onBlur={(e) => isCurrent && handleChange({ target: { name: 'productClients', value: e.currentTarget.textContent } })} onKeyDown={isCurrent ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); handleNext(); } } : undefined}>{formData.productClients || '___'}</strong> achieve <strong className={isCurrent ? "editable-text" : ""} contentEditable={isCurrent} suppressContentEditableWarning onBlur={(e) => isCurrent && handleChange({ target: { name: 'productGoal', value: e.currentTarget.textContent } })} onKeyDown={isCurrent ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); handleNext(); } } : undefined}>{formData.productGoal || '___'}</strong> by <strong className={isCurrent ? "editable-text" : ""} contentEditable={isCurrent} suppressContentEditableWarning onBlur={(e) => isCurrent && handleChange({ target: { name: 'productHow', value: e.currentTarget.textContent } })} onKeyDown={isCurrent ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); handleNext(); } } : undefined}>{formData.productHow || '___'}</strong>.
                              </p>
                            )}
                            {q.id === 'summary3' && (
                              <p style={{ fontSize: summaryFontSize, transition: 'font-size 0.3s ease' }}>
                                This is ideal for <strong className={isCurrent ? "editable-text" : ""} contentEditable={isCurrent} suppressContentEditableWarning onBlur={(e) => isCurrent && handleChange({ target: { name: 'idealClients', value: e.currentTarget.textContent } })} onKeyDown={isCurrent ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); handleNext(); } } : undefined}>{formData.idealClients || '___'}</strong> who <strong className={isCurrent ? "editable-text" : ""} contentEditable={isCurrent} suppressContentEditableWarning onBlur={(e) => isCurrent && handleChange({ target: { name: 'idealSituation', value: e.currentTarget.textContent } })} onKeyDown={isCurrent ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); handleNext(); } } : undefined}>{formData.idealSituation || '___'}</strong>
                                <span style={{ display: formData.notIdealSituation ? 'inline' : 'none' }}> but is not ideal for <strong className={isCurrent ? "editable-text" : ""} contentEditable={isCurrent} suppressContentEditableWarning onBlur={(e) => isCurrent && handleChange({ target: { name: 'notIdealSituation', value: e.currentTarget.textContent } })} onKeyDown={isCurrent ? (e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); handleNext(); } } : undefined}>{formData.notIdealSituation || '___'}</strong></span>.
                              </p>
                            )}
                          </div>
                        ) : q.type === 'multiselect' ? (
                          <div className="pills-container" style={{ alignItems: 'center' }}>
                            {q.options.map(option => (
                              <button
                                key={option}
                                type="button"
                                className={`pill-btn ${(formData[q.id] || []).includes(option) ? 'selected' : ''}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (isCurrent) handleMultiSelect(option);
                                }}
                                tabIndex={isCurrent ? 0 : -1}
                                style={{ pointerEvents: 'auto' }}
                              >
                                {option}
                              </button>
                            ))}
                            <AnimatePresence>
                              {(formData[q.id] || []).includes('Others') && (
                                <motion.input
                                  initial={{ opacity: 0, scale: 0.9, width: 0 }}
                                  animate={{ opacity: 1, scale: 1, width: 250 }}
                                  exit={{ opacity: 0, scale: 0.9, width: 0 }}
                                  type="text"
                                  name={`${q.id}Others`}
                                  className="line-input"
                                  style={{ 
                                    fontSize: '1.25rem', 
                                    borderBottom: '2px solid var(--primary-color)',
                                    padding: '0.5rem 1rem',
                                    minWidth: 0,
                                    flex: '1 1 auto',
                                    margin: 0
                                  }}
                                  placeholder="Please specify..."
                                  value={formData[`${q.id}Others`] || ''}
                                  onChange={isCurrent ? handleChange : undefined}
                                  onKeyDown={isCurrent ? handleKeyDown : undefined}
                                  readOnly={!isCurrent}
                                  tabIndex={isCurrent ? 0 : -1}
                                  autoFocus
                                />
                              )}
                            </AnimatePresence>
                          </div>
                        ) : q.type === 'textarea' ? (
                          <textarea
                            ref={isCurrent ? inputRef : null}
                            name={q.id}
                            className="line-textarea"
                            placeholder={q.placeholder}
                            value={formData[q.id]}
                            onChange={(e) => {
                              e.target.style.height = 'auto';
                              e.target.style.height = e.target.scrollHeight + 'px';
                              if (isCurrent && handleChange) handleChange(e);
                            }}
                            onKeyDown={isCurrent ? handleKeyDown : undefined}
                            readOnly={!isCurrent}
                            tabIndex={isCurrent ? 0 : -1}
                            rows={1}
                          />
                        ) : (
                          <input
                            ref={isCurrent ? inputRef : null}
                            type="text"
                            name={q.id}
                            className="line-input"
                            placeholder={q.placeholder}
                            value={formData[q.id]}
                            onChange={isCurrent ? handleChange : undefined}
                            onKeyDown={isCurrent ? handleKeyDown : undefined}
                            readOnly={!isCurrent}
                            tabIndex={isCurrent ? 0 : -1}
                            autoComplete="off"
                          />
                        )}
                        {q.type !== 'summary' && (
                          <div className="enter-hint" style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--text-light)', opacity: 0.6, letterSpacing: '0.5px' }}>
                            Press <strong>Enter ↵</strong>
                          </div>
                        )}
                        <AnimatePresence>
                          {isCurrent && getErrorMessage(index) && (
                            <motion.div 
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              style={{ color: '#ff4d4f', fontSize: '0.85rem', marginTop: '0.5rem', position: 'absolute' }}
                            >
                              {getErrorMessage(index)}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </form>
      </div>

      <AnimatePresence>
        {showModal && (() => {
          const sections = [
            { title: 'Personal Info', indices: [0, 1, 2, 3], summary: { id: 'summary1' } },
            { title: 'Product', indices: [9, 15, 16], summary: { id: 'summary2' } },
            { title: 'Pricing', indices: [17, 18] },
            { title: 'Audience', indices: [], summary: { id: 'summary3' } },
            { title: 'Additional', indices: [23] },
          ];
          return (
            <div className="modal-overlay">
              <motion.div 
                className="modal-content"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <h2>Review Your Information</h2>
                <div className="modal-scroll-area">
                  {sections.map((section, si) => (
                    <div key={si} className="modal-section">
                      <h3 className="modal-section-title">{section.title}</h3>
                      <div className="modal-summary-list">
                        {section.indices.map(idx => {
                          const q = questions[idx];
                          if (!q) return null;
                          const answer = formData[q.id];
                          let displayAnswer = answer;
                          
                          if (Array.isArray(answer)) {
                            displayAnswer = answer.map(a => a === 'Others' && formData[`${q.id}Others`] ? formData[`${q.id}Others`] : a).join(', ');
                          }
                          
                          return (
                            <div key={q.id} className="summary-item">
                              <span className="summary-label">{q.label}</span>
                              <span 
                                className="summary-value editable-text"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(e) => {
                                  const val = e.currentTarget.textContent;
                                  if (q.type === 'multiselect') {
                                    const arr = val.split(',').map(s => s.trim()).filter(Boolean);
                                    handleChange({ target: { name: q.id, value: arr } });
                                  } else {
                                    handleChange({ target: { name: q.id, value: val } });
                                  }
                                }}
                              >
                                {displayAnswer}
                              </span>
                            </div>
                          );
                        })}
                        
                        {section.summary && (
                          <div className="summary-item full-width-summary">
                            <span className="summary-value">
                              {section.summary.id === 'summary1' && (
                                <>
                                  I am a <strong className="editable-text" contentEditable suppressContentEditableWarning onBlur={(e) => handleChange({ target: { name: 'profession', value: e.currentTarget.textContent } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>{formData.profession || ''}</strong> who helps <strong className="editable-text" contentEditable suppressContentEditableWarning onBlur={(e) => handleChange({ target: { name: 'aboutClients', value: e.currentTarget.textContent } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>{formData.aboutClients || ''}</strong> achieve <strong className="editable-text" contentEditable suppressContentEditableWarning onBlur={(e) => handleChange({ target: { name: 'aboutGoal', value: e.currentTarget.textContent } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>{formData.aboutGoal || ''}</strong> without <strong className="editable-text" contentEditable suppressContentEditableWarning onBlur={(e) => handleChange({ target: { name: 'aboutPainPoints', value: e.currentTarget.textContent } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>{formData.aboutPainPoints || ''}</strong>.
                                </>
                              )}
                              {section.summary.id === 'summary2' && (
                                <>
                                  My <strong className="editable-text" contentEditable suppressContentEditableWarning onBlur={(e) => handleChange({ target: { name: 'productType', value: e.currentTarget.textContent } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>{formData.productType || ''}</strong> helps <strong className="editable-text" contentEditable suppressContentEditableWarning onBlur={(e) => handleChange({ target: { name: 'productClients', value: e.currentTarget.textContent } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>{formData.productClients || ''}</strong> achieve <strong className="editable-text" contentEditable suppressContentEditableWarning onBlur={(e) => handleChange({ target: { name: 'productGoal', value: e.currentTarget.textContent } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>{formData.productGoal || ''}</strong> by <strong className="editable-text" contentEditable suppressContentEditableWarning onBlur={(e) => handleChange({ target: { name: 'productHow', value: e.currentTarget.textContent } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>{formData.productHow || ''}</strong>.
                                </>
                              )}
                              {section.summary.id === 'summary3' && (
                                <>
                                  This is ideal for <strong className="editable-text" contentEditable suppressContentEditableWarning onBlur={(e) => handleChange({ target: { name: 'idealClients', value: e.currentTarget.textContent } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>{formData.idealClients || ''}</strong> who <strong className="editable-text" contentEditable suppressContentEditableWarning onBlur={(e) => handleChange({ target: { name: 'idealSituation', value: e.currentTarget.textContent } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>{formData.idealSituation || ''}</strong>
                                  <span style={{ display: formData.notIdealSituation ? 'inline' : 'none' }}> but is not ideal for <strong className="editable-text" contentEditable suppressContentEditableWarning onBlur={(e) => handleChange({ target: { name: 'notIdealSituation', value: e.currentTarget.textContent } })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}>{formData.notIdealSituation || ''}</strong></span>.
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="modal-actions">
                  <button className="modal-close-btn" onClick={() => setShowModal(false)} disabled={isSubmitting}>
                    Close
                  </button>
                  <button className="btn-primary modal-submit-btn" disabled={isSubmitting} onClick={async () => {
                    setIsSubmitting(true);
                    try {
                      // Generate PDF
                      const blob = await pdf(<PdfDocument formData={formData} />).toBlob();
                      
                      // Send to n8n Webhook
                      const safeName = (formData.name || 'Client').trim().replace(/[^a-zA-Z0-9]/g, '-');
                      const safeBiz = (formData.businessName || 'Business').trim().replace(/[^a-zA-Z0-9]/g, '-');
                      const fileName = `${safeName}-${safeBiz}.pdf`;
                      
                      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL;
                      if (!webhookUrl) {
                        throw new Error("Webhook URL is not defined in .env");
                      }

                      const payload = new FormData();
                      payload.append('file', blob, fileName);
                      
                      // Also append all raw form data just in case n8n needs it
                      payload.append('formData', JSON.stringify(formData));

                      const response = await fetch(webhookUrl, {
                        method: 'POST',
                        body: payload,
                      });

                      if (!response.ok) {
                        throw new Error(`Webhook failed with status: ${response.status}`);
                      }

                      console.log('Webhook Success');
                      setShowModal(false);
                      setShowSuccessModal(true);
                    } catch (error) {
                      console.error('Submission Error:', error);
                      alert(`An error occurred: ${error.message}`);
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}>
                    {isSubmitting ? 'Processing...' : 'Submit'}
                  </button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <div className="modal-overlay">
            <motion.div 
              className="modal-content"
              style={{ height: 'auto', padding: '4rem 3rem', textAlign: 'center', alignItems: 'center', maxWidth: '500px', justifyContent: 'center' }}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
            >
              <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="var(--primary-color)" strokeWidth="1" fill="rgba(230, 57, 104, 0.05)" />
                  <path d="M8 12.5L10.5 15L16 9" stroke="var(--primary-color)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem', fontSize: '2rem', fontWeight: '400', letterSpacing: '2px' }}>SUCCESS</h2>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-light)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                Your information was successfully submitted.
              </p>
              <button 
                className="btn-primary" 
                style={{ width: '100%', padding: '1rem', border: 'none', borderRadius: '50px', fontSize: '1.1rem', letterSpacing: '1px' }}
                onClick={() => {
                  setShowSuccessModal(false);
                }}
              >
                DONE
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
