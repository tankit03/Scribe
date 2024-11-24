import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CardWithForm({
  onCancel,
  onSubmit,
}: {
  onCancel: () => void;
  onSubmit: (title: string) => void;
}) {
  const [notebookTitle, setNotebookTitle] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notebookTitle.trim() === "") {
      alert("Notebook title cannot be empty.");
      return;
    }
    onSubmit(notebookTitle); // Pass the notebook title to the parent
  };

  return (
    <Card className="w-[350px]">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Create a Notebook</CardTitle>
          <CardDescription>Start taking notes in your own personal notebook</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Name of your notebook"
                value={notebookTitle}
                onChange={(e) => setNotebookTitle(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Deploy</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
