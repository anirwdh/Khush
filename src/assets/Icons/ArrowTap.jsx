import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={20}
    height={20}
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path d="M7.5 4.16663L13.3026 9.96927L7.5 15.7719" stroke="#333333" />
  </Svg>
);
export default SVGComponent;
