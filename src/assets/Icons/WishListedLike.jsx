import * as React from "react";
import Svg, { Rect, Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={32}
    height={32}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <Rect width={32} height={32} rx={16} fill="black" />
    <Path
      d="M10.8732 11.4289C9.56049 12.7416 9.5605 14.8699 10.8732 16.1826L15.9648 21.2742L15.9998 21.2392L16.0348 21.2742L21.1264 16.1827C22.4391 14.8699 22.4391 12.7416 21.1264 11.4289C19.8137 10.1162 17.6854 10.1162 16.3727 11.4289C16.1667 11.6348 15.8329 11.6348 15.6269 11.4289C14.3142 10.1162 12.1859 10.1162 10.8732 11.4289Z"
      fill="white"
      stroke="white"
      strokeWidth={1.06667}
    />
  </Svg>
);
export default SVGComponent;
