import * as React from "react";
import Svg, { G, Path, Circle } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={21}
    height={21}
    viewBox="0 0 21 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G opacity={0.5}>
      <Path
        d="M10.4452 1.01817L20.2359 10.8089L10.8078 20.237L1.01709 10.4463L1.37971 1.38079L10.4452 1.01817Z"
        stroke="black"
      />
      <Circle cx={6.78451} cy={6.2972} r={0.833333} stroke="black" />
    </G>
  </Svg>
);
export default SVGComponent;
