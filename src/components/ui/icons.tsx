
import * as React from "react";

export function MicrosoftLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 23 23"
      width="18"
      height="18"
      {...props}
    >
      <path fill="#f1511b" d="M1 1h10v10H1z" />
      <path fill="#80cc28" d="M12 1h10v10H12z" />
      <path fill="#00adef" d="M1 12h10v10H1z" />
      <path fill="#fbbc09" d="M12 12h10v10H12z" />
    </svg>
  );
}
