import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FolderSelect } from "@/components/folder-select";

const formSchema = z.object({
  name: z
    .string()
    .min(1, {
      message: "Project name is required.",
    })
    .min(2, {
      message: "Project name must be at least 2 characters.",
    })
    .max(50, {
      message: "Project name must be less than 50 characters.",
    }),
  runCommand: z
    .string()
    .min(1, {
      message: "Run command is required.",
    })
    .min(2, {
      message: "Run command must be at least 2 characters.",
    }),
  folder: z
    .string()
    .min(1, {
      message: "Project folder is required.",
    }),
});

type FormData = z.infer<typeof formSchema>;

export function CreateProject() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      runCommand: "",
      folder: "",
    },
  });

  const onSubmit = (values: FormData) => {
    console.log(values);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter project name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="runCommand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Run Command *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter run command"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="folder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Folder *</FormLabel>
                <FormControl>
                  <FolderSelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select a project folder..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Confirm
          </Button>
        </form>
      </Form>
    </div>
  );
}