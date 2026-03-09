const baseUrl = process.env.NEXT_PUBLIC_URL;

const LOGIN_PATH = "/";

const handleUnauthorized = (status: number) => {
  if (status !== 401) return;
  if (typeof window === "undefined") return;

  localStorage.clear();
  window.location.assign(LOGIN_PATH);
};

const parseJsonSafe = async (response: Response) => {
  try {
    return await response.json();
  } catch {
    return {};
  }
};

const request = async (url: string, method: string, body: any) => {
  if (method === "GET") {
    const response = await fetch(`${baseUrl}${url}`, {
      method,
      credentials: "include",
    });
    handleUnauthorized(response.status);
    const data = await parseJsonSafe(response);
    return { status: response.status, ...data };
  } else {
    const response = await fetch(`${baseUrl}${url}`, {
      method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    handleUnauthorized(response.status);
    const data = await parseJsonSafe(response);
    return { status: response.status, ...data };
  }
};

const uploadRequest = async (url: string, formData: FormData) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  handleUnauthorized(response.status);
  const data = await parseJsonSafe(response);
  return { status: response.status, ...data };
};

export { request, uploadRequest };
