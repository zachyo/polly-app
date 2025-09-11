"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/lib/auth-context";
import { CreatePollData } from "@/lib/types";

// Constants
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

// Zod validation schema
const pollFormSchema = z.object({
  title: z
    .string()
    .min(3, "Poll title must be at least 3 characters long")
    .max(200, "Poll title must be less than 200 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(MIN_OPTIONS, `At least ${MIN_OPTIONS} options are required`)
    .max(MAX_OPTIONS, `Maximum ${MAX_OPTIONS} options allowed`),
});

type PollFormValues = z.infer<typeof pollFormSchema>;

export default function NewPollPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  // Form configuration
  const form = useForm<PollFormValues>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: "",
      description: "",
      options: ["", ""],
    },
  });

  const { fields, append, remove } = useFieldArray<PollFormValues, "options">({
    control: form.control,
    name: "options",
  });

  // Memoized values for performance
  const canAddOption = useMemo(() => fields.length < MAX_OPTIONS, [fields.length]);
  const canRemoveOption = useMemo(() => fields.length > MIN_OPTIONS, [fields.length]);

  // Event handlers with useCallback for performance
  const addOption = useCallback(() => {
    if (canAddOption) append("");
  }, [append, canAddOption]);

  const removeOption = useCallback((index: number) => {
    if (canRemoveOption) remove(index);
  }, [remove, canRemoveOption]);

  const onSubmit = useCallback(async (values: PollFormValues) => {
    setLoading(true);
    setError("");

    try {
      // Filter out empty options and trim whitespace
      // Filter out empty options and trim whitespace
      const validOptions = values.options
        .map(option => option.trim())
        .filter(option => option !== "");

      // Check for duplicate options
      const uniqueOptions = new Set(validOptions);
      if (uniqueOptions.size !== validOptions.length) {
        setError("Poll options must be unique");
        setLoading(false);
        return;
      }

      const pollData: CreatePollData = {
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        options: validOptions,
      };
      const response = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pollData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create poll");
      }

      const { poll } = await response.json();
      router.push(`/polls/${poll.id}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    // Redirect if not loading and no user is authenticated
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Handle authentication states: loading or redirecting
  if (authLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <div className="text-center">
          {authLoading ? "Checking authentication..." : "Redirecting to login..."}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Create a New Poll</CardTitle>
          <CardDescription>
            Fill in the details below to create your poll.
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Poll Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="What's your favorite color?" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a clear and engaging title for your poll (3-200 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Add more context to your poll..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Provide additional context or instructions for your poll (max 500 characters).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Poll Options *</FormLabel>
                <FormDescription>
                  Add between {MIN_OPTIONS} and {MAX_OPTIONS} options for your poll.
                </FormDescription>
                
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`options.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input placeholder={`Option ${index + 1}`} {...field} />
                          </FormControl>
                          {canRemoveOption && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => removeOption(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  disabled={!canAddOption}
                >
                  Add Option {!canAddOption && `(Max ${MAX_OPTIONS})`}
                </Button>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Poll..." : "Create Poll"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}