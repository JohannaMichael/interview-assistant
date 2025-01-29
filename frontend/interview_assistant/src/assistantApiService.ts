export async function createThread() {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/assistant/thread`);
  if (!response.ok) throw new Error('Failed to create thread');
  return response.json();
}

export async function sendMessage(message: string, threadId: string, fileId: string | null) {
    console.log(JSON.stringify({ message, threadId, fileId }));
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/assistant/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, threadId, fileId }),
    });
    if (!response.ok) throw new Error('Failed to send message');
    return response.json();
}

export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/assistant/upload-file`, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Failed to upload file'); //TODO: better error handling for ux
  return response.json();
}