import * as React from "react";
import Svg, { Path, Line } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M13.0859 3.64563L20.3604 3.64563L20.3604 10.9365"
      stroke="#FCFCFC"
    />
    <Line
      y1={-0.5}
      x2={10.1647}
      y2={-0.5}
      transform="matrix(-0.70631 0.707903 -0.70631 -0.707903 19.8203 3.4325)"
      stroke="#FCFCFC"
    />
    <Path d="M10.9121 20.355L3.63768 20.355L3.63768 13.0641" stroke="#FCFCFC" />
    <Line
      y1={-0.5}
      x2={10.1647}
      y2={-0.5}
      transform="matrix(0.70631 -0.707903 0.70631 0.707903 4.22852 20.4272)"
      stroke="#FCFCFC"
    />
  </Svg>
);
export default SVGComponent;
