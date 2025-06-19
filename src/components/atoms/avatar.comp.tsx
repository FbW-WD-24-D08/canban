import * as Tooltip from "@radix-ui/react-tooltip";

interface AvatarProps {
  name?: string;
  imageUrl?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
}

// Generate a consistent color based on name
function getAvatarColor(name: string): string {
  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
    "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
    "#F8C471", "#82E0AA", "#F1948A", "#85C1E9", "#D5A6BD"
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map(part => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ 
  name = "Unknown", 
  imageUrl, 
  size = "sm", 
  className = "", 
  showTooltip = true 
}: AvatarProps) {
  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);

  const AvatarElement = (
    <div 
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-semibold text-white shadow-sm border border-white/20 ${className}`}
      style={{ backgroundColor }}
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full rounded-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );

  if (!showTooltip) {
    return AvatarElement;
  }

  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          {AvatarElement}
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="px-2 py-1 text-xs bg-zinc-900 text-white rounded-md shadow-lg border border-zinc-700 z-50"
            sideOffset={5}
          >
            {name}
            <Tooltip.Arrow className="fill-zinc-900" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

// Avatar group for multiple assignees
interface AvatarGroupProps {
  assignees: Array<{ name: string; imageUrl?: string }>;
  maxVisible?: number;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

export function AvatarGroup({ 
  assignees, 
  maxVisible = 3, 
  size = "sm", 
  className = "" 
}: AvatarGroupProps) {
  if (assignees.length === 0) {
    return null;
  }

  const visibleAssignees = assignees.slice(0, maxVisible);
  const remainingCount = Math.max(0, assignees.length - maxVisible);

  return (
    <div className={`flex -space-x-1 ${className}`}>
      {visibleAssignees.map((assignee, index) => (
        <Avatar
          key={index}
          name={assignee.name}
          imageUrl={assignee.imageUrl}
          size={size}
          className="border-2 border-white dark:border-zinc-800"
        />
      ))}
      
      {remainingCount > 0 && (
        <Tooltip.Provider delayDuration={300}>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <div 
                className={`${
                  size === "xs" ? "w-6 h-6 text-xs" :
                  size === "sm" ? "w-8 h-8 text-xs" :
                  size === "md" ? "w-10 h-10 text-sm" :
                  "w-12 h-12 text-base"
                } rounded-full flex items-center justify-center font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-200 dark:bg-zinc-700 border-2 border-white dark:border-zinc-800`}
              >
                +{remainingCount}
              </div>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                className="px-2 py-1 text-xs bg-zinc-900 text-white rounded-md shadow-lg border border-zinc-700 z-50"
                sideOffset={5}
              >
                {remainingCount} more assignee{remainingCount > 1 ? 's' : ''}
                <Tooltip.Arrow className="fill-zinc-900" />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </Tooltip.Provider>
      )}
    </div>
  );
} 