import {
  ArrowUp as ArrowUpIcon,
  CheckCircle as CheckCirclFillIcon,
  ChevronDown as ChevronDownIcon,
  Copy as CopyIcon,
  File as FileIcon,
  Loader as LoaderIcon,
  MessageSquare as MessageIcon,
  MoreHorizontal as MoreHorizontalIcon,
  PanelLeft as SidebarLeftIcon,
  Paperclip as PaperclipIcon,
  Pen as PenIcon,
  Pencil as PencilEditIcon,
  Plus as PlusIcon,
  Redo as RedoIcon,
  Sparkles as SparklesIcon,
  Square as StopIcon,
  ThumbsDown as ThumbDownIcon,
  ThumbsUp as ThumbUpIcon,
  Trash as TrashIcon,
  Triangle as DeltaIcon,
  Undo as UndoIcon,
  X as CrossIcon
} from 'lucide-react';
import React from 'react';

import { cn } from '@/lib/utils';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const BotIcon = ({ className, ...props }: IconProps) => {
  return (
    <svg
      height="16"
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      width="16"
      style={{ color: 'currentColor' }}
      className={cn(className)}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.75 2.79933C9.19835 2.53997 9.5 2.05521 9.5 1.5C9.5 0.671573 8.82843 0 8 0C7.17157 0 6.5 0.671573 6.5 1.5C6.5 2.05521 6.80165 2.53997 7.25 2.79933V5H7C4.027 5 1.55904 7.16229 1.08296 10H0V13H1V14.5V16H2.5H13.5H15V14.5V13H16V10H14.917C14.441 7.16229 11.973 5 9 5H8.75V2.79933ZM7 6V9H6V10H7V11H8V10H9V9H8V6H7ZM9 6V8H10V9H9V10H8V9H7V8H6V6H9Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const SupabaseIcon = () => {
  return (
    <svg
      width="109"
      height="113"
      viewBox="0 0 109 113"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-8"
    >
      <path
        d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z"
        fill="url(#paint0_linear)"
      />
      <path
        d="M63.7076 110.284C60.8481 113.885 55.0502 111.912 54.9813 107.314L53.9738 40.0627L99.1935 40.0627C107.384 40.0627 111.952 49.5228 106.859 55.9374L63.7076 110.284Z"
        fill="url(#paint1_linear)"
      />
      <path
        d="M45.317 2.07103C48.1765 -1.53037 53.9745 0.442937 54.0434 5.04075L55.2585 72.2922H9.83391C1.64429 72.2922 -2.92191 62.8321 2.17152 56.4175L45.317 2.07103Z"
        fill="url(#paint2_linear)"
      />
      <defs>
        <linearGradient
          id="paint0_linear"
          x1="53.9738"
          y1="54.974"
          x2="94.1635"
          y2="71.8295"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#249361" />
          <stop offset="1" stopColor="#3ECF8E" />
        </linearGradient>
        <linearGradient
          id="paint1_linear"
          x1="36.1558"
          y1="30.578"
          x2="54.4844"
          y2="65.0806"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopOpacity="0" />
          <stop offset="1" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient
          id="paint2_linear"
          x1="55.2585"
          y1="57.381"
          x2="15.0687"
          y2="40.5255"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#249361" />
          <stop offset="1" stopColor="#3ECF8E" />
        </linearGradient>
      </defs>
    </svg>
  );
};

// Custom Vercel Icon - doesn't appear to be in Lucide
export const VercelIcon = ({ className, size, ...props }: IconProps & { size?: number }) => {
  return (
    <svg
      aria-label="Vercel logotype"
      role="img"
      viewBox="0 0 283 64"
      width={size}
      height={size}
      className={cn('size-4', className)}
      {...props}
    >
      <path
        d="M141.68 16.25c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.46 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zm117.14-14.5c-11.04 0-19 7.2-19 18s8.96 18 20 18c6.67 0 12.55-2.64 16.19-7.09l-7.65-4.42c-2.02 2.21-5.09 3.5-8.54 3.5-4.79 0-8.86-2.5-10.37-6.5h28.02c.22-1.12.35-2.28.35-3.5 0-10.79-7.96-17.99-19-17.99zm-9.45 14.5c1.25-3.99 4.67-6.5 9.45-6.5 4.79 0 8.21 2.51 9.45 6.5h-18.9zm-39.03 3.5c0 6 3.92 10 10 10 4.12 0 7.21-1.87 8.8-4.92l7.68 4.43c-3.18 5.3-9.14 8.49-16.48 8.49-11.05 0-19-7.2-19-18s7.96-18 19-18c7.34 0 13.29 3.19 16.48 8.49l-7.68 4.43c-1.59-3.05-4.68-4.92-8.8-4.92-6.07 0-10 4-10 10zm82.48-29v46h-9v-46h9zM37.59.25l36.95 64H.64l36.95-64zm92.38 5l-27.71 48-27.71-48h10.39l17.32 30 17.32-30h10.39zm58.91 12v9.69c-1-.29-2.06-.49-3.2-.49-5.81 0-10 4-10 10v14.8h-9v-34h9v9.2c0-5.08 5.91-9.2 13.2-9.2z"
        fill="black"
      ></path>
    </svg>
  );
};

export {
  ArrowUpIcon,
  BotIcon,
  CheckCirclFillIcon,
  ChevronDownIcon,
  CopyIcon,
  CrossIcon,
  DeltaIcon,
  FileIcon,
  LoaderIcon,
  MessageIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  PencilEditIcon,
  PenIcon,
  PlusIcon,
  RedoIcon,
  SidebarLeftIcon,
  SparklesIcon,
  StopIcon,
  SupabaseIcon,
  ThumbDownIcon,
  ThumbUpIcon,
  TrashIcon,
  UndoIcon,
  VercelIcon
};
