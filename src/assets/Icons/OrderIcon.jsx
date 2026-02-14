import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={21}
    height={17}
    viewBox="0 0 21 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Path
      d="M20.5 7.15625V15.75C20.5 15.8163 20.4736 15.8799 20.4268 15.9268C20.3799 15.9736 20.3163 16 20.25 16H0.75C0.683696 16 0.620127 15.9736 0.573242 15.9268C0.526359 15.8799 0.5 15.8163 0.5 15.75V7.15625H20.5ZM0.75 0.5H20.25C20.3163 0.5 20.3799 0.52636 20.4268 0.573242C20.4736 0.620127 20.5 0.683696 20.5 0.75V3.34375H0.5V0.75C0.5 0.683696 0.526358 0.620126 0.573242 0.573242C0.620126 0.526358 0.683696 0.5 0.75 0.5Z"
      stroke="black"
    />
  </Svg>
);
export default SVGComponent;
