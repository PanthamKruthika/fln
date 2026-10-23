import express from 'express';
import { dbStore, UserRole } from '../db';
import { getAuthUser } from '../auth';

export function registerAnswerKeyRoutes(app: express.Express) {
  /**
   * GET /api/admin/answer-keys
   * Lists diagnostic answer keys with optional filtering by class, set, or search.
   * Also computes open ticket / dispute counts per question so admins can spot issues easily.
   */
  app.get('/api/admin/answer-keys', async (req, res) => {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Allowed for admins, superadmins, and district coordinators
      const allowedRoles = [
        UserRole.SUPERADMIN,
        UserRole.ADMIN,
        UserRole.DISTRICT_ADMIN,
        UserRole.BLOCK_ADMIN,
      ];
      if (!allowedRoles.includes(user.role as UserRole)) {
        return res.status(403).json({ error: 'Forbidden: admin access required to manage answer keys' });
      }

      const classNumber = req.query.classNumber ? parseInt(req.query.classNumber as string, 10) : undefined;
      const setNumber = req.query.setNumber ? parseInt(req.query.setNumber as string, 10) : undefined;
      const studentId = req.query.studentId as string | undefined;
      const search = req.query.search as string | undefined;

      const keys = await dbStore.getAllDiagnosticAnswerKeys({ classNumber, setNumber, studentId, search });

      // Load tickets to match reported issues against question IDs
      const tickets = await dbStore.getTickets();
      const openTickets = tickets.filter(t => t.status !== 'Resolved');

      // Map answer keys to summary form with flagged question counts
      const summaries = keys.map(k => {
        let flaggedQuestionsCount = 0;
        const questionsWithFlags = (k.questions || []).map(q => {
          const matchingTickets = openTickets.filter(t =>
            t.subject.includes(q.question_id) ||
            t.description.includes(q.question_id) ||
            (q.question && t.description.toLowerCase().includes(q.question.toLowerCase().slice(0, 20)))
          );
          if (matchingTickets.length > 0) flaggedQuestionsCount++;
          return {
            ...q,
            ticketCount: matchingTickets.length,
            tickets: matchingTickets.map(t => ({ id: t.id, subject: t.subject, status: t.status, createdBy: t.userName }))
          };
        });

        return {
          id: k.id,
          jobId: k.jobId,
          studentId: k.studentId,
          studentName: k.studentName,
          classNumber: k.classNumber,
          setNumber: k.setNumber,
          totalQuestions: (k.questions || []).length,
          flaggedQuestionsCount,
          createdAt: k.createdAt,
          hasCorrections: Boolean(k.correctionHistory && k.correctionHistory.length > 0),
          correctionsCount: k.correctionHistory?.length || 0,
          questions: questionsWithFlags,
        };
      });

      res.json({ answerKeys: summaries, total: summaries.length });
    } catch (err: any) {
      console.error('[answerKeys] Error fetching answer keys:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch answer keys' });
    }
  });

  /**
   * GET /api/admin/answer-keys/:id
   * Get complete details of a specific answer key including full questions, regions, and edit audit history.
   */
  app.get('/api/admin/answer-keys/:id', async (req, res) => {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const key = await dbStore.getDiagnosticAnswerKeyById(req.params.id);
      if (!key) {
        return res.status(404).json({ error: 'Answer key not found' });
      }

      // Fetch relevant tickets
      const tickets = await dbStore.getTickets();
      const relevantTickets = tickets.filter(t =>
        (key.questions || []).some(q =>
          t.subject.includes(q.question_id) || t.description.includes(q.question_id)
        )
      );

      res.json({ answerKey: key, tickets: relevantTickets });
    } catch (err: any) {
      console.error('[answerKeys] Error fetching answer key details:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch answer key details' });
    }
  });

  /**
   * PUT /api/admin/answer-keys/:id/questions/:questionId
   * Admin correction endpoint: update the expected answer for a question in this answer key.
   * Can optionally trigger a re-grade of past student submissions.
   */
  app.put('/api/admin/answer-keys/:id/questions/:questionId', async (req, res) => {
    try {
      const user = await getAuthUser(req);
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Restrict edits to superadmin and admin
      if (user.role !== UserRole.SUPERADMIN && user.role !== UserRole.ADMIN) {
        return res.status(403).json({ error: 'Forbidden: only Superadmin or Admin can edit answer keys' });
      }

      const { correctAnswer, alternateAnswers, reason, regradeExisting, resolveTicketId } = req.body;

      if (!correctAnswer || typeof correctAnswer !== 'string' || !correctAnswer.trim()) {
        return res.status(400).json({ error: 'correctAnswer is required and cannot be empty' });
      }

      if (!reason || typeof reason !== 'string' || !reason.trim()) {
        return res.status(400).json({ error: 'A valid reason for the correction is mandatory for audit logs' });
      }

      const result = await dbStore.updateDiagnosticAnswerKeyQuestion(
        req.params.id,
        req.params.questionId,
        {
          correctAnswer,
          alternateAnswers: Array.isArray(alternateAnswers) ? alternateAnswers : [],
          reason,
          updatedBy: user.email,
          regradeExisting: Boolean(regradeExisting)
        }
      );

      if (!result.success) {
        return res.status(400).json({ error: result.error || 'Failed to update answer key' });
      }

      // If a ticket was linked, mark it resolved
      if (resolveTicketId) {
        await dbStore.updateTicket(resolveTicketId, { status: 'Resolved' });
      }

      res.json({
        success: true,
        message: 'Answer key corrected successfully',
        regradedCount: result.regradedCount ?? 0,
        key: result.key
      });
    } catch (err: any) {
      console.error('[answerKeys] Error updating answer key question:', err);
      res.status(500).json({ error: err.message || 'Failed to update answer key' });
    }
  });
}
