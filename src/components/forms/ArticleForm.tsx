
"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Article, ArticleFormData as AppArticleFormData } from "@/lib/types"; // Renamed to avoid conflict
import { slugify } from "@/utils/slugify";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

const categories = ["AI", "Web Development", "Social Media Marketing"] as const;

// Form schema uses camelCase for easier react-hook-form binding
const articleFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(150),
  slug: z.string().optional(),
  content: z.string().min(100, { message: "Content must be at least 100 characters." }),
  category: z.enum(categories, {
    required_error: "You need to select a category.",
  }),
  authorName: z.string().optional(),
  excerpt: z.string().max(300, { message: "Excerpt cannot exceed 300 characters." }).optional(),
  isPublished: z.boolean().default(true),
  coverImageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')), // This will hold URL or be empty if file is selected
});

export type ArticleFormData = z.infer<typeof articleFormSchema>; // This is the type for react-hook-form

interface ArticleFormProps {
  onSubmit: (data: AppArticleFormData) => Promise<void>; // Expects our AppArticleFormData which includes snake_case for DB
  initialData?: Partial<Article>; // Article type from Supabase (snake_case)
  isLoading?: boolean;
}

export function ArticleForm({ onSubmit, initialData, isLoading = false }: ArticleFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // initialData comes from Supabase (snake_case), map to form's camelCase
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.cover_image_url || null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ArticleFormData>({ // react-hook-form uses ArticleFormData (camelCase)
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      category: initialData?.category || categories[0],
      authorName: initialData?.author_name || "Deepak bagada",
      excerpt: initialData?.excerpt || "",
      isPublished: initialData?.is_published === undefined ? true : initialData.is_published,
      coverImageUrl: initialData?.cover_image_url || "",
    },
  });

  const watchedTitle = form.watch("title");
  const watchedCoverImageUrl = form.watch("coverImageUrl"); // camelCase from form

  useEffect(() => {
    if (watchedTitle && !form.getValues("slug") && !initialData?.slug) {
      form.setValue("slug", slugify(watchedTitle), { shouldValidate: true, shouldDirty: true });
    }
  }, [watchedTitle, form, initialData?.slug]);

  useEffect(() => {
    if (watchedCoverImageUrl && !selectedFile) {
      setImagePreview(watchedCoverImageUrl);
    }
  }, [watchedCoverImageUrl, selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("coverImageUrl", ""); 
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
    form.setValue("coverImageUrl", ""); 
    if (initialData?.cover_image_url && initialData.cover_image_url !== form.getValues("coverImageUrl")) {
      // Potentially revert to initialData.cover_image_url if needed
    }
    const fileInput = document.getElementById('coverImageFile') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmitWithUpload = async (formData: ArticleFormData) => { // formData is camelCase from react-hook-form
    let finalCoverImageUrl = formData.coverImageUrl; // URL from input or initial data

    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      const fileName = `${Date.now()}_${selectedFile.name}`;
      const filePath = `article_covers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article_covers') // Make sure this bucket exists and has public access or use signed URLs
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false,
          //contentType: selectedFile.type // Supabase client usually infers this
        });
      
      // Simulating progress for Supabase (actual progress needs event listeners if supported or custom logic)
      // For simplicity, we'll just set it to 100 after attempting upload.
      // Real progress tracking for supabase.storage.upload is more complex and might require xhr if not using their resumable upload features.
      // For now, this is a placeholder for visual feedback.
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += 10;
        if (currentProgress <= 100) {
            setUploadProgress(currentProgress);
        } else {
            clearInterval(progressInterval);
        }
      }, 100);


      if (uploadError) {
        console.error("Upload failed:", uploadError);
        setIsUploading(false);
        setUploadProgress(null);
        clearInterval(progressInterval);
        form.setError("coverImageUrl", { type: "manual", message: `Image upload failed: ${uploadError.message}. Please try again.` });
        return; // Stop submission
      }

      const { data: publicUrlData } = supabase.storage
        .from('article_covers')
        .getPublicUrl(filePath);

      clearInterval(progressInterval);
      setUploadProgress(100); // Mark as complete

      if (!publicUrlData || !publicUrlData.publicUrl) {
        console.error("Failed to get public URL");
        setIsUploading(false);
        form.setError("coverImageUrl", { type: "manual", message: "Failed to get image public URL after upload." });
        return; 
      }
      finalCoverImageUrl = publicUrlData.publicUrl;
    }

    // Prepare data for submission (map camelCase form data to snake_case for AppArticleFormData)
    const submissionData: AppArticleFormData = {
      ...formData,
      slug: formData.slug ? slugify(formData.slug) : slugify(formData.title),
      coverImageUrl: finalCoverImageUrl, // This now has the final URL (either from input or uploaded file)
    };
    
    try {
        await onSubmit(submissionData);
    } finally {
        setIsUploading(false);
        setUploadProgress(null);
        if (selectedFile) setSelectedFile(null); // Clear selected file after successful submission
    }
  };

  const currentLoadingState = isLoading || isUploading;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmitWithUpload)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter article title" {...field} disabled={currentLoadingState} />
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
                <Input placeholder="article-url-slug" {...field} onChange={(e) => field.onChange(slugify(e.target.value))} disabled={currentLoadingState}/>
              </FormControl>
              <FormDescription>URL-friendly version of the title. Auto-generated if left empty. Customize if needed.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={currentLoadingState}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Choose the category that best fits your article.</FormDescription>
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
                <Textarea placeholder="Write your article content here... (Markdown supported)" {...field} rows={15} disabled={currentLoadingState} />
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
                <Textarea placeholder="A short summary of the article (max 300 characters)" {...field} rows={3} disabled={currentLoadingState}/>
              </FormControl>
              <FormDescription>This will be shown in article previews.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem>
          <FormLabel>Cover Image</FormLabel>
          <FormControl>
            <Input 
              id="coverImageFile"
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="mb-2"
              disabled={currentLoadingState}
            />
          </FormControl>
          <FormDescription>Upload an image (e.g. JPG, PNG, WEBP, max 5MB recommended) or provide a URL below. Ensure your Supabase bucket 'article_covers' is public or URLs are signed.</FormDescription>
          <FormField
            control={form.control}
            name="coverImageUrl" // This is the form field for URL input
            render={({ field }) => (
              <Input 
                placeholder="Or paste image URL here (e.g., https://example.com/image.png)" 
                {...field} 
                disabled={currentLoadingState || !!selectedFile}
                className="mt-2"
              />
            )}
          />
          {/* Display form message for coverImageUrl (URL input) */}
          <FormMessage>{form.formState.errors.coverImageUrl?.message}</FormMessage>
        </FormItem>

        {isUploading && uploadProgress !== null && (
          <div className="space-y-1">
            <Label>Upload Progress</Label>
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-muted-foreground">{Math.round(uploadProgress)}%</p>
          </div>
        )}

        {imagePreview && (
          <div className="mt-4 relative w-full max-w-md">
            <FormLabel>Image Preview</FormLabel>
            <div className="relative mt-2 border rounded-md overflow-hidden aspect-video">
              <Image src={imagePreview} alt="Cover preview" fill style={{ objectFit: 'cover' }} />
               <Button 
                  type="button" 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-2 right-2 z-10 h-6 w-6" 
                  onClick={removeImage}
                  disabled={currentLoadingState}
                  title="Remove image"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
            </div>
          </div>
        )}
        
        <FormField
          control={form.control}
          name="authorName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Author Name (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Author's name" {...field} disabled={currentLoadingState} defaultValue="Deepak bagada" />
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
                  disabled={currentLoadingState}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={currentLoadingState} className="w-full sm:w-auto">
          {currentLoadingState ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
          ) : (initialData?.id ? "Update Article" : "Create Article")}
        </Button>
      </form>
    </Form>
  );
}
