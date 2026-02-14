import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={26}
    height={26}
    viewBox="0 0 26 26"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G clipPath="url(#clip0_550_3908)">
      <Path
        d="M15.7502 6.29999L9.4502 12.6L15.7502 18.9"
        stroke="#1B1B1B"
        strokeLinejoin="round"
      />
    </G>
    <Defs>
      <ClipPath id="clip0_550_3908">
        <Rect width={25.2} height={25.2} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);
export default SVGComponent;
