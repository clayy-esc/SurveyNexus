const Survey = require('../models/Survey');
const Response = require('../models/Response');

exports.getSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({
      publicSlug: req.params.slug,
    }).select('title description questions theme settings publicSlug status');

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found or no longer available.' });
    }

    if (survey.status === 'draft') {
      return res.status(403).json({ error: 'This survey is currently in draft mode and has not been published yet.' });
    }

    if (survey.status === 'closed') {
      return res.status(403).json({ error: 'This survey is closed and is no longer accepting responses.' });
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.json({ survey });
  } catch (err) {
    next(err);
  }
};

exports.submit = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({
      publicSlug: req.params.slug,
      status: 'published',
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found or no longer accepting responses' });
    }

    const { answers, completionTime, fingerprint } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    // Duplicate submission check
    if (!survey.settings.allowMultipleSubmissions && fingerprint) {
      const existing = await Response.findOne({
        surveyId: survey._id,
        'metadata.fingerprint': fingerprint,
      });
      if (existing) {
        return res.status(409).json({ error: 'You have already submitted this survey' });
      }
    }

    // Validate required questions
    const requiredQuestions = survey.questions.filter((q) => q.required);
    for (const rq of requiredQuestions) {
      const answer = answers.find((a) => a.questionId === rq.id);
      if (!answer || answer.value === null || answer.value === undefined || answer.value === '') {
        return res.status(400).json({
          error: `Question "${rq.title}" is required`,
          questionId: rq.id,
        });
      }
    }

    const response = await Response.create({
      surveyId: survey._id,
      userId: survey.userId,
      answers,
      metadata: {
        completionTime: completionTime || null,
        fingerprint: fingerprint || null,
      },
    });

    await Survey.findByIdAndUpdate(survey._id, { $inc: { responseCount: 1 } });

    res.status(201).json({ message: 'Response submitted successfully', id: response._id });
  } catch (err) {
    next(err);
  }
};
