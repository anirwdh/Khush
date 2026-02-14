import * as React from "react";
import Svg, { Rect } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect x={3.16626} y={3.5} width={8} height={8} stroke="white" />
    <Rect x={3.16626} y={14.5} width={8} height={8} stroke="white" />
    <Rect x={13.1663} y={3.5} width={8} height={8} stroke="white" />
    <Rect x={13.1663} y={14.5} width={8} height={8} stroke="white" />
  </Svg>
);
export default SVGComponent;
