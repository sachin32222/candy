interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  webContentLink?: string;
}

export const createDriveFolder = async (folderName: string, accessToken: string): Promise<string> => {
  const metadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
  };

  const response = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Drive API Error (create folder):', errText);
    
    // Check if it's an API not enabled error
    if (errText.includes('API has not been used') || errText.includes('is disabled')) {
      throw new Error(`Google Drive API is not enabled. Please enable it in your Google Cloud Console for this Firebase project.`);
    }
    
    let parsedErr;
    try { parsedErr = JSON.parse(errText); } catch(e) {}
    const errMsg = parsedErr?.error?.message || response.statusText;
    
    throw new Error(`Drive Error: ${errMsg}`);
  }

  const data = await response.json();
  
  // Make folder publicly accessible
  const permResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      role: 'reader',
      type: 'anyone',
    }),
  });

  if (!permResponse.ok) {
    const errText = await permResponse.text();
    console.error('Drive API Error (permissions):', errText);
    
    let parsedErr;
    try { parsedErr = JSON.parse(errText); } catch(e) {}
    const errMsg = parsedErr?.error?.message || permResponse.statusText;
    
    throw new Error(`Drive Perms Error: ${errMsg}`);
  }

  return data.id;
};

export const uploadFileToDrive = async (
  file: File,
  folderId: string,
  accessToken: string
): Promise<DriveFile> => {
  const metadata = {
    name: file.name,
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', file);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,thumbnailLink,webContentLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('Drive API Error (upload file):', errText);
    
    let parsedErr;
    try { parsedErr = JSON.parse(errText); } catch(e) {}
    const errMsg = parsedErr?.error?.message || response.statusText;
    
    throw new Error(`Drive Upload Error: ${errMsg}`);
  }

  return response.json();
};
