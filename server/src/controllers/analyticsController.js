const mongoose = require('mongoose');
const Survey = require('../models/Survey');
const Response = require('../models/Response');

exports.getAnalytics = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.id, userId: req.user.id });
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const responseCount = await Response.countDocuments({ surveyId: req.params.id });

    if (responseCount === 0) {
      return res.json({
        surveyId: survey._id,
        title: survey.title,
        totalResponses: 0,
        questions: survey.questions.map((q) => ({
          id: q.id,
          title: q.title,
          type: q.type,
          data: [],
        })),
      });
    }

    // Compute average completion time
    const timeAgg = await Response.aggregate([
      { $match: { surveyId: new mongoose.Types.ObjectId(req.params.id) } },
      { $group: {
        _id: null,
        avgTime: { $avg: '$metadata.completionTime' },
        minTime: { $min: '$metadata.completionTime' },
        maxTime: { $max: '$metadata.completionTime' },
      }},
    ]);

    const completionStats = timeAgg[0] || { avgTime: 0, minTime: 0, maxTime: 0 };

    // Compute per-question analytics
    const questionAnalytics = [];

    for (const question of survey.questions) {
      const qAnalytics = { id: question.id, title: question.title, type: question.type };

      if (['single_choice', 'multi_choice', 'dropdown', 'rating'].includes(question.type)) {
        const agg = await Response.aggregate([
          { $match: { surveyId: new mongoose.Types.ObjectId(req.params.id) } },
          { $unwind: '$answers' },
          { $match: { 'answers.questionId': question.id } },
          { $project: {
            values: {
              $cond: {
                if: { $isArray: '$answers.value' },
                then: '$answers.value',
                else: ['$answers.value'],
              },
            },
          }},
          { $unwind: '$values' },
          { $group: { _id: '$values', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);

        const totalAnswers = agg.reduce((sum, item) => sum + item.count, 0);

        qAnalytics.data = agg.map((item) => ({
          label: String(item._id),
          count: item.count,
          percentage: totalAnswers > 0 ? Math.round((item.count / totalAnswers) * 1000) / 10 : 0,
        }));
        qAnalytics.totalAnswers = totalAnswers;
      } else if (['number', 'linear_scale'].includes(question.type)) {
        const agg = await Response.aggregate([
          { $match: { surveyId: new mongoose.Types.ObjectId(req.params.id) } },
          { $unwind: '$answers' },
          { $match: { 'answers.questionId': question.id } },
          { $group: {
            _id: null,
            avg: { $avg: { $toDouble: '$answers.value' } },
            min: { $min: { $toDouble: '$answers.value' } },
            max: { $max: { $toDouble: '$answers.value' } },
            count: { $sum: 1 },
            values: { $push: { $toDouble: '$answers.value' } },
          }},
        ]);

        if (agg.length > 0) {
          const sorted = agg[0].values.sort((a, b) => a - b);
          const mid = Math.floor(sorted.length / 2);
          const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

          qAnalytics.data = {
            avg: Math.round(agg[0].avg * 100) / 100,
            min: agg[0].min,
            max: agg[0].max,
            median: Math.round(median * 100) / 100,
            count: agg[0].count,
          };

          // Build distribution for histogram
          const dist = {};
          for (const v of agg[0].values) {
            dist[v] = (dist[v] || 0) + 1;
          }
          qAnalytics.distribution = Object.entries(dist)
            .map(([label, count]) => ({ label, count }))
            .sort((a, b) => Number(a.label) - Number(b.label));
        } else {
          qAnalytics.data = { avg: 0, min: 0, max: 0, median: 0, count: 0 };
          qAnalytics.distribution = [];
        }
      } else {
        // Text/date types: just count responses
        const agg = await Response.aggregate([
          { $match: { surveyId: new mongoose.Types.ObjectId(req.params.id) } },
          { $unwind: '$answers' },
          { $match: { 'answers.questionId': question.id } },
          { $count: 'total' },
        ]);

        qAnalytics.data = { responseCount: agg[0]?.total || 0 };

        // Get sample responses for text
        if (['short_text', 'long_text'].includes(question.type)) {
          const samples = await Response.aggregate([
            { $match: { surveyId: new mongoose.Types.ObjectId(req.params.id) } },
            { $unwind: '$answers' },
            { $match: { 'answers.questionId': question.id } },
            { $project: { value: '$answers.value' } },
            { $limit: 20 },
          ]);
          qAnalytics.samples = samples.map((s) => s.value);
        }
      }

      questionAnalytics.push(qAnalytics);
    }

    res.json({
      surveyId: survey._id,
      title: survey.title,
      totalResponses: responseCount,
      completionStats,
      questions: questionAnalytics,
    });
  } catch (err) {
    next(err);
  }
};
