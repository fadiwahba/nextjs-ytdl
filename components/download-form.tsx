"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react"; // Import the spinning loader icon

const DownloadForm = () => {
  const [url, setUrl] = useState("");
  const [loadingButton, setLoadingButton] = useState<"mp4" | "mp3" | null>(
    null
  ); // Track which button is loading
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDownload = async (format: "mp4" | "mp3") => {
    if (!url) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setLoadingButton(format); // Set the loading state for the clicked button
    setError(null);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, format }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases based on status code
        switch (response.status) {
          case 400:
            throw new Error(
              data.error ||
                "Invalid request. Please check the URL and try again."
            );
          case 429:
            throw new Error(
              "You've reached the download limit. Please wait a while before trying again."
            );
          case 500:
            throw new Error("Server error. Please try again later.");
          default:
            throw new Error(
              data.error || "Failed to download. Please try again."
            );
        }
      }

      // Handle the file download
      const fileUrl = data.filePath;
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = data.filename || fileUrl.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: `Download started for ${
          format === "mp4" ? "video" : "audio"
        }.`,
      });
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoadingButton(null); // Reset loading state once download is complete
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Input
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError(null); // Clear error when user starts typing
        }}
        className={error ? "border-red-500" : ""}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-2">
        <Button
          onClick={() => handleDownload("mp4")}
          disabled={loadingButton !== null}
          className="flex-1"
        >
          {loadingButton === "mp4" ? (
            <>
              Downloading... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            "Download Video"
          )}
        </Button>

        <Button
          onClick={() => handleDownload("mp3")}
          disabled={loadingButton !== null}
          variant="secondary"
          className="flex-1"
        >
          {loadingButton === "mp3" ? (
            <>
              Downloading... <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            </>
          ) : (
            "Download Audio (MP3)"
          )}
        </Button>
      </div>
    </div>
  );
};

export default DownloadForm;
