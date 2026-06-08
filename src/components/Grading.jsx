import { useState } from 'react';

export default function Grading() {
  const [course, setCourse] = useState('');
  const [assignment, setAssignment] = useState('');
  
  return (
    <div className="grading-container">
      <h2>Grading Dashboard</h2>
      <p className="description">Select a course and assignment to begin auto-grading submissions.</p>

      <div className="placeholder-card">
        <h3>Connect to Google Classroom</h3>
        <p>You must authenticate to see your courses and assignments.</p>
        <button className="primary-btn">Sign in with Google</button>
      </div>

      <div className="form-group" style={{ marginTop: '20px', opacity: 0.5, pointerEvents: 'none' }}>
        <label>Course</label>
        <select value={course} onChange={(e) => setCourse(e.target.value)}>
          <option value="">Select a course...</option>
        </select>
      </div>
      
      <div className="form-group" style={{ opacity: 0.5, pointerEvents: 'none' }}>
        <label>Assignment</label>
        <select value={assignment} onChange={(e) => setAssignment(e.target.value)}>
          <option value="">Select an assignment...</option>
        </select>
      </div>
    </div>
  );
}
