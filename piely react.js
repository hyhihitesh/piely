import * as React from "react";
const SVGComponent = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    shapeRendering="geometricPrecision"
    textRendering="geometricPrecision"
    {...props}
  >
    <defs>
      <linearGradient
        id="a"
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
    <rect
      width={492.189}
      height={506.382}
      rx={96}
      ry={96}
      transform="matrix(.65016 0 0 .63193 95 95)"
    />
    <circle r={12} transform="translate(200 160)" fill="#fff" />
    <circle r={12} transform="translate(200 220)" fill="#fff" />
    <circle r={12} transform="translate(200 280)" fill="#fff" />
    <circle r={12} transform="translate(200 340)" fill="#fff" />
    <circle r={12} transform="translate(280 160)" fill="#fff" />
    <circle r={12} transform="translate(280 240)" fill="#fff" />
    <path
      d="M280 160v80"
      transform="rotate(-127.859 389.35 16)scale(1 -.87862)"
      stroke="#fff"
      strokeWidth={6}
      strokeLinecap="round"
    />
    <circle r={12} transform="translate(335.638 196)" fill="url(#a)" />
  </svg>
);
export default SVGComponent;
