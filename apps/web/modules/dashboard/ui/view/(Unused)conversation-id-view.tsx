// "use client";

// import { ConversationStatusButton } from "@/modules/dashboard/ui/components/(Unused)conversation-status-button";
// import {
//   toUIMessages,
//   useThreadMessages,
// } from "@convex-dev/agent/react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { api } from "@workspace/backend/convex/_generated/api";
// import {
//   Doc,
//   Id,
// } from "@workspace/backend/convex/_generated/dataModel";
// import {
//   AIConversation,
//   AIConversationContent,
// } from "@workspace/ui/components/ai/conversation";
// import {
//   AIInput,
//   AIInputButton,
//   AIInputSubmit,
//   AIInputTextarea,
//   AIInputToolbar,
//   AIInputTools,
// } from "@workspace/ui/components/ai/input";
// import {
//   AIMessage,
//   AIMessageContent,
// } from "@workspace/ui/components/ai/message";
// import { AIResponse } from "@workspace/ui/components/ai/response";
// import { Button } from "@workspace/ui/components/button";
// import { DicebearAvatar } from "@workspace/ui/components/dicebear-avatar";
// import {
//   Form,
//   FormField,
// } from "@workspace/ui/components/form";
// import { InfiniteScrollTrigger } from "@workspace/ui/components/infinite-scroll-trigger";
// import { Skeleton } from "@workspace/ui/components/skeleton";
// import { useInfiniteScroll } from "@workspace/ui/hooks/use-infinite-scroll";
// import { cn } from "@workspace/ui/lib/utils";
// import {
//   useAction,
//   useMutation,
//   useQuery,
// } from "convex/react";
// import {
//   MoreHorizontalIcon,
//   Wand2Icon,
// } from "lucide-react";
// import { useState } from "react";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { toast } from "sonner";

// const formSchema = z.object({
//   message: z.string().min(1, "Message is required"),
// });

// export const ConversationIdView = ({
//   conversationId,
// }: {
//   conversationId: Id<"conversations">;
// }) => {
//   const conversation = useQuery(
//     api.private.conversations.getOne,
//     {
//       conversationId,
//     }
//   );

//   const messages = useThreadMessages(
//     api.private.messages.getMany,
//     conversation?.threadId
//       ? {
//           threadId: conversation.threadId,
//         }
//       : "skip",
//     { initialNumItems: 10 }
//   );
//   const {
//     canLoadMore,
//     handleLoadMore,
//     isLoadingMore,
//     topElementRef,
//   } = useInfiniteScroll({
//     status: messages.status,
//     loadMore: messages.loadMore,
//     loadSize: 10,
//     observerEnabled: false,
//   });

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       message: "",
//     },
//   });

//   const [isEnhancing, setIsEnhancing] = useState(false);
//   const enhanceResponse = useAction(
//     api.private.messages.enhanceResponse
//   );
//   const handleEnhanceResponse = async () => {
//     setIsEnhancing(true);
//     try {
//       const response = await enhanceResponse({
//         prompt: form.getValues("message"),
//       });
//       form.setValue("message", response);
//     } catch (error) {
//       console.log(error);
//       toast.error("Failed to enhance response");
//     } finally {
//       setIsEnhancing(false);
//     }
//   };

//   const createMessage = useMutation(
//     api.private.messages.create
//   );
//   const onSubmit = async (
//     values: z.infer<typeof formSchema>
//   ) => {
//     try {
//       await createMessage({
//         conversationId,
//         prompt: values.message,
//       });
//       form.reset();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const [isUpdatingStatus, setIsUpdatingStatus] =
//     useState(false);
//   const updateStatus = useMutation(
//     api.private.conversations.updateStatus
//   );
//   const handleToggleStatus = async () => {
//     setIsUpdatingStatus(true);
//     if (!conversation) return;
//     let newStatus: "resolved" | "escalated" | "unresolved";
//     // Cycle through statuses: resolved -> unresolved -> escalated -> resolved
//     if (conversation.status === "resolved") {
//       newStatus = "unresolved";
//     } else if (conversation.status === "escalated") {
//       newStatus = "resolved";
//     } else {
//       newStatus = "escalated";
//     }
//     try {
//       await updateStatus({
//         conversationId,
//         status: newStatus,
//       });
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setIsUpdatingStatus(false);
//     }
//   };

