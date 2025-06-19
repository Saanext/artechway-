
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
import type { Article } from "@/lib/types";
import { slugify } from "@/utils/slugify";
import { useEffect, useState } from "react";
import { storage } from "@/lib/firebase"; // Import storage
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { XCircle } from "lucide-react";

const categories = ["AI", "Web Development", "Social Media Marketing"] as const;

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
  coverImageUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export type ArticleFormData = z.infer<typeof articleFormSchema>;

interface ArticleFormProps {
  onSubmit: (data: ArticleFormData) => Promise<void>;
  initialData?: Partial<Article>;
  isLoading?: boolean;
}

export function ArticleForm({ onSubmit, initialData, isLoading = false }: ArticleFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.coverImageUrl || null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ArticleFormData>({
    resolver: zodResolver(articleFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      content: initialData?.content || "",
      category: initialData?.category || categories[0],
      authorName: initialData?.authorName || "Deepak bagada",
      excerpt: initialData?.excerpt || "",
      isPublished: initialData?.isPublished === undefined ? true : initialData.isPublished,
      coverImageUrl: initialData?.coverImageUrl || "",
    },
  });

  const watchedTitle = form.watch("title");
  const watchedCoverImageUrl = form.watch("coverImageUrl");

  useEffect(() => {
    if (watchedTitle && !form.getValues("slug") && !initialData?.slug) {
      form.setValue("slug", slugify(watchedTitle), { shouldValidate: true, shouldDirty: true });
    }
  }, [watchedTitle, form, initialData?.slug]);

  useEffect(() => {
    // If a URL is manually entered and no file is selected, update preview
    if (watchedCoverImageUrl && !selectedFile) {
      setImagePreview(watchedCoverImageUrl);
    }
  }, [watchedCoverImageUrl, selectedFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue("coverImageUrl", ""); // Clear URL field if file is selected
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
    // If there's an initial image URL, revert to that if needed, or just clear
    if (initialData?.coverImageUrl && initialData.coverImageUrl !== form.getValues("coverImageUrl")) {
       // This part can be complex if we want to revert to initialData.coverImageUrl after clearing a newly selected file.
       // For now, clearing is simple.
    }
    const fileInput = document.getElementById('coverImageFile') as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = ""; // Reset file input
    }
  };

  const handleSubmit = async (data: ArticleFormData) => {
    let finalData = { ...data };
    finalData.slug = data.slug ? slugify(data.slug) : slugify(data.title);

    if (selectedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      const storageRef = ref(storage, `article_covers/${Date.now()}_${selectedFile.name}`);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);

      return new Promise<void>((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(progress);
          },
          (error) => {
            console.error("Upload failed:", error);
            setIsUploading(false);
            setUploadProgress(null);
            // Optionally, show a toast error
            form.setError("coverImageUrl", { type: "manual", message: "Image upload failed. Please try again." });
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              finalData.coverImageUrl = downloadURL;
              await onSubmit(finalData);
              setIsUploading(false);
              setUploadProgress(null);
              setSelectedFile(null); 
              // setImagePreview(downloadURL); // Keep preview or clear?
              resolve();
            } catch (error) {
              console.error("Failed to get download URL or submit form:", error);
              setIsUploading(false);
              setUploadProgress(null);
              form.setError("coverImageUrl", { type: "manual", message: "Processing after upload failed." });
              reject(error);
            }
          }
        );
      });
    } else {
      // If no file selected, use the coverImageUrl from the form (could be initial or manually entered)
      return onSubmit(finalData);
    }
  };

  const currentLoadingState = isLoading || isUploading;

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
          <FormDescription>Upload an image (max 5MB) or provide a URL below.</FormDescription>
          <FormField
            control={form.control}
            name="coverImageUrl"
            render={({ field }) => (
              <Input 
                placeholder="Or paste image URL here (e.g., https://example.com/image.png)" 
                {...field} 
                disabled={currentLoadingState || !!selectedFile} // Disable if a file is selected
                className="mt-2"
              />
            )}
          />
          <FormMessage />
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
                <Input placeholder="Author's name" {...field} disabled={currentLoadingState}/>
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
