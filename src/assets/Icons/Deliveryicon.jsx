import * as React from "react";
import Svg, { Path, Circle } from "react-native-svg";
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
      d="M13.5664 6.87109H18.0535L22.4884 11.2538V17.9844H20.4924"
      stroke="black"
    />
    <Path d="M8.55664 18.0889H15.2872" stroke="black" />
    <Circle cx={17.9491} cy={17.9843} r={2.4218} stroke="black" />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.05266 19.9061C7.11404 19.9061 7.97446 19.0457 7.97446 17.9843C7.97446 16.9229 7.11404 16.0625 6.05266 16.0625C4.99128 16.0625 4.13086 16.9229 4.13086 17.9843C4.13086 19.0457 4.99128 19.9061 6.05266 19.9061ZM6.05266 20.9061C7.66633 20.9061 8.97446 19.598 8.97446 17.9843C8.97446 16.3706 7.66633 15.0625 6.05266 15.0625C4.43899 15.0625 3.13086 16.3706 3.13086 17.9843C3.13086 19.598 4.43899 20.9061 6.05266 20.9061Z"
      fill="black"
    />
    <Path
      d="M1.49805 18.4932L1.49806 3.50098L13.5009 3.52347V17.9844H8.45218"
      stroke="black"
    />
    <Path d="M1.19922 17.9844H3.70361" stroke="black" />
  </Svg>
);
export default SVGComponent;
