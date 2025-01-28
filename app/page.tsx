import DownloadForm from "@/components/download-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-slate-100">
      <Card className="space-y-4 max-w-md mx-auto shadow-lg">
        <CardHeader>
            <h1 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500">
            YouTube Downloader
            </h1>
        </CardHeader>
        <CardContent>
          <DownloadForm />
        </CardContent>
      </Card>
    </main>
  );
}
