// Utility functions to interact with Google APIs

const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/documents.readonly',
  'https://www.googleapis.com/auth/presentations.readonly'
];

export async function authenticateWithGoogle(clientId) {
  return new Promise((resolve, reject) => {
    if (!chrome?.identity) {
      return reject(new Error("Not running in an extension environment"));
    }

    const redirectUri = chrome.identity.getRedirectURL();
    const scopeString = encodeURIComponent(SCOPES.join(' '));
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${scopeString}&prompt=consent`;

    chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true
    }, (responseUrl) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      if (!responseUrl) {
        return reject(new Error("Authorization failed. No response URL."));
      }

      const urlHash = responseUrl.split('#')[1];
      const params = new URLSearchParams(urlHash);
      const accessToken = params.get('access_token');
      
      if (accessToken) {
        chrome.storage.local.set({ googleAccessToken: accessToken });
        resolve(accessToken);
      } else {
        reject(new Error("Access token not found in response"));
      }
    });
  });
}

export async function fetchCourses(accessToken) {
  const response = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Unauthorized");
    throw new Error(`Failed to fetch courses: ${response.statusText}`);
  }

  const data = await response.json();
  return data.courses || [];
}

export async function fetchAssignments(accessToken, courseId) {
  const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch assignments: ${response.statusText}`);
  }

  const data = await response.json();
  return data.courseWork || [];
}

export async function fetchSubmissions(accessToken, courseId, courseWorkId) {
  const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${courseWorkId}/studentSubmissions`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch submissions: ${response.statusText}`);
  }

  const data = await response.json();
  return data.studentSubmissions || [];
}

export async function fetchDocContent(accessToken, documentId) {
  const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch document: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Extract text content from the document
  let content = '';
  if (data.body && data.body.content) {
    data.body.content.forEach(element => {
      if (element.paragraph && element.paragraph.elements) {
        element.paragraph.elements.forEach(el => {
          if (el.textRun && el.textRun.content) {
            content += el.textRun.content;
          }
        });
      }
    });
  }
  return content;
}

export async function fetchSlideContent(accessToken, presentationId) {
  const response = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}`, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch presentation: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Extract text from slides
  let content = '';
  if (data.slides) {
    data.slides.forEach((slide, index) => {
      content += `\n--- Slide ${index + 1} ---\n`;
      if (slide.pageElements) {
        slide.pageElements.forEach(element => {
          if (element.shape && element.shape.text && element.shape.text.textElements) {
            element.shape.text.textElements.forEach(el => {
              if (el.textRun && el.textRun.content) {
                content += el.textRun.content;
              }
            });
          }
        });
      }
    });
  }
  return content;
}
