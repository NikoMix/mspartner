import type { IconKey } from '@/lib/links';
import type { JSX, SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const paths: Record<IconKey, JSX.Element> = {
  rocket: (
    <path
      fill="currentColor"
      d="M14.5 2.3c2.4-.8 4.9-.6 6.4.9s1.7 4 .9 6.4c-.7 2.1-2.1 4.2-3.9 6 .1.6.1 1.3.1 1.9 0 1.3-.5 2.5-1.4 3.4l-2 2a1 1 0 0 1-1.7-.6l-.5-3.2-3-3-3.2-.5a1 1 0 0 1-.6-1.7l2-2c.9-.9 2.1-1.4 3.4-1.4.6 0 1.3 0 1.9.1 1.8-1.8 3.9-3.2 6-3.9Zm1.8 4.4a1.8 1.8 0 1 0 2.5 2.5 1.8 1.8 0 0 0-2.5-2.5ZM5.3 17.2c.9-.9 2.3-.9 3.2 0s.9 2.3 0 3.2c-.7.7-3.6 1.2-3.9 1-.2-.3.3-3.5 1-4.2Z"
    />
  ),
  badge: (
    <path
      fill="currentColor"
      d="M12 1.6 9.6 4 6.2 3.7 5.9 7.1 3.1 9l1.7 3-1.7 3 2.8 1.9.3 3.4 3.4-.3L12 22.4 14.4 20l3.4.3.3-3.4 2.8-1.9-1.7-3 1.7-3L18.1 7l-.3-3.3L14.4 4 12 1.6Zm-1 12.9L7.8 11.3l1.4-1.4 1.8 1.8 4-4 1.4 1.4-5.4 5.4Z"
    />
  ),
  sparkle: (
    <path
      fill="currentColor"
      d="M11 2.7c.3-.9 1.6-.9 1.9 0l1.4 4a3 3 0 0 0 1.9 1.9l4 1.4c.9.3.9 1.6 0 1.9l-4 1.4a3 3 0 0 0-1.9 1.9l-1.4 4c-.3.9-1.6.9-1.9 0l-1.4-4A3 3 0 0 0 7.7 13.3l-4-1.4c-.9-.3-.9-1.6 0-1.9l4-1.4a3 3 0 0 0 1.9-1.9l1.4-4ZM18.6 2.2c.2-.5.8-.5 1 0l.6 1.6 1.6.6c.5.2.5.8 0 1l-1.6.6-.6 1.6c-.2.5-.8.5-1 0l-.6-1.6-1.6-.6c-.5-.2-.5-.8 0-1l1.6-.6.6-1.6Z"
    />
  ),
  money: (
    <path
      fill="currentColor"
      d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11ZM5 8v8h14V8H5Zm7 1.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM7 9.5a1.5 1.5 0 0 1-1.5 1.5V9.5H7Zm10 0h1.5V11A1.5 1.5 0 0 1 17 9.5Zm0 5a1.5 1.5 0 0 1 1.5-1.5v1.5H17Zm-10 0H5.5V13A1.5 1.5 0 0 1 7 14.5Z"
    />
  ),
  school: (
    <path
      fill="currentColor"
      d="m12 3 11 6-11 6L4 10.6V15a1 1 0 1 1-2 0V9.5L12 3Zm0 11.7 6-3.3v3.4c0 1.6-2.7 3.2-6 3.2s-6-1.6-6-3.2v-3.4l6 3.3Z"
    />
  ),
  news: (
    <path
      fill="currentColor"
      d="M4 4h13a1 1 0 0 1 1 1v13a2 2 0 0 0 2-2V7h2v9a4 4 0 0 1-4 4H5a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1h1Zm2 4v2h9V8H6Zm0 4v2h9v-2H6Zm0 4v2h6v-2H6Z"
    />
  ),
  book: (
    <path
      fill="currentColor"
      d="M6 2h11a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Zm0 2a1 1 0 0 0-1 1v11.2c.3-.1.6-.2 1-.2h11V4H6Zm0 13a1 1 0 1 0 0 2h11v-2H6Zm2-9h7v2H8V8Z"
    />
  ),
  shield: (
    <path
      fill="currentColor"
      d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1 13-3.5-3.5L9 10l2 2 4-4 1.5 1.5L11 15Z"
    />
  ),
  link: (
    <path
      fill="currentColor"
      d="M10.6 13.4a1 1 0 0 0 1.4 0l4-4a3 3 0 1 0-4.2-4.2l-1.6 1.6 1.4 1.4 1.6-1.6a1 1 0 0 1 1.4 1.4l-4 4a1 1 0 0 0 0 1.4Zm2.8-2.8a1 1 0 0 0-1.4 0l-4 4a3 3 0 1 0 4.2 4.2l1.6-1.6-1.4-1.4-1.6 1.6a1 1 0 0 1-1.4-1.4l4-4a1 1 0 0 0 0-1.4Z"
    />
  ),
};

export function Icon({ name, ...props }: { name: IconKey } & IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      {paths[name] ?? paths.link}
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path
        fill="currentColor"
        d="M5 12h12.2l-4.6-4.6L14 6l7 6-7 6-1.4-1.4 4.6-4.6H5z"
      />
    </svg>
  );
}
