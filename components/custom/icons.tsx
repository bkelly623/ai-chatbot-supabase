import React from 'react';
import { cn } from '@/lib/utils';

interface BotIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export const BotIcon = ({ className, ...props }: BotIconProps) => {
  return (
    <svg
      height="16"
      strokeLinejoin="round"
      viewBox="0 0 16 16"
      width="16"
      style={{ color: 'currentColor' }} //  ✅  "currentColor" is preferred
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
