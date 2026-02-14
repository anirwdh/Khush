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
      stroke="white"
    />
    <Path d="M8.55469 18.0889H15.2853" stroke="white" />
    <Circle cx={17.9491} cy={17.9843} r={2.4218} stroke="white" />
    <Path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.05071 19.9061C7.11209 19.9061 7.97251 19.0457 7.97251 17.9843C7.97251 16.9229 7.11209 16.0625 6.05071 16.0625C4.98933 16.0625 4.12891 16.9229 4.12891 17.9843C4.12891 19.0457 4.98933 19.9061 6.05071 19.9061ZM6.05071 20.9061C7.66437 20.9061 8.97251 19.598 8.97251 17.9843C8.97251 16.3706 7.66437 15.0625 6.05071 15.0625C4.43704 15.0625 3.12891 16.3706 3.12891 17.9843C3.12891 19.598 4.43704 20.9061 6.05071 20.9061Z"
      fill="white"
    />
    <Path
      d="M1.5 18.4932L1.50001 3.50098L13.5029 3.52347V17.9844H8.45413"
      stroke="white"
    />
    <Path d="M1.19922 17.9844H3.70361" stroke="white" />
  </Svg>
);
export default SVGComponent;
