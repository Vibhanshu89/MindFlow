const OpenAI = require('openai');
const Standup = require('../models/Standup');
const Task = require('../models/Task');
const Project = require('../models/Project');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Helper: call OpenAI with a prompt
 */
const callAI = async (systemPrompt, userContent, model = 'gpt-4o-mini') => {
  const response = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });
  return response.choices[0].message.content;
};

/**
 * @route   POST /api/ai/standup
 * @desc    Submit standup and get AI analysis
 * @access  Private
 */
const analyzeStandup = async (req, res, next) => {
  try {
    const { yesterday, today, blockers, projectId } = req.body;

    const prompt = `
You are an expert agile coach. Analyze the following team standup update and provide structured insights.

Team Member: ${req.user.name}
Project: This is a software development project

Yesterday: ${yesterday}
Today: ${today}
Blockers: ${blockers || 'None'}

Provide your analysis in the following JSON format:
{
  "summary": "Brief 2-3 sentence summary of their work and plans",
  "blockers": ["list of identified blockers"],
  "suggestions": ["list of actionable improvements or suggestions"],
  "sentiment": "positive | neutral | negative | concerning",
  "insights": "Additional coaching insights"
}`;

    let aiResult = {
      summary: 'AI analysis unavailable - check your OpenAI API key',
      blockers: blockers ? [blockers] : [],
      suggestions: ['Please configure your OpenAI API key in .env'],
      sentiment: 'neutral',
      insights: '',
    };

    try {
      const aiResponse = await callAI(
        'You are an expert agile coach. Always respond with valid JSON only.',
        prompt
      );
      aiResult = JSON.parse(aiResponse);
    } catch (aiError) {
      console.error('OpenAI error:', aiError.message);
    }

    const standup = await Standup.create({
      user: req.user._id,
      project: projectId,
      yesterday,
      today,
      blockers: blockers || '',
      aiSummary: aiResult.summary,
      aiBlockers: aiResult.blockers || [],
      aiSuggestions: aiResult.suggestions || [],
      aiSentiment: aiResult.sentiment || 'neutral',
    });

    const populated = await Standup.findById(standup._id)
      .populate('user', 'name avatar')
      .populate('project', 'name');

    res.status(201).json({ success: true, standup: populated, aiInsights: aiResult });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/ai/prioritize-tasks
 * @desc    AI task prioritization
 * @access  Private
 */
const prioritizeTasks = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    const tasks = await Task.find({ project: projectId, status: { $ne: 'done' } })
      .populate('assignedTo', 'name')
      .lean();

    if (tasks.length === 0) {
      return res.json({ success: true, message: 'No pending tasks', tasks: [] });
    }

    const taskData = tasks.map((t) => ({
      id: t._id,
      title: t.title,
      priority: t.priority,
      status: t.status,
      deadline: t.deadline,
      assignedTo: t.assignedTo?.name || 'Unassigned',
      dependencies: t.dependencies?.length || 0,
    }));

    const prompt = `Given these project tasks, analyze and rank them by priority. Consider deadlines, current priority, dependencies, and impact.

Tasks: ${JSON.stringify(taskData, null, 2)}

Current date: ${new Date().toISOString()}

Return a JSON array with this structure for each task:
[{
  "taskId": "task_id_here",
  "priorityScore": 1-100,
  "priorityRank": 1,
  "reasoning": "Brief explanation",
  "suggestedPriority": "critical|high|medium|low",
  "urgency": "immediate|this-week|this-sprint|backlog"
}]

Order by priorityScore descending (100 = most urgent).`;

    let rankedTasks = tasks.map((t, i) => ({
      taskId: t._id,
      priorityScore: 50,
      priorityRank: i + 1,
      reasoning: 'AI analysis unavailable',
      suggestedPriority: t.priority,
      urgency: 'this-sprint',
    }));

    try {
      const aiResponse = await callAI(
        'You are an expert project manager. Return only valid JSON arrays.',
        prompt
      );
      const parsed = JSON.parse(aiResponse);
      if (Array.isArray(parsed)) {
        rankedTasks = parsed;

        // Update tasks with AI priority scores
        const updatePromises = rankedTasks.map((rt) =>
          Task.findByIdAndUpdate(rt.taskId, {
            aiPriorityScore: rt.priorityScore,
            aiPriorityReason: rt.reasoning,
          })
        );
        await Promise.all(updatePromises);
      }
    } catch (aiError) {
      console.error('OpenAI error:', aiError.message);
    }

    res.json({ success: true, rankedTasks, tasks });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/ai/predict-risk
 * @desc    AI project risk prediction
 * @access  Private
 */
const predictRisk = async (req, res, next) => {
  try {
    const { projectId } = req.body;

    const project = await Project.findById(projectId)
      .populate('members.user', 'name')
      .lean();

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const tasks = await Task.find({ project: projectId }).lean();
    const overdueTasks = tasks.filter(
      (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'done'
    );
    const blockedTasks = tasks.filter((t) => t.status === 'todo' && t.dependencies?.length > 0);

    const projectData = {
      name: project.name,
      deadline: project.deadline,
      status: project.status,
      progress: project.progress,
      totalTasks: tasks.length,
      completedTasks: tasks.filter((t) => t.status === 'done').length,
      inProgressTasks: tasks.filter((t) => t.status === 'in-progress').length,
      overdueTasks: overdueTasks.length,
      blockedTasks: blockedTasks.length,
      teamSize: project.members.length + 1,
      daysUntilDeadline: Math.ceil(
        (new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)
      ),
    };

    const prompt = `Analyze this project data and predict delivery risks:

${JSON.stringify(projectData, null, 2)}

Provide a detailed risk analysis in JSON format:
{
  "riskScore": 0-100,
  "riskLevel": "low|medium|high|critical",
  "isLikelyDelayed": true/false,
  "delayProbability": "0-100%",
  "keyRisks": ["list of specific risks"],
  "immediateActions": ["list of immediate actions to take"],
  "longTermRecommendations": ["list of longer-term improvements"],
  "estimatedDelay": "0 days | X days | X weeks",
  "summary": "Executive summary paragraph"
}`;

    let riskAnalysis = {
      riskScore: 50,
      riskLevel: 'medium',
      isLikelyDelayed: false,
      delayProbability: '0%',
      keyRisks: ['AI analysis unavailable - configure OpenAI API key'],
      immediateActions: ['Review tasks manually'],
      longTermRecommendations: [],
      estimatedDelay: '0 days',
      summary: 'Configure your OpenAI API key for AI risk analysis.',
    };

    try {
      const aiResponse = await callAI(
        'You are an expert project risk analyst. Return only valid JSON.',
        prompt
      );
      const parsed = JSON.parse(aiResponse);
      riskAnalysis = parsed;

      // Save AI insights to project
      await Project.findByIdAndUpdate(projectId, {
        aiRiskScore: parsed.riskScore,
        'aiInsights.riskAnalysis': parsed.summary,
        'aiInsights.suggestions': parsed.immediateActions,
        'aiInsights.lastAnalyzed': new Date(),
      });
    } catch (aiError) {
      console.error('OpenAI error:', aiError.message);
    }

    res.json({ success: true, riskAnalysis, projectData });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/ai/standups/:projectId
 * @desc    Get standup history for a project
 * @access  Private
 */
const getStandups = async (req, res, next) => {
  try {
    const standups = await Standup.find({ project: req.params.projectId })
      .populate('user', 'name avatar email')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, standups });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/ai/generate-tasks
 * @desc    AI generate task suggestions for a project
 * @access  Private
 */
const generateTaskSuggestions = async (req, res, next) => {
  try {
    const { projectName, projectDescription, existingTasks } = req.body;

    const prompt = `You are a senior project manager. Generate 5 task suggestions for this project:

Project: ${projectName}
Description: ${projectDescription || 'A software development project'}
Existing tasks: ${existingTasks?.join(', ') || 'None'}

Return a JSON array of 5 task suggestions:
[{
  "title": "Task title",
  "description": "Brief description",
  "priority": "high|medium|low",
  "estimatedHours": number,
  "tags": ["tag1", "tag2"]
}]`;

    let suggestions = [
      { title: 'Set up project structure', description: 'Initialize the codebase', priority: 'high', estimatedHours: 2, tags: ['setup'] },
      { title: 'Create documentation', description: 'Write README and docs', priority: 'medium', estimatedHours: 3, tags: ['docs'] },
      { title: 'Configure CI/CD pipeline', description: 'Set up automated testing and deployment', priority: 'medium', estimatedHours: 4, tags: ['devops'] },
      { title: 'Implement core features', description: 'Build the main functionality', priority: 'high', estimatedHours: 8, tags: ['development'] },
      { title: 'Testing and QA', description: 'Write and run tests', priority: 'high', estimatedHours: 4, tags: ['testing'] },
    ];

    try {
      const aiResponse = await callAI(
        'You are a senior project manager. Return only valid JSON arrays.',
        prompt
      );
      const parsed = JSON.parse(aiResponse);
      if (Array.isArray(parsed)) suggestions = parsed;
    } catch (aiError) {
      console.error('OpenAI error:', aiError.message);
    }

    res.json({ success: true, suggestions });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeStandup, prioritizeTasks, predictRisk, getStandups, generateTaskSuggestions };
