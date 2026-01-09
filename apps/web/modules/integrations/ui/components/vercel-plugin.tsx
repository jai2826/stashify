"use client";

import Image from "next/image";
import { DottedSeparator } from "@workspace/ui/components/dotted-separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import {
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/convex/_generated/api";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";

const VercelApiKeySchema = z.object({
  vercelBlobReadWriteToken: z.optional(z.string()),
});

const VercelPlugin = () => {
  const vercelConfig = useQuery(
    api.private.vercel.getVercelConfig
  );
  const saveConfig = useMutation(
    api.private.vercel.saveVercelConfig
  );

  const [disabled, setDisabled] = useState(true);
  const [showToken, setShowToken] = useState(false);

  const form = useForm<z.infer<typeof VercelApiKeySchema>>({
    resolver: zodResolver(VercelApiKeySchema),
    defaultValues: {
      vercelBlobReadWriteToken: "",
    },
  });

  useEffect(() => {
    if (vercelConfig && disabled) {
      form.reset({
        vercelBlobReadWriteToken:
          vercelConfig.vercelBlobReadWriteToken,
      });
    }
  }, [vercelConfig, disabled, form]);

  const handleCopy = async () => {
    const val = form.getValues("vercelBlobReadWriteToken");
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const onSubmit = async (
    data: z.infer<typeof VercelApiKeySchema>
  ) => {
    try {
      await saveConfig({
        vercelBlobReadWriteToken:
          data.vercelBlobReadWriteToken === ""
            ? undefined
            : data.vercelBlobReadWriteToken,
      });
      setDisabled(true);
      setShowToken(false);
      toast.success("Vercel config saved");
    } catch (error) {
      toast.error("Update failed!!");
    }
  };

  return (
    <div className="w-full h-fit lg:w-3/5 border rounded-md py-4 px-2">
      <div className="pb-3 flex justify-between items-end gap-2">
        <div className="w-full">
          <Image
            src={"/vercelLogo.svg"}
            alt="Vercel Logo"
            width={150}
            height={80}
          />
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground">
          Connect your Vercel account to seamlessly manage
          and deploy your projects directly from Stashify.
          Enjoy streamlined workflows and enhanced
          productivity with our Vercel integration.
        </p>
      </div>
      <DottedSeparator className="my-2" />

      {/* Action Header: Outside of Form to prevent Edit-button submission */}
      <div className="w-full flex justify-between items-center mb-5">
        <h1 className="text-2xl font-medium">Api keys</h1>
        <div className="flex gap-2">
          {disabled ? (
            <Button
              type="button"
              onClick={() => setDisabled(false)}
              variant="outline">
              Edit
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDisabled(true);
                  form.reset();
                }}>
                Cancel
              </Button>
              <Button
                form="vercel-config-form"
                type="submit"
                disabled={
                  form.formState.isSubmitting ||
                  !form.formState.isDirty
                }>
                {form.formState.isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form
          id="vercel-config-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full">
          <FormField
            control={form.control}
            name="vercelBlobReadWriteToken"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Blob Read Write Token</FormLabel>
                <FormControl>
                  <div className="flex gap-2 w-full">
                    {/* Input Wrapper for Eye Toggle */}
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type={
                          showToken ? "text" : "password"
                        }
                        disabled={
                          disabled ||
                          form.formState.isSubmitting
                        }
                        className="w-full pr-10"
                        placeholder="BLOB_READ_WRITE_TOKEN"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={disabled}
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() =>
                          setShowToken(!showToken)
                        }>
                        {showToken ? (
                          <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <EyeIcon className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>

                    <Button
                      onClick={handleCopy}
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={!field.value}>
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
};

export default VercelPlugin;
