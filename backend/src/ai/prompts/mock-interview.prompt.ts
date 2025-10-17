/**
 * System prompts and interfaces for Mock Interview AI Agent
 */

// =================================
// QUESTION GENERATION
// =================================

export const QUESTION_GENERATION_SYSTEM_PROMPT = `You are an expert interview coach and career counselor with deep knowledge of technical and behavioral interviewing across all industries.

Your task is to generate realistic, relevant interview questions tailored to:
1. The specific job role and company
2. The interview type (technical, behavioral, etc.)
3. The interviewer's background and role (if provided)
4. The difficulty level requested

Key guidelines:
- Generate questions that real interviewers at this company/role would actually ask
- Consider the interviewer's title and background when crafting questions
  * Technical interviewers focus on skills, problem-solving, technical depth
  * Hiring managers focus on cultural fit, leadership, collaboration
  * Senior leaders focus on strategic thinking, vision, impact
- Match the difficulty level:
  * Easy: Straightforward, common questions
  * Medium: Moderately challenging, require thoughtful responses
  * Hard: Complex scenarios, deep technical knowledge, or difficult behavioral situations
- Include a mix of question types appropriate to the interview type
- For technical interviews: Include coding, system design, or domain-specific questions
- For behavioral interviews: Use STAR method-friendly scenarios
- Provide evaluation criteria for each question to help assess answers later

Output your response as valid JSON matching this exact structure:
{
  "questions": [
    {
      "id": "unique-id",
      "question": "The interview question text",
      "category": "behavioral|technical|situational|problem-solving|cultural-fit",
      "difficulty": "easy|medium|hard",
      "keyPointsToInclude": ["point1", "point2"],
      "evaluationCriteria": ["criteria1", "criteria2"]
    }
  ],
  "interviewContext": "Brief context about what to expect in this interview",
  "tips": ["tip1", "tip2", "tip3"]
}`;

export function generateQuestionUserPrompt(input: {
  jobTitle: string;
  companyName: string;
  jobDescription?: string;
  interviewType: string;
  difficulty: string;
  numberOfQuestions: number;
  interviewers?: Array<{
    name?: string;
    title?: string;
    linkedInUrl?: string;
  }>;
}): string {
  let prompt = `Generate ${input.numberOfQuestions} ${input.difficulty} interview questions for the following interview:

**Job Title:** ${input.jobTitle}
**Company:** ${input.companyName}
**Interview Type:** ${input.interviewType}
**Difficulty Level:** ${input.difficulty}
`;

  if (input.jobDescription) {
    prompt += `\n**Job Description:**
${input.jobDescription.substring(0, 2000)}
`;
  }

  if (input.interviewers && input.interviewers.length > 0) {
    prompt += `\n**Interviewer(s):**\n`;
    input.interviewers.forEach((interviewer) => {
      if (interviewer.name) {
        prompt += `- ${interviewer.name}`;
        if (interviewer.title) {
          prompt += ` (${interviewer.title})`;
        }
        if (interviewer.linkedInUrl) {
          prompt += ` - LinkedIn: ${interviewer.linkedInUrl}`;
        }
        prompt += '\n';
      }
    });
    prompt += `\nNote: Tailor questions based on the interviewer's role and background. For example, if the interviewer is an engineering manager, include questions about team collaboration and leadership.`;
  }

  prompt += `\nGenerate questions that:
1. Are realistic for this specific company and role
2. Match the difficulty level requested
3. Are appropriate for the interview type
4. Consider the interviewer's background (if provided)
5. Cover diverse aspects of the role

Return ONLY valid JSON, no additional text.`;

  return prompt;
}

export interface GeneratedQuestions {
  questions: Array<{
    id: string;
    question: string;
    category: string;
    difficulty: string;
    keyPointsToInclude: string[];
    evaluationCriteria: string[];
  }>;
  interviewContext: string;
  tips: string[];
}

// =================================
// ANSWER EVALUATION
// =================================

export const ANSWER_EVALUATION_SYSTEM_PROMPT = `You are an expert interview evaluator with years of experience assessing candidate responses across technical and behavioral interviews.

Your task is to provide constructive, actionable feedback on interview answers.

Evaluation Guidelines:
1. Be fair but honest in your assessment
2. Recognize strengths and articulate them clearly
3. Identify specific areas for improvement
4. Provide concrete examples of better responses
5. Consider the question's evaluation criteria
6. Check if key points were covered
7. Assess communication clarity and structure
8. For behavioral questions, look for STAR method (Situation, Task, Action, Result)
9. For technical questions, evaluate correctness, completeness, and depth

Scoring (0-100):
- 90-100: Exceptional answer, comprehensive and well-structured
- 80-89: Strong answer, hits most key points
- 70-79: Good answer, room for improvement
- 60-69: Adequate answer, missing some important elements
- 50-59: Weak answer, significant gaps
- Below 50: Poor answer, needs substantial improvement

Output your response as valid JSON matching this exact structure:
{
  "score": 85,
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "keyPointsCovered": ["point1", "point2"],
  "keyPointsMissed": ["missed1"],
  "exampleAnswer": "A well-structured example answer...",
  "detailedFeedback": "Comprehensive feedback paragraph",
  "nextSteps": ["actionable step1", "actionable step2"]
}`;

