const { format } = require('fast-csv');
const { Transform } = require('stream');
const { pipeline } = require('stream/promises');
const Response = require('../models/Response');

/**
 * Stream responses as CSV directly to HTTP response.
 * Uses MongoDB cursor → fast-csv formatter → res pipe chain.
 * Memory usage stays constant regardless of dataset size.
 */
async function streamCSV(surveyId, userId, questions, res) {
  const headers = ['Response ID', 'Submitted At', 'Completion Time (s)'];
  for (const q of questions) {
    headers.push(q.title || q.id);
  }

  const csvStream = format({ headers });

  const cursor = Response.find({ surveyId, userId })
    .sort({ 'metadata.submittedAt': -1 })
    .lean()
    .cursor();

  const transformer = new Transform({
    objectMode: true,
    transform(doc, encoding, callback) {
      const row = {
        'Response ID': doc._id.toString(),
        'Submitted At': doc.metadata?.submittedAt
          ? new Date(doc.metadata.submittedAt).toISOString()
          : '',
        'Completion Time (s)': doc.metadata?.completionTime || '',
      };

      for (const q of questions) {
        const answer = doc.answers?.find((a) => a.questionId === q.id);
        let value = answer?.value ?? '';
        if (Array.isArray(value)) {
          value = value.join('; ');
        }
        row[q.title || q.id] = String(value);
      }

      this.push(row);
      callback();
    },
  });

  await pipeline(cursor, transformer, csvStream, res);
}

/**
 * Stream responses as a JSON array directly to HTTP response.
 * Outputs valid JSON: [ {doc1}, {doc2}, ... ]
 */
async function streamJSON(surveyId, userId, res) {
  const cursor = Response.find({ surveyId, userId })
    .sort({ 'metadata.submittedAt': -1 })
    .lean()
    .cursor();

  let first = true;

  res.write('[\n');

  const transformer = new Transform({
    objectMode: true,
    transform(doc, encoding, callback) {
      const prefix = first ? '' : ',\n';
      first = false;
      this.push(prefix + JSON.stringify(doc));
      callback();
    },
    flush(callback) {
      callback();
    },
  });

  cursor.pipe(transformer).pipe(res, { end: false });

  await new Promise((resolve, reject) => {
    transformer.on('end', () => {
      res.write('\n]');
      res.end();
      resolve();
    });
    transformer.on('error', reject);
    cursor.on('error', reject);
  });
}

module.exports = { streamCSV, streamJSON };
