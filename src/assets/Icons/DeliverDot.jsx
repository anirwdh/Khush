import * as React from "react";
import Svg, { Circle } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Circle cx={6} cy={6} r={6} fill="#DCDCDC" />
    <Circle cx={6} cy={6} r={4} fill="#B4B4B4" />
    <Circle cx={6} cy={6} r={2} fill="black" />
  </Svg>
);
export default SVGComponent;
