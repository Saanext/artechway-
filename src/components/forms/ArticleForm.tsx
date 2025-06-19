"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { Article } from "@/lib/types";
import { slugify } from "@/utils/slugify";
import { useEffect } from "react";

const articleFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(150),
  slug: z.string().optional(),
  content: z.string().min(100, { message: "Content must be at least 100 characters." }),
  authorName: z.string().optional(),
  excerpt: z.string().max(300, { message: "Excerpt cannot exceed 300 characters." }).optional(),
  isPublished: z.boolean().default(true),
  coverImageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export type ArticleFormData = z.infer<typeof articleFormSchema>;

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData) => Promise<void>;
  initialData?: Partial<Article>;
  isLoading?: boolean;
}

export function ArticleForm({ onSubmit, initialData, isLoading = false }: ArticleFormProps) {
  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      authorName: initialData?.authorName || "Artechway Admin",
      excerpt: initialData?.excerpt || "",
      isPublished: initialData?.isPublished === undefined ? true : initialData.isPublished,
      coverImageUrl: initialData?.coverImageUrl || "",
    },
  });

  const watchedTitle = form.watch("title");

  useEffect(() => {
    if (watchedTitle && !form.getValues("slug") && !initialData?.slug) { // Auto-generate slug only if slug field is empty and not editing an existing slug
      form.setValue("slug", slugify(watchedTitle), { shouldValidate: true, shouldDirty: true });
    }
  }, [watchedTitle, form, initialData?.slug]);


  const handleSubmit = async (data: ArticleFormData) => {
    // Ensure slug is generated if empty
    const finalData = {
      ...data,
      slug: data.slug ? slugify(data.slug) : slugify(data.title),
    };
    await onSubmit(finalData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter article title" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>This will be the main heading of your article.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="article-url-slug" {...field} onChange={(e) => field.onChange(slugify(e.target.value))} disabled={isLoading}/>
              </FormControl>
              <FormDescription>URL-friendly version of the title. Auto-generated if left empty. Customize if needed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea placeholder="Write your article content here... (Markdown supported)" {...field} rows={15} disabled={isLoading} />
              </FormControl>
              <FormDescription>The main body of your article. You can use Markdown for formatting.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="excerpt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Excerpt (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="A short summary of the article (max 300 characters)" {...field} rows={3} disabled={isLoading}/>
              </FormControl>
              <FormDescription>This will be shown in article previews.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="coverImageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Image URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/image.png" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>URL for the article's main image.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="authorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Author's name" {...field} disabled={isLoading}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Publish Article</FormLabel>
                <FormDescription>
                  Make this article visible to the public. Uncheck to save as a draft.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
          ) : (initialData?.id ? "Update Article" : "Create Article")}
        </Button>
      </form>
    </Form>
  );
}
