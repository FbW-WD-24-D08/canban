import { boardsApi } from "@/api/boards.api";
import { UserSyncService, type SyncedUser } from "@/services/user-sync.service";
import { useClerkSync } from "@/hooks/useClerkSync";
import { Check, Loader2, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// Use SyncedUser interface from user-sync service

interface AddMemberEnhancedProps {
  boardId?: string;
  onMemberAdded?: () => void;
}

export function AddMemberEnhanced({ boardId, onMemberAdded }: AddMemberEnhancedProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'not-found'>('idle');
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<SyncedUser[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [allUsers, setAllUsers] = useState<SyncedUser[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { syncedOrganization, getOrganizationMembers, syncComplete } = useClerkSync();

  // Load users from synchronized user database (show all users, prioritize organization members)
  useEffect(() => {
    const loadUsers = async () => {
      try {
        // Always load ALL users
        const allUsers = await UserSyncService.getAllActiveUsers();
        
        if (syncedOrganization) {
          // Get organization members for prioritization
          const orgMembers = await getOrganizationMembers();
          const orgMemberIds = new Set(orgMembers.map(m => m.id));
          
          // Sort: organization members first, then others
          const sortedUsers = [
            ...allUsers.filter(user => orgMemberIds.has(user.id)),
            ...allUsers.filter(user => !orgMemberIds.has(user.id))
          ];
          
          setAllUsers(sortedUsers);
        } else {
          setAllUsers(allUsers);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setAllUsers([]);
      }
    };

    // Only load after sync is complete and avoid during active typing
    if (syncComplete && !query) {
      loadUsers();
    }
  }, [syncComplete, syncedOrganization?.id]); // Stable dependencies

  // Debounced search query state
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedQuery.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Use UserSyncService for searching
        const filtered = await UserSyncService.searchUsers(debouncedQuery);

        setSuggestions(filtered.slice(0, 8));
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Error searching users:', error);
        setSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  // Handle input change - now just updates query state
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setStatus('idle');
    setMessage('');
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'Enter') {
        e.preventDefault();
        await handleDirectSubmit();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          await handleUserSelect(suggestions[selectedIndex]);
        } else {
          await handleDirectSubmit();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle direct email submission
  const handleDirectSubmit = async () => {
    if (!query.trim() || !boardId) return;

    const user = allUsers.find(u => 
      u.emailAddress.toLowerCase() === query.trim().toLowerCase()
    );
    
    if (!user) {
      setMessage('User not found with this email address');
      setStatus('not-found');
      return;
    }

    await handleUserSelect(user);
  };

  // Handle user selection
  const handleUserSelect = async (user: SyncedUser) => {
    if (!boardId) {
      setMessage('No board selected');
      setStatus('error');
      return;
    }

    try {
      setLoading(true);
      setStatus('idle');
      setMessage('');
      
      await boardsApi.addMember(boardId, user.id);
      setQuery('');
      setSuggestions([]);
      setShowSuggestions(false);
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

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const getStatusIcon = () => {
    if (loading) return <Loader2 className="w-4 h-4 animate-spin text-teal-400" />;
    if (status === 'success') return <Check className="w-4 h-4 text-green-400" />;
    if (status === 'error' || status === 'not-found') return <X className="w-4 h-4 text-red-400" />;
    return <Search className="w-4 h-4 text-zinc-400" />;
  };

  const getStatusColor = () => {
    if (status === 'success') return 'border-green-500 bg-green-900/20';
    if (status === 'error' || status === 'not-found') return 'border-red-500 bg-red-900/20';
    if (showSuggestions) return 'border-teal-500 bg-zinc-800';
    return 'border-zinc-700 bg-zinc-800';
  };

  const getInitials = (user: SyncedUser) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user.fullName) {
      const names = user.fullName.split(' ');
      return names.length > 1 
        ? `${names[0][0]}${names[names.length-1][0]}`.toUpperCase()
        : names[0][0].toUpperCase();
    }
    return user.emailAddress[0].toUpperCase();
  };

  return (
    <div className="space-y-2 relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            type="text"
            placeholder="Search users by email or name..."
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
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user)}
              className={`w-full px-4 py-3 text-left hover:bg-zinc-700 transition-colors flex items-center gap-3 ${
                index === selectedIndex ? 'bg-zinc-700' : ''
              }`}
            >
              {user.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user.fullName || user.emailAddress}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {getInitials(user)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-zinc-200 font-medium truncate">
                  {user.fullName || user.emailAddress}
                </div>
                <div className="text-zinc-400 text-sm truncate">
                  {user.emailAddress}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
      
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