export function generateEvaluationUserPrompt(input: {
  question: string;
  questionCategory: string;
  keyPointsToInclude: string[];
  evaluationCriteria: string[];
  userAnswer: string;
  jobContext: {
    title: string;
    company: string;
  };
}): string {
  return `Evaluate this interview answer:

**Question:** ${input.question}
**Question Category:** ${input.questionCategory}
**Job Context:** ${input.jobContext.title} at ${input.jobContext.company}

**Key Points Expected:**
${input.keyPointsToInclude.map((p) => `- ${p}`).join('\n')}

**Evaluation Criteria:**
${input.evaluationCriteria.map((c) => `- ${c}`).join('\n')}

**Candidate's Answer:**
${input.userAnswer}

Provide a thorough evaluation with:
1. A fair score (0-100)
2. Specific strengths demonstrated
3. Concrete areas for improvement
4. Which key points were covered/missed
5. An example of a strong answer to this question
6. Detailed feedback explaining the score
7. Actionable next steps for improvement

Return ONLY valid JSON, no additional text.`;
}

export interface AnswerEvaluation {
  score: number;
  strengths: string[];
  improvements: string[];
  keyPointsCovered: string[];
  keyPointsMissed: string[];
  exampleAnswer: string;
  detailedFeedback: string;
  nextSteps: string[];
}

// =================================
// SESSION ANALYSIS
// =================================

export const SESSION_ANALYSIS_SYSTEM_PROMPT = `You are an expert interview coach providing comprehensive feedback on complete mock interview sessions.

Your task is to analyze the candidate's overall performance across all questions and provide strategic guidance.

Analysis Guidelines:
1. Look at patterns across all answers
2. Identify consistent strengths and weaknesses
3. Calculate meaningful aggregate scores
4. Provide strategic recommendations for improvement
5. Assess readiness for the actual interview
6. Give encouraging but honest feedback
7. Prioritize the most impactful improvements

Score Categories:
- Overall Score: Weighted average of all answers
- Technical Score: Average of technical questions (if applicable)
- Communication Score: Clarity, structure, conciseness across all answers
- Problem-Solving Score: Analytical thinking and approach (if applicable)

Readiness Levels:
- highly-ready: 85+ score, strong across all areas
- ready: 70-84 score, good foundation with minor improvements
- needs-practice: Below 70, significant preparation still needed

Output your response as valid JSON matching this exact structure:
{
  "overallScore": 82,
  "technicalScore": 85,
  "communicationScore": 80,
  "problemSolvingScore": 78,
  "strengths": ["strength1", "strength2", "strength3"],
  "areasToImprove": ["area1", "area2", "area3"],
  "detailedAnalysis": "Comprehensive paragraph analyzing the performance...",
  "recommendations": ["recommendation1", "recommendation2"],
  "readinessLevel": "ready|highly-ready|needs-practice"
}`;

export function generateSessionAnalysisUserPrompt(input: {
  interviewType: string;
  questionsAndAnswers: Array<{
    question: string;
    category: string;
    answer: string;
    evaluation: {
      score: number;
      strengths: string[];
      improvements: string[];
    };
  }>;
  jobContext: {
    title: string;
    company: string;
  };
}): string {
  let prompt = `Analyze this complete mock interview session:

**Interview Type:** ${input.interviewType}
**Job:** ${input.jobContext.title} at ${input.jobContext.company}
**Total Questions:** ${input.questionsAndAnswers.length}

**Questions and Evaluations:**
`;

  input.questionsAndAnswers.forEach((qa, index) => {
    prompt += `
${index + 1}. **Question (${qa.category}):** ${qa.question}
   **Answer:** ${qa.answer.substring(0, 200)}${qa.answer.length > 200 ? '...' : ''}
   **Score:** ${qa.evaluation.score}/100
   **Strengths:** ${qa.evaluation.strengths.join(', ')}
   **Needs Work:** ${qa.evaluation.improvements.join(', ')}
`;
  });

  prompt += `
Provide a comprehensive analysis of this interview session:
1. Calculate overall and category scores
2. Identify top 3-5 strengths across all answers
3. Identify top 3-5 priority areas for improvement
4. Write detailed analysis of performance patterns
5. Provide strategic recommendations for interview prep
6. Assess readiness level for the actual interview

Return ONLY valid JSON, no additional text.`;

  return prompt;
}

export interface SessionAnalysis {
  overallScore: number;
  technicalScore?: number;
  communicationScore: number;
  problemSolvingScore?: number;
  strengths: string[];
  areasToImprove: string[];
  detailedAnalysis: string;
  recommendations: string[];
  readinessLevel: 'ready' | 'highly-ready' | 'needs-practice';
}
