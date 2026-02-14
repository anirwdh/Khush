import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={28}
    height={28}
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect x={0.5} y={0.5} width={27} height={27} rx={13.5} stroke="black" />
    <Path
      d="M8.8732 9.42899C7.56049 10.7417 7.5605 12.87 8.8732 14.1827L13.9648 19.2743L13.9998 19.2393L14.0348 19.2744L19.1264 14.1828C20.4391 12.8701 20.4391 10.7417 19.1264 9.42903C17.8137 8.11632 15.6854 8.11632 14.3727 9.42903C14.1667 9.63494 13.8329 9.6349 13.6269 9.42899C12.3142 8.11628 10.1859 8.11628 8.8732 9.42899Z"
      fill="black"
      stroke="black"
      strokeWidth={1.06667}
    />
  </Svg>
);
export default SVGComponent;
