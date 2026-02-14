import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={16}
    height={18}
    viewBox="0 0 16 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M14.5833 16.4792V5.97925L7.58334 0.729248L0.583344 5.97925V16.4792H5.25001V10.6459H9.91668V16.4792H14.5833Z"
      fill="white"
      stroke="white"
      strokeWidth={1.16667}
    />
  </Svg>
);
export default SVGComponent;
