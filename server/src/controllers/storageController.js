const mongoose = require('mongoose');

exports.getHealth = async (req, res, next) => {
  try {
    const admin = mongoose.connection.db.admin();
    const serverStatus = await admin.command({ dbStats: 1 });

    const db = mongoose.connection.db;
    const stats = await db.stats();

    const totalSizeMB = Math.round((stats.dataSize + stats.indexSize) / (1024 * 1024) * 100) / 100;
    const limitMB = 512;
    const usagePercent = Math.round((totalSizeMB / limitMB) * 1000) / 10;

    let status = 'healthy';
    if (usagePercent > 85) status = 'critical';
    else if (usagePercent > 70) status = 'warning';

    res.json({
      status,
      storage: {
        dataSizeMB: Math.round(stats.dataSize / (1024 * 1024) * 100) / 100,
        indexSizeMB: Math.round(stats.indexSize / (1024 * 1024) * 100) / 100,
        totalSizeMB,
        limitMB,
        usagePercent,
      },
      collections: stats.collections,
      documents: stats.objects,
    });
  } catch (err) {
    next(err);
  }
};

exports.purge = async (req, res, next) => {
  try {
    const { surveyId, before, confirm } = req.body;

    if (confirm !== 'PURGE') {
      return res.status(400).json({ error: 'Confirmation required: set confirm to "PURGE"' });
    }

    if (!before) {
      return res.status(400).json({ error: 'A "before" date is required' });
    }

    const Response = require('../models/Response');
    const Survey = require('../models/Survey');

    const filter = {
      userId: req.user.id,
      'metadata.submittedAt': { $lt: new Date(before) },
    };

    if (surveyId) {
      filter.surveyId = surveyId;
    }

    const result = await Response.deleteMany(filter);

    // Update response counts for affected surveys
    if (result.deletedCount > 0) {
      const surveys = await Survey.find({ userId: req.user.id });
      for (const survey of surveys) {
        const count = await Response.countDocuments({ surveyId: survey._id });
        await Survey.findByIdAndUpdate(survey._id, { responseCount: count });
      }
    }

    res.json({
      message: `${result.deletedCount} response(s) purged`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    next(err);
  }
};
