export async function uploadSiteImage(file: File): Promise<string> {
  if (!(["image/png", "image/jpeg", "image/webp"].includes(file.type))) {
    throw new Error("PNG, JPG veya WEBP dosyası seçin.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("Görsel en fazla 5 MB olabilir.");
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Görsel okunamadı."));
    reader.readAsDataURL(file);
  });
  const response = await fetch("/api/admin/site-images/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, dataUrl }),
  });
  const body = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;
  if (!response.ok || !body?.url) {
    throw new Error(body?.error || `Görsel yüklenemedi (${response.status}).`);
  }

  const check = await fetch(body.url, { method: "HEAD", cache: "no-store" });
  if (!check.ok || !check.headers.get("content-type")?.startsWith("image/")) {
    throw new Error("Görsel kaydedildi ancak canlı URL'de açılamadı.");
  }
  return body.url;
}
