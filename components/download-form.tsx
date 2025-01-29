"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const YOUTUBE_URL_PATTERN =
  /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;

type DownloadFormat = "mp4" | "mp3";

interface DownloadResponse {
  filePath: string;
  filename?: string;
  error?: string;
}

const DownloadForm = () => {
  const [url, setUrl] = useState("");
  const [loadingButton, setLoadingButton] = useState<DownloadFormat | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) {
      setError("Please enter a URL");
      return false;
    }
    if (!YOUTUBE_URL_PATTERN.test(url)) {
      setError("Please enter a valid YouTube URL");
      return false;
    }
    return true;
  };

  const showToast = (type: "success" | "error", message: string) => {
    setTimeout(() => {
      toast({
        variant: type === "error" ? "destructive" : "success",
        title: type === "success" ? "Download Started" : "Download Failed",
        description: message,
        duration: 5000,
      });
    }, 100);
  };

  const downloadFile = async (
    fileUrl: string,
    filename?: string
  ): Promise<boolean> => {
    try {
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = filename || fileUrl.split("/").pop() || "download";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (error) {
      console.error("Download file error:", error);
      return false;
    }
  };

  const handleDownload = async (format: DownloadFormat) => {
    if (!validateUrl(url)) return;

    setLoadingButton(format);
    setError(null);

    
    try {
      const apiEndpoint = process.env.NEXT_PUBLIC_DOWNLOAD_API_ENDPOINT;
      if (!apiEndpoint) {
        throw new Error("API endpoint is not defined");
      }
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, format }),
      });

      const data: DownloadResponse = await response.json();

      if (!response.ok) {
        const errorMessages: Record<number, string> = {
          400: "Invalid request. Please check the URL and try again.",
          429: "Download limit reached. Please try again later.",
          500: "Server error. Please try again later.",
        };

        throw new Error(
          data.error ||
            errorMessages[response.status] ||
            "Failed to download. Please try again."
        );
      }

      // Wait for the download to start before showing success toast
      const downloadSuccess = await downloadFile(data.filePath, data.filename);

      if (downloadSuccess) {
        showToast(
          "success",
          `Your ${format === "mp4" ? "video" : "audio"} download has completed`
        );
      } else {
        throw new Error("Failed to initiate download");
      }
    } catch (error) {
      console.error("Download error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      showToast("error", errorMessage);
    } finally {
      setLoadingButton(null);
    }
  };

  const formatLabel = (format: DownloadFormat) => {
    if (loadingButton === format) {
      return (
        <>
          Downloading... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
        </>
      );
    }
    return `Download ${format === "mp4" ? "Video" : "Audio"}`;
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Input
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError(null);
        }}
        className={error ? "border-red-500" : ""}
        aria-label="YouTube URL input"
        disabled={loadingButton !== null}
      />

      {error && (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        {(["mp4", "mp3"] as const).map((format) => (
          <Button
            key={format}
            onClick={() => handleDownload(format)}
            disabled={loadingButton !== null}
            className={`flex-1 ${
              format === "mp4"
                ? "bg-purple-600 hover:bg-purple-400"
                : "bg-orange-600 hover:bg-orange-400"
            }`}
            aria-label={`Download as ${format}`}
          >
            {formatLabel(format)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DownloadForm;
