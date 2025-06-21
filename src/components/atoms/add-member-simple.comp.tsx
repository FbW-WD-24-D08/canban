import { boardsApi } from "@/api/boards.api";
import { UserSyncService } from "@/services/user-sync.service";
import { Check, Loader2, Search, X } from "lucide-react";
import { useRef, useState } from "react";

interface AddMemberSimpleProps {
  boardId?: string;
  onMemberAdded?: () => void;
}

export function AddMemberSimple({ boardId, onMemberAdded }: AddMemberSimpleProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'not-found'>('idle');
  const [message, setMessage] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);

  // Simple email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || !boardId) return;

    const email = query.trim().toLowerCase();
    
    if (!isValidEmail(email)) {
      setMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    try {
      setLoading(true);
      setStatus('idle');
      setMessage('');
      
      // Find user by email
      const allUsers = await UserSyncService.getAllActiveUsers();
      const user = allUsers.find(u => 
        u.emailAddress.toLowerCase() === email
      );
      
      if (!user) {
        setMessage('User not found with this email address');
        setStatus('not-found');
        return;
      }

      // Add user to board
      await boardsApi.addMember(boardId, user.id);
      
      // Success
      setQuery('');
      setMessage(`${user.fullName || user.emailAddress} added successfully!`);
      setStatus('success');
      onMemberAdded?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('Error adding member:', error);
      setMessage('Failed to add member. They might already be a member.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="w-4 h-4 animate-spin text-teal-400" />;
    if (status === 'success') return <Check className="w-4 h-4 text-green-400" />;
    if (status === 'error' || status === 'not-found') return <X className="w-4 h-4 text-red-400" />;
    return <Search className="w-4 h-4 text-zinc-400" />;
  };

  const getStatusColor = () => {
    if (status === 'success') return 'border-green-500 bg-green-900/20';
    if (status === 'error' || status === 'not-found') return 'border-red-500 bg-red-900/20';
    return 'border-zinc-700 bg-zinc-800 focus-within:border-teal-500';
  };

  return (
    <div className="space-y-2">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="email"
            placeholder="Enter email address..."
            disabled={loading}
            className={`w-full px-3 py-2 pr-10 rounded border text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${ 
              getStatusColor()
            } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
            autoComplete="off"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getStatusIcon()}
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded transition-colors"
        >
          {loading ? 'Adding...' : 'Add'}
        </button>
      </form>
      
      {message && (
        <p className={`text-xs px-2 ${
          status === 'success' ? 'text-green-400' : 
          status === 'error' || status === 'not-found' ? 'text-red-400' : 
          'text-zinc-400'
        }`}>
          {message}
        </p>
      )}
    </div>
  );
}