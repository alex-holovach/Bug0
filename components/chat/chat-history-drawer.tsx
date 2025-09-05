'use client';

import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import type { Chat } from '@/db/schema';
import { fetcher } from '@/lib/chat/utils';
import { ChatHistoryItem } from './chat-history-item';
import useSWRInfinite from 'swr/infinite';
import { LoaderIcon } from './icons';

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

export interface ChatHistory {
  chats: Array<Chat>;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats
  );
};

export function getChatHistoryPaginationKey(
  pageIndex: number,
  previousPageData: ChatHistory
) {
  if (previousPageData && previousPageData.hasMore === false) {
    return null;
  }

  if (pageIndex === 0) return `/api/history?limit=${PAGE_SIZE}`;

  const firstChatFromPage = previousPageData.chats.at(-1);

  if (!firstChatFromPage) return null;

  return `/api/history?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}

interface ChatHistoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatHistoryDrawer({
  open,
  onOpenChange,
}: ChatHistoryDrawerProps) {
  const { id } = useParams();

  const {
    data: paginatedChatHistories,
    setSize,
    isValidating,
    isLoading,
    mutate,
  } = useSWRInfinite<ChatHistory>(getChatHistoryPaginationKey, fetcher, {
    fallbackData: [],
  });

  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const hasReachedEnd = paginatedChatHistories
    ? paginatedChatHistories.some(page => page.hasMore === false)
    : false;

  const hasEmptyChatHistory = paginatedChatHistories
    ? paginatedChatHistories.every(page => page.chats.length === 0)
    : false;

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting chat...',
      success: () => {
        mutate(chatHistories => {
          if (chatHistories) {
            return chatHistories.map(chatHistory => ({
              ...chatHistory,
              chats: chatHistory.chats.filter(chat => chat.id !== deleteId),
            }));
          }
        });

        return 'Chat deleted successfully';
      },
      error: 'Failed to delete chat',
    });

    setShowDeleteDialog(false);

    if (deleteId === id) {
      router.push('/');
    }
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);
    onOpenChange(false);
  };

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} direction="left">
        <DrawerContent className="h-full">
          <DrawerHeader>
            <DrawerTitle>Chat History</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {isLoading ? (
              <div className="space-y-2">
                {[44, 32, 28, 64, 52].map(item => (
                  <div
                    key={item}
                    className="rounded-md h-8 flex gap-2 px-2 items-center"
                  >
                    <div
                      className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-muted"
                      style={
                        {
                          '--skeleton-width': `${item}%`,
                        } as React.CSSProperties
                      }
                    />
                  </div>
                ))}
              </div>
            ) : hasEmptyChatHistory ? (
              <div className="text-muted-foreground w-full flex flex-row justify-center items-center text-sm gap-2 py-8">
                Your conversations will appear here once you start chatting!
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedChatHistories &&
                  (() => {
                    const chatsFromHistory = paginatedChatHistories.flatMap(
                      paginatedChatHistory => paginatedChatHistory.chats
                    );

                    const groupedChats = groupChatsByDate(chatsFromHistory);

                    return (
                      <>
                        {groupedChats.today.length > 0 && (
                          <div>
                            <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                              Today
                            </div>
                            <div className="space-y-1">
                              {groupedChats.today.map(chat => (
                                <ChatHistoryItem
                                  key={chat.id}
                                  chat={chat}
                                  isActive={chat.id === id}
                                  onDelete={chatId => {
                                    setDeleteId(chatId);
                                    setShowDeleteDialog(true);
                                  }}
                                  onClick={handleChatClick}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {groupedChats.yesterday.length > 0 && (
                          <div>
                            <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                              Yesterday
                            </div>
                            <div className="space-y-1">
                              {groupedChats.yesterday.map(chat => (
                                <ChatHistoryItem
                                  key={chat.id}
                                  chat={chat}
                                  isActive={chat.id === id}
                                  onDelete={chatId => {
                                    setDeleteId(chatId);
                                    setShowDeleteDialog(true);
                                  }}
                                  onClick={handleChatClick}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {groupedChats.lastWeek.length > 0 && (
                          <div>
                            <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                              Last 7 days
                            </div>
                            <div className="space-y-1">
                              {groupedChats.lastWeek.map(chat => (
                                <ChatHistoryItem
                                  key={chat.id}
                                  chat={chat}
                                  isActive={chat.id === id}
                                  onDelete={chatId => {
                                    setDeleteId(chatId);
                                    setShowDeleteDialog(true);
                                  }}
                                  onClick={handleChatClick}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {groupedChats.lastMonth.length > 0 && (
                          <div>
                            <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                              Last 30 days
                            </div>
                            <div className="space-y-1">
                              {groupedChats.lastMonth.map(chat => (
                                <ChatHistoryItem
                                  key={chat.id}
                                  chat={chat}
                                  isActive={chat.id === id}
                                  onDelete={chatId => {
                                    setDeleteId(chatId);
                                    setShowDeleteDialog(true);
                                  }}
                                  onClick={handleChatClick}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {groupedChats.older.length > 0 && (
                          <div>
                            <div className="px-2 py-1 text-xs text-muted-foreground font-medium">
                              Older than last month
                            </div>
                            <div className="space-y-1">
                              {groupedChats.older.map(chat => (
                                <ChatHistoryItem
                                  key={chat.id}
                                  chat={chat}
                                  isActive={chat.id === id}
                                  onDelete={chatId => {
                                    setDeleteId(chatId);
                                    setShowDeleteDialog(true);
                                  }}
                                  onClick={handleChatClick}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}

                <motion.div
                  onViewportEnter={() => {
                    if (!isValidating && !hasReachedEnd) {
                      setSize(size => size + 1);
                    }
                  }}
                />

                {hasReachedEnd ? (
                  <div className="text-muted-foreground w-full flex flex-row justify-center items-center text-sm gap-2 mt-8">
                    You have reached the end of your chat history.
                  </div>
                ) : (
                  <div className="p-2 text-muted-foreground flex flex-row gap-2 items-center mt-8">
                    <div className="animate-spin">
                      <LoaderIcon />
                    </div>
                    <div>Loading Chats...</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
