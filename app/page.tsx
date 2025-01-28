import DownloadForm from "@/components/download-form";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-8">YouTube Video Downloader</h1>
      <DownloadForm />
    </main>
  );
}
