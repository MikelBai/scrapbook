'use client';

import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const HardcodedStickyNote: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [content, setContent] = useState("This is a sticky note.");

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-64 shadow-lg">
      <CardContent className="p-2">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full resize-none border-none focus:ring-0"
          rows={4}
        />
      </CardContent>
    </Card>
  );
};

export default HardcodedStickyNote;