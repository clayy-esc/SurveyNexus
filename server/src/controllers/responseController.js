const Response = require('../models/Response');
const Survey = require('../models/Survey');
const { streamCSV, streamJSON } = require('../services/exportService');

exports.list = async (req, res, next) => {
  try {
    const surveyId = req.params.id;

    const survey = await Survey.findOne({ _id: surveyId, userId: req.user.id });
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { surveyId, userId: req.user.id };

    if (req.query.search) {
      filter['answers.value'] = { $regex: req.query.search, $options: 'i' };
    }

    if (req.query.from || req.query.to) {
      filter['metadata.submittedAt'] = {};
      if (req.query.from) filter['metadata.submittedAt'].$gte = new Date(req.query.from);
      if (req.query.to) filter['metadata.submittedAt'].$lte = new Date(req.query.to);
    }

    const [responses, total] = await Promise.all([
      Response.find(filter)
        .sort({ 'metadata.submittedAt': -1 })
        .skip(skip)
        .limit(limit),
      Response.countDocuments(filter),
    ]);

    res.json({
      responses,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const response = await Response.findOne({
      _id: req.params.responseId,
      surveyId: req.params.id,
      userId: req.user.id,
    });

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    res.json({ response });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const response = await Response.findOneAndDelete({
      _id: req.params.responseId,
      surveyId: req.params.id,
      userId: req.user.id,
    });

    if (!response) {
      return res.status(404).json({ error: 'Response not found' });
    }

    await Survey.findByIdAndUpdate(req.params.id, { $inc: { responseCount: -1 } });

    res.json({ message: 'Response deleted' });
  } catch (err) {
    next(err);
  }
};

exports.bulkDelete = async (req, res, next) => {
  try {
    const { responseIds, confirm } = req.body;

    if (confirm !== 'DELETE') {
      return res.status(400).json({ error: 'Confirmation required: set confirm to "DELETE"' });
    }

    const filter = { surveyId: req.params.id, userId: req.user.id };

    if (responseIds && Array.isArray(responseIds) && responseIds.length > 0) {
      filter._id = { $in: responseIds };
    }

    const result = await Response.deleteMany(filter);

    await Survey.findByIdAndUpdate(req.params.id, {
      $inc: { responseCount: -result.deletedCount },
    });

    res.json({ message: `${result.deletedCount} response(s) deleted` });
  } catch (err) {
    next(err);
  }
};

exports.exportCSV = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.id, userId: req.user.id });
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${survey.title.replace(/[^a-z0-9]/gi, '_')}_responses.csv"`);

    await streamCSV(req.params.id, req.user.id, survey.questions, res);
  } catch (err) {
    next(err);
  }
};

exports.exportJSON = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.id, userId: req.user.id });
    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${survey.title.replace(/[^a-z0-9]/gi, '_')}_responses.json"`);

    await streamJSON(req.params.id, req.user.id, res);
  } catch (err) {
    next(err);
  }
};
