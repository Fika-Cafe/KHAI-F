const baseUrl = process.env.NEXT_PUBLIC_URL;

const request = async (url: string, method: string, body: any) => {
  if (method === "GET") {
    const response = await fetch(`${baseUrl}${url}`, {
      method,
      credentials: "include",
    });
    const data = await response.json();
    return { status: response.status, ...data };
  }
  else {
    const response = await fetch(`${baseUrl}${url}`, {
      method,
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    const data = await response.json();
    return { status: response.status, ...data };
  }
};

const uploadRequest = async (url: string, formData: FormData) => {
  const response = await fetch(`${baseUrl}${url}`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  const data = await response.json();
  return { status: response.status, ...data };
};

export { request, uploadRequest };
