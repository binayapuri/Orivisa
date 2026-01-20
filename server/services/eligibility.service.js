// File: server/services/eligibility.service.js

const College = require('../models/College.model');

class EligibilityService {
  async checkEligibility(studentData) {
    const {
      academicBackground,
      englishTest,
      workExperience,
      preferences,
      currentVisa
    } = studentData;

    const results = {
      eligiblePrograms: [],
      recommendations: [],
      warnings: [],
      requirements: {}
    };

    // Check academic eligibility
    const highestEducation = this.getHighestEducation(academicBackground);
    
    // English requirements
    const englishScore = englishTest?.overallScore || 0;
    const englishMeetsRequirement = this.checkEnglishRequirement(
      englishTest?.testType,
      englishScore
    );

    if (!englishMeetsRequirement) {
      results.warnings.push({
        type: 'english',
        message: 'English test score may not meet minimum requirements for some programs',
        action: 'Consider retaking test or exploring alternative pathways'
      });
    }

    // Query eligible colleges/programs
    const programs = await College.aggregate([
      { $unwind: '$programs' },
      {
        $match: {
          'programs.level': preferences.studyLevel,
          'programs.entryRequirements.minimumGPA': { 
            $lte: this.calculateGPA(academicBackground) 
          },
          'programs.tuitionFee': {
            $gte: preferences.budget?.min || 0,
            $lte: preferences.budget?.max || 999999
          }
        }
      },
      {
        $project: {
          institutionName: 1,
          country: 1,
          program: '$programs',
          matchScore: { $literal: 0 }
        }
      }
    ]);

    // Calculate match scores
    programs.forEach(program => {
      let score = 0;

      // Location preference
      if (preferences.preferredCountries?.includes(program.country)) {
        score += 30;
      }

      // Field of study match
      if (preferences.preferredCourses?.some(c => 
        program.program.name.toLowerCase().includes(c.toLowerCase())
      )) {
        score += 40;
      }

      // Budget fit
      const budgetMid = (preferences.budget.min + preferences.budget.max) / 2;
      const budgetDiff = Math.abs(program.program.tuitionFee - budgetMid);
      score += Math.max(0, 30 - (budgetDiff / budgetMid * 30));

      program.matchScore = Math.round(score);
    });

    results.eligiblePrograms = programs
      .filter(p => p.matchScore >= 50)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);

    // Generate recommendations
    if (results.eligiblePrograms.length === 0) {
      results.recommendations.push({
        type: 'criteria',
        message: 'No programs match your exact criteria',
        action: 'Consider expanding budget range or exploring alternative countries'
      });
    }

    // Visa pathway recommendations
    if (currentVisa?.type) {
      results.recommendations.push({
        type: 'visa',
        message: `Current ${currentVisa.type} visa holders may have streamlined pathways`,
        action: 'Consult with a migration agent about onshore application benefits'
      });
    }

    return results;
  }

  getHighestEducation(educationArray) {
    const levels = { high_school: 1, diploma: 2, bachelor: 3, master: 4, phd: 5 };
    return educationArray.reduce((highest, edu) => {
      return levels[edu.level] > levels[highest.level] ? edu : highest;
    }, educationArray[0] || {});
  }

  checkEnglishRequirement(testType, score) {
    const minimums = {
      IELTS: 6.5,
      PTE: 58,
      TOEFL: 79,
      Duolingo: 105
    };
    return score >= (minimums[testType] || 999);
  }

  calculateGPA(educationArray) {
    if (!educationArray || educationArray.length === 0) return 0;
    const validGPAs = educationArray.filter(e => e.gpa).map(e => e.gpa);
    return validGPAs.length > 0 
      ? validGPAs.reduce((sum, gpa) => sum + gpa, 0) / validGPAs.length 
      : 0;
  }
}

module.exports = new EligibilityService();
