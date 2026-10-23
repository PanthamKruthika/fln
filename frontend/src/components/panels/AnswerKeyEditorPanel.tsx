import React, { useState, useEffect, useCallback } from 'react';
import { 
  KeyRound, Search, AlertTriangle, CheckCircle2, RefreshCw, 
  Edit3, ShieldAlert, FileText, Check, Clock, UserCheck
} from 'lucide-react';
import { apiFetch } from '../../services/apiClient';

interface QuestionItem {
  question_id: string;
  question: string;
  answer: string;
  alternateAnswers?: string[];
  answer_type: string;
  topic?: string;
  difficulty?: string;
  ticketCount?: number;
  tickets?: Array<{ id: string; subject: string; status: string; createdBy: string }>;
}

interface AnswerKeySummary {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  classNumber: number;
  setNumber: number;
  totalQuestions: number;
  flaggedQuestionsCount: number;
  createdAt: string;
  hasCorrections: boolean;
  correctionsCount: number;
  questions: QuestionItem[];
}

interface CorrectionHistoryItem {
  questionId: string;
  oldAnswer: string;
  newAnswer: string;
  alternateAnswers?: string[];
  reason: string;
  regradedCount?: number;
  updatedBy: string;
  updatedAt: string;
}

interface AnswerKeyEditorPanelProps {
  token?: string;
}

