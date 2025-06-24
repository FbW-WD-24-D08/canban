import {
  ActivityLogIcon,
  ArchiveIcon,
  ArrowRightIcon,
  BackpackIcon,
  BellIcon,
  BookmarkIcon,
  BoxIcon,
  CalendarIcon,
  CameraIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  ClipboardIcon,
  ClockIcon,
  CodeIcon,
  ComponentInstanceIcon,
  CookieIcon,
  DesktopIcon,
  DiscIcon,
  DownloadIcon,
  ExclamationTriangleIcon,
  FilePlusIcon,
  FileTextIcon,
  GearIcon,
  GitHubLogoIcon,
  GlobeIcon,
  HeartIcon,
  HomeIcon,
  ImageIcon,
  InfoCircledIcon,
  LapTimerIcon,
  LaptopIcon,
  LayoutIcon,
  Link2Icon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  MobileIcon,
  MoveIcon,
  Pencil1Icon,
  PersonIcon,
  PieChartIcon,
  PinTopIcon,
  PlusCircledIcon,
  ReloadIcon,
  RocketIcon,
  Share1Icon,
  SpeakerLoudIcon,
  StarIcon,
  SunIcon,
  TargetIcon,
  TrashIcon,
  UpdateIcon,
  UploadIcon,
  VercelLogoIcon,
  VideoIcon,
  ViewGridIcon,
} from "@radix-ui/react-icons";
import React from "react";

export interface IconInfo {
  name: string;
  component: React.ForwardRefExoticComponent<
    React.RefAttributes<SVGSVGElement>
  >;
}

export interface IconCategory {
  name: string;
  icons: IconInfo[];
}

export const ICON_CATEGORIES: IconCategory[] = [
  {
    name: "Workflow & Productivity",
    icons: [
      { name: "CheckCircledIcon", component: CheckCircledIcon },
      { name: "ClipboardIcon", component: ClipboardIcon },
      { name: "FileTextIcon", component: FileTextIcon },
      { name: "DownloadIcon", component: DownloadIcon },
      { name: "UploadIcon", component: UploadIcon },
      { name: "SunIcon", component: SunIcon },
      { name: "PinTopIcon", component: PinTopIcon },
      { name: "Pencil1Icon", component: Pencil1Icon },
      { name: "CalendarIcon", component: CalendarIcon },
      { name: "ClockIcon", component: ClockIcon },
      { name: "TargetIcon", component: TargetIcon },
      { name: "MagnifyingGlassIcon", component: MagnifyingGlassIcon },
      { name: "ExclamationTriangleIcon", component: ExclamationTriangleIcon },
      { name: "ReloadIcon", component: ReloadIcon },
      { name: "LapTimerIcon", component: LapTimerIcon },
      { name: "UpdateIcon", component: UpdateIcon },
      { name: "ViewGridIcon", component: ViewGridIcon },
      { name: "GearIcon", component: GearIcon },
      { name: "MixerHorizontalIcon", component: MixerHorizontalIcon },
      { name: "LayoutIcon", component: LayoutIcon },
      { name: "MoveIcon", component: MoveIcon },
      { name: "ArrowRightIcon", component: ArrowRightIcon },
      { name: "Share1Icon", component: Share1Icon },
      { name: "RocketIcon", component: RocketIcon },
      { name: "GlobeIcon", component: GlobeIcon },
    ],
  },
  {
    name: "Technology & Devices",
    icons: [
      { name: "VideoIcon", component: VideoIcon },
      { name: "DesktopIcon", component: DesktopIcon },
      { name: "DiscIcon", component: DiscIcon },
      { name: "FilePlusIcon", component: FilePlusIcon },
      { name: "GitHubLogoIcon", component: GitHubLogoIcon },
      { name: "MobileIcon", component: MobileIcon },
      { name: "LaptopIcon", component: LaptopIcon },
      { name: "CameraIcon", component: CameraIcon },
      { name: "CodeIcon", component: CodeIcon },
      { name: "BellIcon", component: BellIcon },
      { name: "VercelLogoIcon", component: VercelLogoIcon },
      { name: "LockClosedIcon", component: LockClosedIcon },
      { name: "ComponentInstanceIcon", component: ComponentInstanceIcon },
    ],
  },
  {
    name: "General & UI",
    icons: [
      { name: "ActivityLogIcon", component: ActivityLogIcon },
      { name: "ArchiveIcon", component: ArchiveIcon },
      { name: "BackpackIcon", component: BackpackIcon },
      { name: "BookmarkIcon", component: BookmarkIcon },
      { name: "BoxIcon", component: BoxIcon },
      { name: "ChatBubbleIcon", component: ChatBubbleIcon },
      { name: "CookieIcon", component: CookieIcon },
      { name: "TrashIcon", component: TrashIcon },
      { name: "HeartIcon", component: HeartIcon },
      { name: "HomeIcon", component: HomeIcon },
      { name: "ImageIcon", component: ImageIcon },
      { name: "InfoCircledIcon", component: InfoCircledIcon },
      { name: "Link2Icon", component: Link2Icon },
      { name: "SpeakerLoudIcon", component: SpeakerLoudIcon },
      { name: "PersonIcon", component: PersonIcon },
      { name: "PieChartIcon", component: PieChartIcon },
      { name: "PlusCircledIcon", component: PlusCircledIcon },
      { name: "StarIcon", component: StarIcon },
    ],
  },
];

export const ALL_ICONS_MAP: Map<
  string,
  React.ForwardRefExoticComponent<React.RefAttributes<SVGSVGElement>>
> = new Map(
  ICON_CATEGORIES.flatMap((category) =>
    category.icons.map((icon) => [icon.name, icon.component])
  )
);

export function getIconComponent(
  iconName: string | null | undefined
): React.ForwardRefExoticComponent<React.RefAttributes<SVGSVGElement>> | null {
  if (!iconName) return null;
  return ALL_ICONS_MAP.get(iconName) || null;
}
