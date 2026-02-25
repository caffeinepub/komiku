import { useState } from 'react';
import { MessageSquare, Trash2, LogIn, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetCommentsByChapterId,
  useAddComment,
  useDeleteComment,
  useGetCallerUserProfile,
  useSaveCallerUserProfile,
} from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Comment } from '../backend';

interface CommentSectionProps {
  chapterId: bigint;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CommentSection({ chapterId }: CommentSectionProps) {
  const [commentText, setCommentText] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [showUsernameSetup, setShowUsernameSetup] = useState(false);

  const { identity, login, loginStatus } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const { data: comments, isLoading: commentsLoading } = useGetCommentsByChapterId(chapterId);
  const { data: userProfile, isFetched: profileFetched } = useGetCallerUserProfile();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const saveProfile = useSaveCallerUserProfile();

  const handleLogin = () => {
    try {
      login();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveUsername = async () => {
    if (!usernameInput.trim()) return;
    try {
      await saveProfile.mutateAsync({ username: usernameInput.trim(), avatarUrl: '' });
      setShowUsernameSetup(false);
      toast.success('Username berhasil disimpan!');
    } catch {
      toast.error('Gagal menyimpan username');
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    if (!userProfile && profileFetched) {
      setShowUsernameSetup(true);
      return;
    }

    const username = userProfile?.username || 'Anonim';
    try {
      await addComment.mutateAsync({ chapterId, text: commentText.trim(), username });
      setCommentText('');
      toast.success('Komentar berhasil ditambahkan!');
    } catch {
      toast.error('Gagal mengirim komentar');
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    try {
      await deleteComment.mutateAsync({ commentId: comment.id, chapterId });
      toast.success('Komentar dihapus');
    } catch {
      toast.error('Gagal menghapus komentar');
    }
  };

  const isCommentOwner = (comment: Comment): boolean => {
    if (!identity) return false;
    const callerBlob = identity.getPrincipal().toUint8Array();
    if (callerBlob.length !== comment.userId.length) return false;
    return callerBlob.every((byte, i) => byte === comment.userId[i]);
  };

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-7 bg-primary rounded-full" />
        <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Komentar ({comments?.length || 0})
        </h2>
      </div>

      {/* Username Setup Modal */}
      {showUsernameSetup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-foreground mb-2">Atur Username</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Masukkan username yang akan ditampilkan pada komentar kamu.
            </p>
            <input
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Username kamu..."
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary mb-4"
              onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSaveUsername}
                disabled={!usernameInput.trim() || saveProfile.isPending}
                className="flex-1 bg-primary text-primary-foreground font-bold"
              >
                {saveProfile.isPending ? (
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : 'Simpan'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowUsernameSetup(false)}
                className="border-border"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Form */}
      {isAuthenticated ? (
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold text-foreground">
              {userProfile?.username || 'Pengguna'}
            </span>
          </div>
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Tulis komentar kamu..."
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground resize-none mb-3"
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmitComment}
              disabled={!commentText.trim() || addComment.isPending}
              className="bg-primary text-primary-foreground font-bold"
            >
              {addComment.isPending ? (
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Kirim
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-6 mb-6 text-center">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
          <p className="text-foreground font-bold mb-1">Login untuk berkomentar</p>
          <p className="text-sm text-muted-foreground mb-4">
            Kamu perlu login untuk dapat meninggalkan komentar
          </p>
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="bg-primary text-primary-foreground font-bold"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                Masuk...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Login untuk Komentar
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Comments List */}
      {commentsLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-9 h-9 rounded-full bg-muted shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 bg-muted" />
                <Skeleton className="h-12 w-full bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id.toString()} className="flex gap-3 group">
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 bg-card border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{comment.username}</span>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                  </div>
                  {isCommentOwner(comment) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteComment(comment)}
                      disabled={deleteComment.isPending}
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-xl">
          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="font-semibold">Belum ada komentar</p>
          <p className="text-sm mt-1">Jadilah yang pertama berkomentar!</p>
        </div>
      )}
    </section>
  );
}