//   if (
//     conversation === undefined ||
//     messages.status === "LoadingFirstPage"
//   ) {
//     return <ConversationIdViewLoading />;
//   }
//   return (
//     <div className="flex h-full  flex-col  bg-muted">
//       <header className="flex  items-center justify-between border-b bg-background p-2.5">
//         <Button
//           size={"sm"}
//           variant={"ghost"}>
//           <MoreHorizontalIcon />
//         </Button>
//         <ConversationStatusButton
//           status={
//             conversation?.status as Doc<"conversations">["status"]
//           }
//           onClick={handleToggleStatus}
//           disabled={isUpdatingStatus}
//         />
//       </header>
//       <AIConversation className="max-h-[calc(100vh-180px)] ">
//         <AIConversationContent>
//           <InfiniteScrollTrigger
//             canLoadMore={canLoadMore}
//             isLoadingMore={isLoadingMore}
//             onLoadMore={handleLoadMore}
//             ref={topElementRef}
//           />
//           {toUIMessages(messages.results ?? [])
//             .filter((m) => m.text && m.text.trim() !== "")
//             .map((message) => {
//               return (
//                 <AIMessage
//                   key={message.id}
//                   // In reverse because we are watching from 'assistant perspective
//                   from={
//                     message.role === "user"
//                       ? "assistant"
//                       : "user"
//                   }>
//                   <AIMessageContent>
//                     <AIResponse>{message.text}</AIResponse>
//                   </AIMessageContent>
//                   {message.role === "user" && (
//                     <DicebearAvatar
//                       seed={
//                         conversation?.contactSessionId ||
//                         "user"
//                       }
//                       size={32}
//                     />
//                   )}
//                 </AIMessage>
//               );
//             })}
//         </AIConversationContent>
//       </AIConversation>
//       <Form {...form}>
//         <AIInput
//           className="rounded-none border-x-0 border-b-0 "
//           onSubmit={form.handleSubmit(onSubmit)}>
//           <FormField
//             control={form.control}
//             disabled={conversation?.status === "resolved"}
//             name="message"
//             render={({ field }) => (
//               <AIInputTextarea
//                 disabled={
//                   conversation?.status === "resolved" ||
//                   form.formState.isSubmitting ||
//                   isEnhancing
//                 }
//                 onChange={field.onChange}
//                 onKeyDown={(e) => {
//                   if (e.key === "Enter" && !e.shiftKey) {
//                     e.preventDefault();
//                     form.handleSubmit(onSubmit)();
//                   }
//                 }}
//                 placeholder={
//                   conversation?.status === "resolved"
//                     ? "This conversation has been resolved."
//                     : "Type your message"
//                 }
//                 value={field.value}
//               />
//             )}
//           />
//           <AIInputToolbar>
//             <AIInputTools>
//               <AIInputButton
//                 disabled={
//                   conversation?.status === "resolved" ||
//                   isEnhancing ||
//                   !form.formState.isValid
//                 }
//                 onClick={handleEnhanceResponse}>
//                 <Wand2Icon />
//                 {isEnhancing ? "Enhancing..." : "Enhance"}
//               </AIInputButton>
//             </AIInputTools>
//             <AIInputSubmit
//               disabled={
//                 conversation?.status === "resolved" ||
//                 !form.formState.isValid ||
//                 form.formState.isSubmitting ||
//                 isEnhancing
//               }
//               status="ready"
//               type="submit"
//             />
//           </AIInputToolbar>
//         </AIInput>
//       </Form>
//     </div>
//   );
// };

// export const ConversationIdViewLoading = () => {
//   return (
//     <div className="flex h-full flex-col bg-muted">
//       <header className="flex items-center justify-between border-b bg-background p-2.5">
//         <Button
//           disabled
//           size={"sm"}
//           variant={"ghost"}>
//           <MoreHorizontalIcon />
//         </Button>
//       </header>
//       <AIConversation className="max-h-[calc(100vh-180px)]">
//         <AIConversationContent>
//           {Array.from({ length: 12 }, (_, index) => {
//             const isUser = index % 2 === 0;
//             const widths = [
//               " w-3/4 ",
//               " w-1/2 ",
//               " w-5/6 ",
//               " w-2/3 ",
//             ];
//             const heights = ["h-9", "h-12", "h-10", "h-14"];
//             const width = widths[index % widths.length];
//             const height = heights[index % heights.length];
//             return (
//               <div
//                 className={cn(
//                   "group flex w-full items-end justify-end gap-2 py-2 [&>div]:max-w-[80%]",
//                   isUser
//                     ? "is-user"
//                     : "is-assistant flex-row-reverse"
//                 )}
//                 key={index}>
//                 <Skeleton
//                   className={`h-9 ${width} ${height} rounded-lg bg-neutral-200`}
//                 />
//                 <Skeleton
//                   className={`size-8 rounded-full bg-neutral-200`}
//                 />
//               </div>
//             );
//           })}
//         </AIConversationContent>
//       </AIConversation>
//       <div className="p-2">
//         <AIInput>
//           <AIInputTextarea
//             disabled
//             placeholder="Type your response as an operator..."
//           />

//           <AIInputToolbar>
//             <AIInputTools />
//             <AIInputSubmit
//               disabled
//               status="ready"
//             />
//           </AIInputToolbar>
//         </AIInput>
//       </div>
//     </div>
//   );
// };
