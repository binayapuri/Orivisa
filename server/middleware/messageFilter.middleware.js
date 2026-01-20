// File: server/middleware/messageFilter.middleware.js

/**
 * Detects and redacts contact information from messages
 * Prevents agents and students from sharing personal contact details
 */

const Message = require('../models/Message.model');

// Regex patterns for contact information
const patterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}/g,
  whatsapp: /(?:whatsapp|wa\.me|chat\.whatsapp\.com)[\s:]*([\d\s\-\+\(\)]+)/gi,
  url: /(https?:\/\/[^\s]+)/g,
  socialMedia: /(?:@|instagram\.com\/|facebook\.com\/|linkedin\.com\/in\/)([\w\.\-]+)/gi
};

const filterMessage = (req, res, next) => {
  try {
    const originalContent = req.body.content;
    let displayContent = originalContent;
    let containsContactInfo = false;
    const detectedPatterns = [];
    
    // Check for each pattern type
    Object.keys(patterns).forEach(type => {
      const matches = originalContent.match(patterns[type]);
      
      if (matches && matches.length > 0) {
        containsContactInfo = true;
        
        matches.forEach(match => {
          detectedPatterns.push({
            type,
            value: match,
            redacted: true
          });
          
          // Redact the content
          displayContent = displayContent.replace(match, '[REDACTED]');
        });
      }
    });
    
    // Attach filtered data to request
    req.messageData = {
      originalContent,
      displayContent,
      containsContactInfo,
      detectedPatterns
    };
    
    // If critical violation, block message
    if (detectedPatterns.length >= 3) {
      return res.status(403).json({
        success: false,
        message: 'Message blocked: Multiple attempts to share contact information. All communication must occur within the platform.',
        violation: true
      });
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = filterMessage;