export const AnswerKeyEditorPanel: React.FC<AnswerKeyEditorPanelProps> = () => {
  const [answerKeys, setAnswerKeys] = useState<AnswerKeySummary[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(null);
  const [selectedKeyDetails, setSelectedKeyDetails] = useState<any | null>(null);
  
  const [classFilter, setClassFilter] = useState<number | 0>(0);
  const [search, setSearch] = useState('');
  const [onlyFlagged, setOnlyFlagged] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Correction Modal State
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null);
  const [newCorrectAnswer, setNewCorrectAnswer] = useState('');
  const [alternateAnswersText, setAlternateAnswersText] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');
  const [regradeExisting, setRegradeExisting] = useState(true);
  const [resolveTicketId, setResolveTicketId] = useState<string | undefined>(undefined);

  const fetchAnswerKeys = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (classFilter > 0) params.set('classNumber', String(classFilter));
      if (search.trim()) params.set('search', search.trim());

      const res = await apiFetch(`/api/admin/answer-keys?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to load answer keys from server');
      }
      const data = await res.json();
      const keys: AnswerKeySummary[] = data.answerKeys || [];
      setAnswerKeys(keys);

      // Select first key by default if none selected or selection no longer valid
      if (keys.length > 0 && (!selectedKeyId || !keys.some(k => k.id === selectedKeyId))) {
        setSelectedKeyId(keys[0].id);
      } else if (keys.length === 0) {
        setSelectedKeyId(null);
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching answer keys');
    } finally {
      setLoading(false);
    }
  }, [classFilter, search, selectedKeyId]);

  useEffect(() => {
    fetchAnswerKeys();
  }, [classFilter]);

  // Load details for selected key
  useEffect(() => {
    if (!selectedKeyId) {
      setSelectedKeyDetails(null);
      return;
    }
    apiFetch(`/api/admin/answer-keys/${selectedKeyId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && data.answerKey) {
          setSelectedKeyDetails(data.answerKey);
        }
      })
      .catch(err => console.error('Failed to fetch answer key details:', err));
  }, [selectedKeyId]);

  const openCorrectionModal = (q: QuestionItem) => {
    setEditingQuestion(q);
    setNewCorrectAnswer(q.answer);
    setAlternateAnswersText((q.alternateAnswers || []).join(', '));
    setCorrectionReason('');
    setRegradeExisting(true);
    setResolveTicketId(q.tickets && q.tickets[0] ? q.tickets[0].id : undefined);
    setError(null);
  };

  const handleSaveCorrection = async () => {
    if (!selectedKeyId || !editingQuestion) return;

    if (!newCorrectAnswer.trim()) {
      setError('Correct answer is required');
      return;
    }
    if (!correctionReason.trim()) {
      setError('Please provide a reason for the correction to preserve the audit trail');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const altArray = alternateAnswersText
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      const res = await apiFetch(
        `/api/admin/answer-keys/${selectedKeyId}/questions/${encodeURIComponent(editingQuestion.question_id)}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            correctAnswer: newCorrectAnswer.trim(),
            alternateAnswers: altArray,
            reason: correctionReason.trim(),
            regradeExisting,
            resolveTicketId,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update answer key');
      }

      setSuccessMsg(`Answer for ${editingQuestion.question_id} updated successfully! ${data.regradedCount > 0 ? `(${data.regradedCount} student evaluation(s) recalculated)` : ''}`);
      setEditingQuestion(null);

      // Refresh list & details
      await fetchAnswerKeys();
      if (selectedKeyId) {
        const detRes = await apiFetch(`/api/admin/answer-keys/${selectedKeyId}`);
        if (detRes.ok) {
          const detData = await detRes.json();
          setSelectedKeyDetails(detData.answerKey);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error updating answer key');
    } finally {
      setSaving(false);
    }
  };

  const selectedSummary = answerKeys.find(k => k.id === selectedKeyId);
  const questionsToShow = (selectedSummary?.questions || []).filter(q => {
    if (onlyFlagged && (!q.ticketCount || q.ticketCount === 0)) return false;
    return true;
  });

  const totalFlaggedAcrossAll = answerKeys.reduce((acc, k) => acc + (k.flaggedQuestionsCount || 0), 0);
  const totalCorrectedAcrossAll = answerKeys.reduce((acc, k) => acc + (k.correctionsCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-transparent p-6 border border-amber-200/50 dark:border-amber-800/30">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500 text-white shadow-md">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Answer Key Correction & Dispute Management
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect official answer keys, correct disputed questions, and recalculate student scores automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white dark:bg-slate-800 px-4 py-2 border border-slate-200 dark:border-slate-700 shadow-sm text-center">
            <div className="text-xs font-semibold text-slate-400">Total Keys</div>
            <div className="text-lg font-bold text-slate-800 dark:text-white">{answerKeys.length}</div>
          </div>
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 px-4 py-2 border border-rose-200 dark:border-rose-800/40 shadow-sm text-center">
            <div className="text-xs font-semibold text-rose-600 dark:text-rose-400">Disputed</div>
            <div className="text-lg font-bold text-rose-700 dark:text-rose-300">{totalFlaggedAcrossAll}</div>
          </div>
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2 border border-emerald-200 dark:border-emerald-800/40 shadow-sm text-center">
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Corrected</div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{totalCorrectedAcrossAll}</div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/50 p-4 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-xs text-emerald-700 hover:underline">Dismiss</button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-lg bg-rose-50 dark:bg-rose-950/50 p-4 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-xs text-rose-700 hover:underline">Dismiss</button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Class:</span>
          {[0, 1, 2, 3, 4].map(c => (
            <button
              key={c}
              onClick={() => setClassFilter(c)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                classFilter === c
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {c === 0 ? 'All' : `Class ${c}`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={onlyFlagged}
              onChange={e => setOnlyFlagged(e.target.checked)}
              className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
            />
            <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              Only Disputed
            </span>
          </label>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search question / ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchAnswerKeys()}
              className="w-48 md:w-60 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={() => fetchAnswerKeys()}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Main Grid: Left side Answer Key selector, Right side Question Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Answer Key sets */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Diagnostic Answer Keys ({answerKeys.length})
          </div>

          {loading && answerKeys.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading answer keys...</div>
          ) : answerKeys.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
              No diagnostic answer keys generated yet for this filter.
            </div>
          ) : (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
              {answerKeys.map(k => {
                const isSelected = k.id === selectedKeyId;
                return (
                  <div
                    key={k.id}
                    onClick={() => setSelectedKeyId(k.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">
                        Class {k.classNumber} • Set {k.setNumber}
                      </span>
                      {k.flaggedQuestionsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 dark:bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                          <AlertTriangle className="h-3 w-3" />
                          {k.flaggedQuestionsCount} Flagged
                        </span>
                      ) : k.hasCorrections ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-300">
                          <Check className="h-3 w-3" />
                          Edited
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Standard</span>
                      )}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 truncate">
                      Student: <span className="font-medium text-slate-700 dark:text-slate-200">{k.studentName || 'Class Template'}</span> ({k.studentId || 'Default'})
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{k.totalQuestions} Questions</span>
                      <span>{new Date(k.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column: Questions table & Edit action */}
        <div className="lg:col-span-8 space-y-4">
          {selectedSummary ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Class {selectedSummary.classNumber} Diagnostic — Set {selectedSummary.setNumber}
                    <span className="text-xs font-normal text-slate-400 font-mono">({selectedSummary.id})</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Student: {selectedSummary.studentName} ({selectedSummary.studentId}) • {selectedSummary.totalQuestions} questions total
                  </p>
                </div>
              </div>

              {/* Table of Questions */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Question ID</th>
                      <th className="py-2.5 px-3">Topic / Prompt</th>
                      <th className="py-2.5 px-3">Expected Answer</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {questionsToShow.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          {onlyFlagged ? 'No disputed questions found for this set.' : 'No questions in this answer key.'}
                        </td>
                      </tr>
                    ) : (
                      questionsToShow.map((q, idx) => {
                        const hasTicket = q.ticketCount && q.ticketCount > 0;
                        return (
                          <tr key={q.question_id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-3 font-semibold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                              {q.question_id}
                            </td>
                            <td className="py-3 px-3 max-w-[220px]">
                              <div className="font-medium text-slate-800 dark:text-slate-200 truncate">
                                {q.topic || 'Foundational Skill'}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {q.question || 'Standard question item'}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex items-center px-2 py-0.5 rounded font-mono font-bold text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                {q.answer}
                              </span>
                              {q.alternateAnswers && q.alternateAnswers.length > 0 && (
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  Alt: {q.alternateAnswers.join(', ')}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              {hasTicket ? (
                                <span className="inline-flex items-center gap-1 rounded bg-rose-50 dark:bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  <AlertTriangle className="h-3 w-3" />
                                  {q.ticketCount} Dispute
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Verified
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => openCorrectionModal(q)}
                                className="inline-flex items-center gap-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
                              >
                                <Edit3 className="h-3 w-3" />
                                Correct
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Audit history section if this key was corrected */}
              {selectedKeyDetails?.correctionHistory && selectedKeyDetails.correctionHistory.length > 0 && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Correction Audit Trail
                    </span>
                  </div>
                  <div className="space-y-2">
                    {selectedKeyDetails.correctionHistory.map((h: CorrectionHistoryItem, i: number) => (
                      <div key={i} className="text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        <div className="flex items-center justify-between text-slate-500 mb-1">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">Question {h.questionId}</span>
                          <span className="text-[10px]">{new Date(h.updatedAt).toLocaleString()}</span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                          Changed answer from <span className="font-mono font-bold line-through text-rose-500">{h.oldAnswer}</span> to <span className="font-mono font-bold text-emerald-600">{h.newAnswer}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Reason: <span className="italic">{h.reason}</span> • By: {h.updatedBy} {h.regradedCount ? `(${h.regradedCount} student(s) regraded)` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
              Select an answer key from the left list to review and correct questions.
            </div>
          )}
        </div>
      </div>

      {/* Correction Modal */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <Edit3 className="h-5 w-5" />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Correct Answer Key
                </h3>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  Question ID: {editingQuestion.question_id}
                </div>
                <div className="text-slate-500 mt-0.5">{editingQuestion.question || editingQuestion.topic}</div>
                <div className="mt-2 text-slate-600 dark:text-slate-300">
                  Current Official Answer: <span className="font-mono font-bold text-rose-600">{editingQuestion.answer}</span>
                </div>
              </div>

              {/* Linked dispute ticket notice */}
              {editingQuestion.tickets && editingQuestion.tickets.length > 0 && (
                <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs">
                  <div className="font-bold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                    Teacher Dispute Flagged:
                  </div>
                  {editingQuestion.tickets.map(t => (
                    <div key={t.id} className="text-[11px]">
                      • "{t.subject}" (Reported by {t.createdBy})
                    </div>
                  ))}
                </div>
              )}

              {/* New Correct Answer Input */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Correct Answer <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCorrectAnswer}
                  onChange={e => setNewCorrectAnswer(e.target.value)}
                  placeholder="Enter the correct answer (e.g. 7 or > or A)"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono font-bold"
                />
              </div>

              {/* Alternate Answers */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alternate Acceptable Answers (Optional, comma-separated)
                </label>
                <input
                  type="text"
                  value={alternateAnswersText}
                  onChange={e => setAlternateAnswersText(e.target.value)}
                  placeholder="e.g. seven, 07, VII"
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              {/* Mandatory Reason for audit trail */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Correction (Audit Log) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={correctionReason}
                  onChange={e => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Original answer key had calculation error in addition. Verified correct answer is 7."
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Regrade Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={regradeExisting}
                    onChange={e => setRegradeExisting(e.target.checked)}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Recalculate past student evaluation reports for this question</span>
                </label>
                <p className="text-[10px] text-slate-400 pl-5">
                  Automatically marks this question correct and updates the score for any student who submitted this new answer.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSaveCorrection}
                className="rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save & Regrade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnswerKeyEditorPanel;
