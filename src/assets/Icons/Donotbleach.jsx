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
      <Path
        d="M7.65015 11.4464L3.83984 18.5406H19.9797L11.9872 3.54688L8.73441 9.33988"
        stroke="black"
      />
      <Path d="M3.7793 6.95447L21.8088 16.0002" stroke="black" />
    </G>
  </Svg>
);
export default SVGComponent;
