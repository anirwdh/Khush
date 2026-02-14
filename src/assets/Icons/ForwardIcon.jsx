import * as React from "react";
import Svg, { G, Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G opacity={0.5}>
      <Path d="M19 9L12.0368 15.9632L5.07366 9" stroke="#14142B" />
    </G>
  </Svg>
);
export default SVGComponent;
