"use client"; // Mark as a Client Component

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const DownloadForm = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async (format: "mp4" | "mp3") => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a valid YouTube URL.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, format }),
      });

      if (!response.ok) {
        throw new Error("Failed to download");
      }

      const data = await response.json();

      // Handle the file download
      const fileUrl = data.filePath; // Now it’s the URL path sent from the backend
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = fileUrl.split("/").pop();
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
      toast({
        title: "Error",
        description: "An error occurred while downloading. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <Input
        placeholder="Enter YouTube URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={() => handleDownload("mp4")} disabled={isLoading}>
          {isLoading ? "Downloading..." : "Download Video"}
        </Button>
        <Button
          onClick={() => handleDownload("mp3")}
          disabled={isLoading}
          variant="secondary"
        >
          {isLoading ? "Downloading..." : "Download Audio (MP3)"}
        </Button>
      </div>
    </div>
  );
};

export default DownloadForm;
