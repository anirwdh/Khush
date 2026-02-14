import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path d="M0.306641 12H15.9822" stroke="#14142B" strokeWidth={1.5} />
    <Path d="M0.306641 5H23.6931" stroke="#14142B" strokeWidth={1.5} />
    <Path d="M0.306641 19H23.6931" stroke="#14142B" strokeWidth={1.5} />
  </Svg>
);
export default SVGComponent;
