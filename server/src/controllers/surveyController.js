const { nanoid } = require('nanoid');
const Survey = require('../models/Survey');
const Response = require('../models/Response');

exports.list = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [surveys, total] = await Promise.all([
      Survey.find({ userId: req.user.id })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-questions -logic'),
      Survey.countDocuments({ userId: req.user.id }),
    ]);

    res.json({
      surveys,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const survey = await Survey.create({
      userId: req.user.id,
      title: req.body.title || 'Untitled Survey',
      description: req.body.description || '',
    });

    res.status(201).json({ survey });
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.json({ survey });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const allowed = [
      'title', 'description', 'questions', 'logic',
      'theme', 'settings',
    ];

    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    const survey = await Survey.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.json({ survey });
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const survey = await Survey.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    await Response.deleteMany({ surveyId: req.params.id });

    res.json({ message: 'Survey and all responses deleted' });
  } catch (err) {
    next(err);
  }
};

exports.publish = async (req, res, next) => {
  try {
    const survey = await Survey.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.questions.length === 0) {
      return res.status(400).json({ error: 'Cannot publish a survey with no questions' });
    }

    if (!survey.publicSlug) {
      survey.publicSlug = nanoid(10);
    }

    survey.status = 'published';
    await survey.save();

    res.json({ survey, publicUrl: `/s/${survey.publicSlug}` });
  } catch (err) {
    next(err);
  }
};

exports.unpublish = async (req, res, next) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, status: 'published' },
      { $set: { status: 'draft' } },
      { new: true }
    );

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found or not published' });
    }

    res.json({ survey });
  } catch (err) {
    next(err);
  }
};

exports.close = async (req, res, next) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { status: 'closed' } },
      { new: true }
    );

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    res.json({ survey });
  } catch (err) {
    next(err);
  }
};

exports.reopen = async (req, res, next) => {
  try {
    const survey = await Survey.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, status: 'closed' },
      { $set: { status: 'published' } },
      { new: true }
    );

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found or not closed' });
    }

    res.json({ survey });
  } catch (err) {
    next(err);
  }
};
