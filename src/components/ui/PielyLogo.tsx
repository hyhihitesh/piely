import * as React from "react";

interface PielyLogoProps extends React.SVGProps<SVGSVGElement> {
    size?: number;
}

export function PielyLogo({ size = 24, className, ...props }: PielyLogoProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            width={size}
            height={size}
            className={className}
            {...props}
        >
            <defs>
                <linearGradient
                    id="piely-gradient"
                    x1={0}
                    y1={0.5}
                    x2={1}
                    y2={0.5}
                    spreadMethod="pad"
                    gradientUnits="objectBoundingBox"
                >
                    <stop offset="0%" stopColor="#e5994d" />
                    <stop offset="100%" stopColor="#1260c4" />
                </linearGradient>
            </defs>
            {/* Black rounded rectangle background */}
            <rect width={512} height={512} rx={96} ry={96} fill="currentColor" className="fill-gray-900 dark:fill-white" />
            {/* White dots forming "P" pattern */}
            <circle r={12} transform="translate(200 160)" className="fill-white dark:fill-gray-900" />
            <circle r={12} transform="translate(200 220)" className="fill-white dark:fill-gray-900" />
            <circle r={12} transform="translate(200 280)" className="fill-white dark:fill-gray-900" />
            <circle r={12} transform="translate(200 340)" className="fill-white dark:fill-gray-900" />
            <circle r={12} transform="translate(280 160)" className="fill-white dark:fill-gray-900" />
            <circle r={12} transform="translate(280 240)" className="fill-white dark:fill-gray-900" />
            {/* Connecting line */}
            <path
                d="M280,160v80"
                transform="matrix(-0.613718 -0.789526 -0.693695 0.539226 615.667759 333.222054)"
                className="stroke-white dark:stroke-gray-900"
                strokeWidth={6}
                strokeLinecap="round"
            />
            {/* Gradient accent dot */}
            <circle r={12} transform="translate(335.638 196)" fill="url(#piely-gradient)" />
        </svg>
    );
}
