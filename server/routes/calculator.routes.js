// File: server/routes/calculator.routes.js

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');

// @desc    Calculate PR Points (Skilled Migration 2026 Rules)
// @route   POST /api/calculator/pr-points
// @access  Private
router.post('/pr-points', protect, authorize('student', 'agent', 'admin'), (req, res) => {
  try {
    const {
      age,
      englishProficiency,
      australianEducation,
      overseasEducation,
      australianWorkExperience,
      overseasWorkExperience,
      nominatedSkillOccupation,
      partnerSkills,
      professionalYear,
      naati,
      regionalStudy,
      communityLanguage,
      stateNomination,
      specialistEducation
    } = req.body;

    let points = 0;
    const breakdown = [];

    // Age Points (2026 Rules)
    if (age >= 18 && age <= 24) {
      points += 25;
      breakdown.push({ category: 'Age (18-24)', points: 25 });
    } else if (age >= 25 && age <= 32) {
      points += 30;
      breakdown.push({ category: 'Age (25-32)', points: 30 });
    } else if (age >= 33 && age <= 39) {
      points += 25;
      breakdown.push({ category: 'Age (33-39)', points: 25 });
    } else if (age >= 40 && age <= 44) {
      points += 15;
      breakdown.push({ category: 'Age (40-44)', points: 15 });
    }

    // English Proficiency
    if (englishProficiency === 'superior') {
      points += 20;
      breakdown.push({ category: 'English (Superior - IELTS 8)', points: 20 });
    } else if (englishProficiency === 'proficient') {
      points += 10;
      breakdown.push({ category: 'English (Proficient - IELTS 7)', points: 10 });
    } else if (englishProficiency === 'competent') {
      points += 0;
      breakdown.push({ category: 'English (Competent - IELTS 6)', points: 0 });
    }

    // Australian Education
    if (australianEducation === 'phd') {
      points += 20;
      breakdown.push({ category: 'Australian PhD', points: 20 });
    } else if (australianEducation === 'bachelor_master') {
      points += 15;
      breakdown.push({ category: 'Australian Bachelor/Master', points: 15 });
    } else if (australianEducation === 'diploma_trade') {
      points += 10;
      breakdown.push({ category: 'Australian Diploma/Trade', points: 10 });
    }

    // Overseas Education
    if (overseasEducation === 'phd') {
      points += 20;
      breakdown.push({ category: 'Overseas PhD', points: 20 });
    } else if (overseasEducation === 'bachelor_master') {
      points += 15;
      breakdown.push({ category: 'Overseas Bachelor/Master', points: 15 });
    }

    // Australian Work Experience (Skilled)
    if (australianWorkExperience >= 8) {
      points += 20;
      breakdown.push({ category: 'Australian Work (8+ years)', points: 20 });
    } else if (australianWorkExperience >= 5) {
      points += 15;
      breakdown.push({ category: 'Australian Work (5-7 years)', points: 15 });
    } else if (australianWorkExperience >= 3) {
      points += 10;
      breakdown.push({ category: 'Australian Work (3-4 years)', points: 10 });
    } else if (australianWorkExperience >= 1) {
      points += 5;
      breakdown.push({ category: 'Australian Work (1-2 years)', points: 5 });
    }

    // Overseas Work Experience (Skilled)
    if (overseasWorkExperience >= 8) {
      points += 15;
      breakdown.push({ category: 'Overseas Work (8+ years)', points: 15 });
    } else if (overseasWorkExperience >= 5) {
      points += 10;
      breakdown.push({ category: 'Overseas Work (5-7 years)', points: 10 });
    } else if (overseasWorkExperience >= 3) {
      points += 5;
      breakdown.push({ category: 'Overseas Work (3-4 years)', points: 5 });
    }

    // Other factors
    if (nominatedSkillOccupation) {
      points += 0;
      breakdown.push({ category: 'Nominated Skill Occupation', points: 0, note: 'Mandatory' });
    }

    if (partnerSkills) {
      points += 10;
      breakdown.push({ category: 'Partner Skills', points: 10 });
    }

    if (professionalYear) {
      points += 5;
      breakdown.push({ category: 'Professional Year', points: 5 });
    }

    if (naati) {
      points += 5;
      breakdown.push({ category: 'NAATI Credential', points: 5 });
    }

    if (regionalStudy) {
      points += 5;
      breakdown.push({ category: 'Regional Study', points: 5 });
    }

    if (communityLanguage) {
      points += 5;
      breakdown.push({ category: 'Community Language', points: 5 });
    }

    if (stateNomination === '190') {
      points += 5;
      breakdown.push({ category: 'State Nomination (190)', points: 5 });
    } else if (stateNomination === '491') {
      points += 15;
      breakdown.push({ category: 'State Nomination (491)', points: 15 });
    }

    if (specialistEducation) {
      points += 10;
      breakdown.push({ category: 'Specialist Education', points: 10 });
    }

    // Eligibility assessment
    const eligibility = {
      subclass189: points >= 65 ? 'Eligible' : 'Not Eligible (need 65 points)',
      subclass190: points >= 60 ? 'Eligible with state nomination (+5)' : 'Not Eligible',
      subclass491: points >= 50 ? 'Eligible with regional nomination (+15)' : 'Not Eligible'
    };

    res.json({
      success: true,
      totalPoints: points,
      breakdown,
      eligibility,
      recommendations: generateRecommendations(points, req.body),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper function for recommendations
function generateRecommendations(currentPoints, data) {
  const recommendations = [];

  if (currentPoints < 65) {
    if (!data.professionalYear) {
      recommendations.push({
        action: 'Complete Professional Year',
        potentialPoints: 5,
        timeframe: '1 year',
        priority: 'High'
      });
    }

    if (!data.naati) {
      recommendations.push({
        action: 'Obtain NAATI Credential',
        potentialPoints: 5,
        timeframe: '3-6 months',
        priority: 'Medium'
      });
    }

    if (data.englishProficiency !== 'superior') {
      recommendations.push({
        action: 'Improve English to Superior (IELTS 8)',
        potentialPoints: data.englishProficiency === 'proficient' ? 10 : 20,
        timeframe: '6-12 months',
        priority: 'High'
      });
    }

    if (data.australianWorkExperience < 3) {
      recommendations.push({
        action: 'Gain Australian work experience',
        potentialPoints: '5-20 (depending on years)',
        timeframe: '1-5 years',
        priority: 'High'
      });
    }

    recommendations.push({
      action: 'Consider State Nomination (190 or 491)',
      potentialPoints: '5-15',
      timeframe: '3-6 months',
      priority: 'Medium'
    });
  }

  return recommendations;
}

module.exports = router;
