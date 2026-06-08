import { useState, useEffect } from 'react';
import { authenticateWithGoogle, fetchCourses, fetchAssignments, fetchSubmissions, fetchDocContent, fetchSlideContent } from '../utils/googleApi';
import { evaluateSubmissionWithGemini } from '../utils/geminiApi';

export default function Grading() {
  const [course, setCourse] = useState('');
  const [assignment, setAssignment] = useState('');
  const [rubric, setRubric] = useState('');
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gradingStatus, setGradingStatus] = useState('');
  const [error, setError] = useState('');
  const [feedbackResults, setFeedbackResults] = useState([]);

  useEffect(() => {
    if (chrome?.storage?.local) {
      chrome.storage.local.get(['googleAccessToken'], async (result) => {
        if (result.googleAccessToken) {
          setIsLoggedIn(true);
          loadCourses(result.googleAccessToken);
        }
      });
    }
  }, []);

  const loadCourses = async (token) => {
    try {
      setLoading(true);
      const coursesData = await fetchCourses(token);
      setCourses(coursesData);
    } catch (err) {
      if (err.message === 'Unauthorized') {
        setIsLoggedIn(false);
        chrome.storage.local.remove('googleAccessToken');
      }
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      chrome.storage.local.get(['googleClientId'], async (result) => {
        if (!result.googleClientId) {
          setError('Please set your Google Client ID in the Settings tab first.');
          setLoading(false);
          return;
        }
        
        try {
          const token = await authenticateWithGoogle(result.googleClientId);
          setIsLoggedIn(true);
          loadCourses(token);
        } catch (authErr) {
          setError(authErr.message);
          setLoading(false);
        }
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleCourseChange = async (e) => {
    const selectedCourseId = e.target.value;
    setCourse(selectedCourseId);
    setAssignment('');
    setAssignments([]);
    setFeedbackResults([]);
    
    if (selectedCourseId) {
      try {
        setLoading(true);
        chrome.storage.local.get(['googleAccessToken'], async (result) => {
          if (result.googleAccessToken) {
            const data = await fetchAssignments(result.googleAccessToken, selectedCourseId);
            setAssignments(data);
            setLoading(false);
          }
        });
      } catch (err) {
        setError('Failed to load assignments');
        setLoading(false);
      }
    }
  };

  const handleAssignmentChange = async (e) => {
    const selectedAssignmentId = e.target.value;
    setAssignment(selectedAssignmentId);
    setFeedbackResults([]);
    
    if (selectedAssignmentId && course) {
      try {
        setLoading(true);
        chrome.storage.local.get(['googleAccessToken'], async (result) => {
          if (result.googleAccessToken) {
            const data = await fetchSubmissions(result.googleAccessToken, course, selectedAssignmentId);
            setSubmissions(data);
            setLoading(false);
          }
        });
      } catch (err) {
        setError('Failed to load submissions');
        setLoading(false);
      }
    }
  };

  const startGrading = async () => {
    if (!rubric) {
      setError("Please provide a rubric or grading criteria.");
      return;
    }
    
    setError('');
    setGradingStatus('Initializing...');
    setFeedbackResults([]);
    
    chrome.storage.local.get(['googleAccessToken', 'geminiApiKey'], async (result) => {
      if (!result.geminiApiKey) {
        setError("Gemini API key is missing. Please add it in Settings.");
        setGradingStatus('');
        return;
      }
      
      const token = result.googleAccessToken;
      const apiKey = result.geminiApiKey;
      const results = [];
      
      // Grade each submission
      for (let i = 0; i < submissions.length; i++) {
        const sub = submissions[i];
        setGradingStatus(`Grading submission ${i + 1} of ${submissions.length}...`);
        
        try {
          // Extract attachments
          let contentToGrade = '';
          if (sub.assignmentSubmission && sub.assignmentSubmission.attachments) {
            for (const attachment of sub.assignmentSubmission.attachments) {
              if (attachment.driveFile) {
                const mimeType = attachment.driveFile.alternateLink || '';
                const fileId = attachment.driveFile.id;
                
                if (mimeType.includes('document')) {
                  const text = await fetchDocContent(token, fileId);
                  contentToGrade += text + '\n\n';
                } else if (mimeType.includes('presentation')) {
                  const text = await fetchSlideContent(token, fileId);
                  contentToGrade += text + '\n\n';
                }
              }
            }
          }
          
          if (contentToGrade.trim() === '') {
            results.push({ userId: sub.userId, feedback: "No readable Google Docs or Slides attached.", error: true });
            continue;
          }
          
          const feedback = await evaluateSubmissionWithGemini(apiKey, rubric, contentToGrade);
          results.push({ userId: sub.userId, feedback, error: false });
          
        } catch (err) {
          results.push({ userId: sub.userId, feedback: `Error grading: ${err.message}`, error: true });
        }
      }
      
      setFeedbackResults(results);
      setGradingStatus('Grading complete!');
    });
  };

  return (
    <div className="grading-container">
      <h2>Grading Dashboard</h2>
      <p className="description">Select a course, an assignment, and provide a rubric to auto-grade submissions.</p>

      {error && <div className="error-message" style={{color: '#dc2626', background: '#fee2e2', padding: '10px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px'}}>{error}</div>}

      {!isLoggedIn ? (
        <div className="placeholder-card">
          <h3>Connect to Google Classroom</h3>
          <p>You must authenticate to see your courses and assignments.</p>
          <button className="primary-btn" onClick={handleLogin} disabled={loading}>
            {loading ? <><span className="spinner"></span> Authenticating...</> : 'Sign in with Google'}
          </button>
        </div>
      ) : (
        <div className="active-dashboard">
          <div className="form-group">
            <label>Course</label>
            <select value={course} onChange={handleCourseChange} disabled={loading}>
              <option value="">Select a course...</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group" style={{ opacity: course ? 1 : 0.5, pointerEvents: course ? 'auto' : 'none' }}>
            <label>Assignment</label>
            <select value={assignment} onChange={handleAssignmentChange} disabled={loading || !course}>
              <option value="">Select an assignment...</option>
              {assignments.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
          
          {assignment && (
            <div className="submission-area" style={{marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px'}}>
              <div className="form-group">
                <label>Rubric or Expected Standard</label>
                <textarea 
                  value={rubric} 
                  onChange={(e) => setRubric(e.target.value)} 
                  placeholder="Paste your rubric here. E.g., 'Ensure the presentation has 5 slides, covers the water cycle, and has no spelling errors.'"
                  style={{width: '100%', minHeight: '120px', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', resize: 'vertical'}}
                />
              </div>
              
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px'}}>
                <button className="primary-btn" onClick={startGrading} disabled={!!gradingStatus && gradingStatus !== 'Grading complete!'}>
                  {submissions.length > 0 ? (
                    (!!gradingStatus && gradingStatus !== 'Grading complete!') ? 
                      <><span className="spinner"></span> Grading...</> : 
                      `Grade ${submissions.length} Submissions`
                  ) : 'No submissions found'}
                </button>
                {gradingStatus && <span className={gradingStatus !== 'Grading complete!' ? 'pulse' : ''} style={{fontSize: '14px', color: '#64748b', fontWeight: 500}}>{gradingStatus}</span>}
              </div>

              {feedbackResults.length > 0 && (
                <div className="results-container">
                  <h3>AI Feedback Results</h3>
                  {feedbackResults.map((res, i) => (
                    <div key={i} className="step-card" style={{borderColor: res.error ? '#fca5a5' : '#e2e8f0'}}>
                      <p style={{fontWeight: 500, margin: '0 0 8px 0'}}>Student ID: {res.userId}</p>
                      <div style={{fontSize: '14px', whiteSpace: 'pre-wrap'}}>{res.feedback}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
