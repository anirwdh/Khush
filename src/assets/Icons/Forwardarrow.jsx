import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={22}
    height={18}
    viewBox="0 0 22 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path d="M13.5078 3.75L18.5456 9L13.5078 14.25" stroke="black" />
    <Path d="M17.9668 9L3.45427 9" stroke="black" />
  </Svg>
);
export default SVGComponent;
