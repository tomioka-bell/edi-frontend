export async function downloadFile(fileUrl: string, fileName?: string) {
  if (!fileUrl) return;

  try {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error("Download failed");

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName || "download-file";

    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    alert("ไม่สามารถดาวน์โหลดไฟล์ได้");
  }
}
