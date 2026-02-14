import * as React from "react";
import Svg, { G, Path } from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    width={21}
    height={20}
    viewBox="0 0 21 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <G opacity={0.5}>
      <Path
        d="M3.21165 7.84092C3.66762 6.25077 4.6153 4.84578 5.91886 3.82733C7.22241 2.80888 8.81493 2.22925 10.4682 2.17152C12.1214 2.11379 13.7505 2.58092 15.1219 3.50595C16.4933 4.43099 17.5367 5.76645 18.1025 7.32093"
        stroke="black"
        strokeLinejoin="round"
      />
      <Path
        d="M17.9581 13.0451C17.3688 14.4417 16.387 15.6373 15.1317 16.487C13.8764 17.3366 12.4016 17.8038 10.886 17.8319C9.37047 17.86 7.87933 17.4478 6.59342 16.6452C5.30752 15.8426 4.28208 14.6842 3.64147 13.3104"
        stroke="black"
        strokeLinejoin="round"
      />
      <Path
        d="M7.16721 12.5203L3.45542 12.7633L2.07703 16.2941"
        stroke="black"
      />
      <Path
        d="M14.2305 7.80029L18.0852 7.79082L19.4013 4.28137"
        stroke="black"
      />
    </G>
  </Svg>
);
export default SVGComponent;
