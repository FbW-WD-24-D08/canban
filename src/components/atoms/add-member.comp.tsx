import { boardsApi } from "@/api/boards.api";
import { usersApi } from "@/api/users.api";
import { Check, Loader2, UserPlus, X } from "lucide-react";
import { useState } from "react";

export function AddMember({
  boardId,
  onMemberAdded,
}: {
  boardId?: string;
  onMemberAdded?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'not-found'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    console.log('AddMember: handleSubmit called with email:', email, 'boardId:', boardId);
    
    if (!email.trim()) {
      setMessage('Please enter an email address');
      setStatus('error');
      return;
    }
    
    if (!boardId) {
      setMessage('No board selected');
      setStatus('error');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessage('Please enter a valid email address');
      setStatus('error');
      return;
    }

    try {
      setLoading(true);
      setStatus('idle');
      setMessage('');
      
      console.log('AddMember: Looking up user by email...');
      const user = await usersApi.getUserIdByEmail(email.trim());
      
      if (!user) {
        console.log('AddMember: User not found for email:', email);
        setMessage('User not found with this email address');
        setStatus('not-found');
        return;
      }
      
      console.log('AddMember: Found user:', user);
      console.log('AddMember: Adding member to board...');
      
      await boardsApi.addMember(boardId, user.id);
      
      console.log('AddMember: Member added successfully');
      setEmail('');
      setMessage('Member added successfully!');
      setStatus('success');
      onMemberAdded?.();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
      
    } catch (error) {
      console.error('AddMember: Error adding member:', error);
      setMessage('Failed to add member. Please try again.');
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (loading) return <Loader2 className="w-4 h-4 animate-spin text-teal-400" />;
    if (status === 'success') return <Check className="w-4 h-4 text-green-400" />;
    if (status === 'error' || status === 'not-found') return <X className="w-4 h-4 text-red-400" />;
    return <UserPlus className="w-4 h-4 text-zinc-400" />;
  };

  const getStatusColor = () => {
    if (status === 'success') return 'border-green-500 bg-green-900/20';
    if (status === 'error' || status === 'not-found') return 'border-red-500 bg-red-900/20';
    return 'border-zinc-700 bg-zinc-800';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== 'idle') {
                setStatus('idle');
                setMessage('');
              }
            }}
            type="email"
            placeholder="Add member by email"
            disabled={loading}
            className={`w-full px-3 py-2 pr-10 rounded border text-zinc-300 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all ${
              getStatusColor()
            } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && !loading) {
                e.preventDefault();
                await handleSubmit();
              }
            }}
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {getStatusIcon()}
          </div>
        </div>
      </div>
      
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
